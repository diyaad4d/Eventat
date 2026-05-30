import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, AlertTriangle, Eye } from 'lucide-react';
import EmptyState from '../../components/shared/EmptyState';
import PageTransition from '../../components/shared/PageTransition';

const MOCK_SERVICES = [
  {
    id: 's1',
    title: 'Grand Royal Ballroom',
    category: 'Venue',
    price: 1500,
    pricingUnit: 'per_event',
    isActive: true,
    bookingsCount: 24,
    revenue: 67500,
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=150&q=80'
  },
  {
    id: 's2',
    title: 'Crystal Palace Venue',
    category: 'Venue',
    price: 200,
    pricingUnit: 'per_hour',
    isActive: true,
    bookingsCount: 8,
    revenue: 12000,
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=150&q=80'
  },
  {
    id: 's3',
    title: 'Outdoor Garden Setup',
    category: 'Decoration',
    price: 300,
    pricingUnit: 'per_event',
    isActive: false,
    bookingsCount: 0,
    revenue: 0,
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=150&q=80'
  }
];

function VendorServices() {
  const [services, setServices] = useState(MOCK_SERVICES);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showDeleteModal, setShowDeleteModal] = useState(null); // stores service id to delete
  const navigate = useNavigate();

  const categories = ['All', ...new Set(services.map(s => s.category))];

  const filteredServices = services.filter(srv =>
    (categoryFilter === 'All' || srv.category === categoryFilter) &&
    srv.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleStatus = (id) => {
    setServices(prev => prev.map(srv => 
      srv.id === id ? { ...srv, isActive: !srv.isActive } : srv
    ));
  };

  const confirmDelete = () => {
    setServices(prev => prev.filter(srv => srv.id !== showDeleteModal));
    setShowDeleteModal(null);
  };

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
            <button onClick={confirmDelete} className="w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors">
              Yes, Delete Service
            </button>
            <button onClick={() => setShowDeleteModal(null)} className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <EmptyState 
      variant="no-services" 
      onAction={() => navigate('/vendor/services/new')}
    />
  );

  return (
    <PageTransition className="w-full max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-dark)]">My Services</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your service listings, pricing, and availability.</p>
        </div>
        <Link to="/vendor/services/new" className="flex items-center gap-2 px-5 py-2.5 min-h-[44px] bg-[var(--color-gold)] text-white font-bold rounded-xl hover:bg-[var(--color-gold-dark)] shadow-sm transition-colors text-sm shrink-0">
          <Plus size={16} /> Add New Service
        </Link>
      </div>

      {services.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          {/* Search/Filter Bar */}
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-4 py-1.5 min-h-[44px] sm:min-h-0 rounded-lg text-xs font-bold transition-all ${categoryFilter === cat
                      ? 'bg-[var(--color-gold)] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {cat}
                  <span className="ml-1.5 opacity-70">
                    {cat === 'All' 
                      ? services.length 
                      : services.filter(s => s.category === cat).length}
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

          {/* Desktop Table View */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-500 bg-white">
                  <th className="p-4 pl-6">Service Detail</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4 text-center">Bookings</th>
                  <th className="p-4 text-right">Revenue</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredServices.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8">
                      <EmptyState variant="no-results" />
                    </td>
                  </tr>
                ) : (
                  filteredServices.map(srv => (
                    <tr key={srv.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-4">
                          <img src={srv.image} alt={srv.title} className="w-14 h-14 rounded-lg object-cover border border-gray-100 shrink-0" />
                          <span className="font-bold text-[var(--color-dark)] group-hover:text-[var(--color-gold)] transition-colors">{srv.title}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600 font-medium">
                        {srv.category}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        <span className="font-extrabold text-[var(--color-dark)]">{srv.price} JOD</span>
                        <span className="text-xs text-gray-400 block mt-0.5 capitalize">{srv.pricingUnit.replace('_', ' ')}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                          {srv.bookingsCount}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-bold text-emerald-600 text-sm">
                          {srv.revenue.toLocaleString()} JOD
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => toggleStatus(srv.id)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${srv.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                            aria-label="Toggle active status"
                          >
                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${srv.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/vendor/services/${srv.id}`} className="w-11 h-11 md:w-9 md:h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Preview Service" target="_blank">
                            <Eye size={16} />
                          </Link>
                          <Link to={`/vendor/services/${srv.id}/edit`} className="w-11 h-11 md:w-9 md:h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10 transition-colors" title="Edit Service">
                            <Edit2 size={16} />
                          </Link>
                          <button onClick={() => setShowDeleteModal(srv.id)} className="w-11 h-11 md:w-9 md:h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete Service">
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
