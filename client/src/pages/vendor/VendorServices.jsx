import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, AlertTriangle, Eye, RefreshCw } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import EmptyState from '../../components/shared/EmptyState';
import PageTransition from '../../components/shared/PageTransition';
import vendorService from '../../services/vendor.service';
import { toastSuccess, toastError } from '../../utils/toast';

// ── Skeleton row ──────────────────────────────────────────────────────────────
function TableRowSkeleton() {
  return (
    <tr className="border-b border-gray-50 animate-pulse">
      <td className="p-4 pl-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-lg bg-gray-200 shrink-0" />
          <div className="h-4 bg-gray-200 rounded w-40" />
        </div>
      </td>
      <td className="p-4"><div className="h-4 bg-gray-100 rounded w-20" /></td>
      <td className="p-4"><div className="h-4 bg-gray-100 rounded w-24" /></td>
      <td className="p-4 text-center"><div className="h-5 w-10 bg-gray-100 rounded-full mx-auto" /></td>
      <td className="p-4 text-right"><div className="h-4 bg-gray-100 rounded w-20 ml-auto" /></td>
      <td className="p-4 text-center"><div className="h-6 w-11 bg-gray-200 rounded-full mx-auto" /></td>
      <td className="p-4 pr-6 text-right"><div className="h-8 bg-gray-100 rounded w-20 ml-auto" /></td>
    </tr>
  );
}

function VendorServices() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchTerm,      setSearchTerm]      = useState('');
  const [categoryFilter,  setCategoryFilter]  = useState('All');
  const [showDeleteModal, setShowDeleteModal] = useState(null); // service_id to delete

  // ── Query ──────────────────────────────────────────────────────────────────
  const { data: servicesData, isLoading, isError } = useQuery({
    queryKey: ['vendor-services'],
    queryFn:  () => vendorService.getMyServices(),
    staleTime: 1000 * 30,
  });

  const services = servicesData?.services ?? [];

  // ── Toggle Status mutation (optimistic) ───────────────────────────────────
  const toggleMutation = useMutation({
    mutationFn: ({ serviceId, is_active }) => vendorService.toggleServiceStatus(serviceId, is_active),

    // Optimistic update
    onMutate: async ({ serviceId, is_active }) => {
      await queryClient.cancelQueries({ queryKey: ['vendor-services'] });
      const previous = queryClient.getQueryData(['vendor-services']);
      queryClient.setQueryData(['vendor-services'], (old) => {
        if (!old?.services) return old;
        return {
          ...old,
          services: old.services.map((s) =>
            s.service_id === serviceId ? { ...s, is_active } : s,
          ),
        };
      });
      return { previous };
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(['vendor-services'], context?.previous);
      toastError(err.response?.data?.error ?? 'Failed to update status.');
    },
    onSuccess: (data, { is_active }) => {
      toastSuccess(is_active ? 'Service activated.' : 'Service deactivated.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-services'] });
    },
  });

  const handleToggle = (serviceId, currentIsActive) => {
    toggleMutation.mutate({ serviceId, is_active: !currentIsActive });
  };

  // ── Delete mutation ────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (serviceId) => vendorService.deleteService(serviceId),
    onSuccess: () => {
      toastSuccess('Service deleted.');
      queryClient.invalidateQueries({ queryKey: ['vendor-services'] });
      setShowDeleteModal(null);
    },
    onError: (err) => {
      toastError(err.response?.data?.error ?? 'Failed to delete service.');
      setShowDeleteModal(null);
    },
  });

  const handleConfirmDelete = () => {
    if (showDeleteModal) deleteMutation.mutate(showDeleteModal);
  };

  // ── Filtering ──────────────────────────────────────────────────────────────
  const categories = ['All', ...new Set(services.map((s) => s.category_name).filter(Boolean))];

  const filteredServices = services.filter((srv) => {
    const matchCat = categoryFilter === 'All' || srv.category_name === categoryFilter;
    const matchSearch = !searchTerm || srv.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  // ── Delete Modal ───────────────────────────────────────────────────────────
  const renderDeleteModal = () => (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-extrabold text-[var(--color-dark)] mb-2">Delete Service?</h2>
          <p className="text-gray-500 mb-6 text-sm">This action cannot be undone. Are you sure you want to remove this service from your listings?</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-60"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Yes, Delete Service'}
            </button>
            <button onClick={() => setShowDeleteModal(null)} className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <PageTransition className="w-full max-w-7xl mx-auto pb-12">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-dark)]">My Services</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your service listings, pricing, and availability.</p>
        </div>
        <Link
          to="/vendor/services/new"
          className="flex items-center gap-2 px-5 py-2.5 min-h-[44px] bg-[var(--color-gold)] text-white font-bold rounded-xl hover:bg-[var(--color-gold-dark)] shadow-sm transition-colors text-sm shrink-0"
        >
          <Plus size={16} /> Add New Service
        </Link>
      </div>

      {/* Error */}
      {isError && !isLoading && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm font-semibold">
          <AlertTriangle size={16} className="shrink-0" />
          Failed to load services.
          <button onClick={() => queryClient.invalidateQueries({ queryKey: ['vendor-services'] })} className="ml-auto flex items-center gap-1 underline text-red-600">
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      )}

      {/* Empty state (after load, no services at all) */}
      {!isLoading && !isError && services.length === 0 ? (
        <EmptyState variant="no-services" onAction={() => navigate('/vendor/services/new')} />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">

          {/* Search/Filter Bar */}
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-4 py-1.5 min-h-[44px] sm:min-h-0 rounded-lg text-xs font-bold transition-all ${
                    categoryFilter === cat
                      ? 'bg-[var(--color-gold)] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                  <span className="ml-1.5 opacity-70">
                    {cat === 'All'
                      ? services.length
                      : services.filter((s) => s.category_name === cat).length}
                  </span>
                </button>
              ))}
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 min-h-[44px] border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition-all text-sm"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-500 bg-white">
                  <th className="p-4 pl-6">Service Detail</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4 text-center">Bookings</th>
                  <th className="p-4 text-right">Rating</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  [1, 2, 3].map((i) => <TableRowSkeleton key={i} />)
                ) : filteredServices.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8">
                      <EmptyState variant="no-results" />
                    </td>
                  </tr>
                ) : (
                  filteredServices.map((srv) => (
                    <tr key={srv.service_id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-4">
                          {srv.primary_image_url ? (
                            <img
                              src={srv.primary_image_url}
                              alt={srv.title}
                              className="w-14 h-14 rounded-lg object-cover border border-gray-100 shrink-0"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 text-gray-400 text-xs font-bold">
                              No img
                            </div>
                          )}
                          <span className="font-bold text-[var(--color-dark)] group-hover:text-[var(--color-gold)] transition-colors">
                            {srv.title}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600 font-medium">
                        {srv.category_name ?? '—'}
                        {srv.subcategory_name && (
                          <span className="block text-xs text-gray-400">{srv.subcategory_name}</span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        <span className="font-extrabold text-[var(--color-dark)]">{Number(srv.base_price).toLocaleString()} JOD</span>
                        <span className="text-xs text-gray-400 block mt-0.5 capitalize">{(srv.pricing_unit ?? '').replace('_', ' ')}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                          {srv.confirmed_bookings ?? srv.total_bookings ?? 0}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {srv.avg_rating && Number(srv.avg_rating) > 0 ? (
                          <span className="flex items-center justify-end gap-1 text-sm font-bold text-amber-600">
                            ★ {Number(srv.avg_rating).toFixed(1)}
                            <span className="text-gray-400 text-xs font-normal">({srv.review_count ?? 0})</span>
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">No reviews</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleToggle(srv.service_id, srv.is_active)}
                            disabled={toggleMutation.isPending && toggleMutation.variables?.serviceId === srv.service_id}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-60 ${
                              srv.is_active ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                            aria-label="Toggle active status"
                          >
                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${srv.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/services/${srv.service_id}`}
                            target="_blank"
                            className="w-11 h-11 md:w-9 md:h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Preview Service"
                          >
                            <Eye size={16} />
                          </Link>
                          <Link
                            to={`/vendor/services/${srv.service_id}/edit`}
                            className="w-11 h-11 md:w-9 md:h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10 transition-colors"
                            title="Edit Service"
                          >
                            <Edit2 size={16} />
                          </Link>
                          <button
                            onClick={() => setShowDeleteModal(srv.service_id)}
                            className="w-11 h-11 md:w-9 md:h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Service"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showDeleteModal && renderDeleteModal()}
    </PageTransition>
  );
}

export default VendorServices;
