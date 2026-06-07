import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, DollarSign, Plus, ArrowLeft, X, ShoppingBag, Loader2, Package } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Badge from '../../components/ui/Badge';
import * as bookingsService from '../../services/bookings.service';
import { toastSuccess, toastError } from '../../utils/toast';

// ── Constants ────────────────────────────────────────────────────────────────
const EVENT_TYPES = ['Wedding', 'Graduation', 'Gender Reveal', 'Corporate', 'General'];

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return iso; }
}

function planStatusVariant(status) {
  switch (status) {
    case 'draft':      return 'gray';
    case 'submitted':  return 'info';
    case 'confirmed':  return 'success';
    case 'completed':  return 'success';
    case 'cancelled':  return 'error';
    default:           return 'gray';
  }
}

function itemStatusVariant(status) {
  switch (status) {
    case 'accepted':  return 'success';
    case 'pending':   return 'warning';
    case 'rejected':  return 'error';
    case 'completed': return 'info';
    case 'cancelled': return 'error';
    default:          return 'gray';
  }
}

// ── Skeletons ────────────────────────────────────────────────────────────────
function PlanCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-pulse flex flex-col gap-4 h-52">
      <div className="flex justify-between">
        <div className="h-5 bg-gray-200 rounded-full w-20" />
        <div className="h-5 bg-gray-200 rounded-full w-16" />
      </div>
      <div className="h-6 bg-gray-200 rounded w-3/4" />
      <div className="flex flex-col gap-2">
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-2/5" />
      </div>
      <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between">
        <div className="h-4 bg-gray-200 rounded w-16" />
        <div className="h-4 bg-gray-100 rounded w-16" />
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-gray-200" />
        <div className="flex flex-col gap-2">
          <div className="h-7 bg-gray-200 rounded w-64" />
          <div className="h-4 bg-gray-100 rounded w-40" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-4">
          {[1,2].map(i => (
            <div key={i} className="flex gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm items-center">
              <div className="w-24 h-24 rounded-xl bg-gray-200 shrink-0" />
              <div className="flex-1 flex flex-col gap-2">
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-48" />
      </div>
    </div>
  );
}

// ── Modal ────────────────────────────────────────────────────────────────────
function CreatePlanModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({ name: '', eventType: 'Wedding' });
  const createPlanMutation = useMutation({
    mutationFn: (data) => bookingsService.createEventPlan(data),
    onSuccess: (res) => {
      toastSuccess('Event plan created!');
      onSuccess(res?.data?.plan?.event_id);
      onClose();
    },
    onError: (err) => {
      const msg = err.response?.data?.error ?? 'Failed to create event plan.';
      toastError(msg);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) { toastError('Plan name is required.'); return; }
    createPlanMutation.mutate({ name: formData.name.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-extrabold text-[var(--color-dark)]">Create New Event Plan</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Event Type</label>
            <select
              value={formData.eventType}
              onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition-all"
            >
              {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Event Title / Plan Name</label>
            <input
              type="text"
              placeholder="e.g., Sarah's Wedding"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition-all"
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors">Cancel</button>
            <button
              type="submit"
              disabled={createPlanMutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-[var(--color-gold)] text-white hover:bg-[var(--color-gold-dark)] shadow-sm transition-colors disabled:opacity-70"
            >
              {createPlanMutation.isPending && <Loader2 size={16} className="animate-spin" />}
              Create Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
function CustomerEvents() {
  const [view,           setView]           = useState('list');
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [isModalOpen,    setIsModalOpen]    = useState(false);
  const queryClient = useQueryClient();

  // ── Plans list query ────────────────────────────────────────────────────
  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: ['my-event-plans'],
    queryFn:  () => bookingsService.getMyEventPlans(),
    staleTime: 1000 * 60 * 2,
  });
  const eventPlans = plansData?.data?.plans ?? [];

  // ── Single plan detail query ────────────────────────────────────────────
  const { data: planDetailData, isLoading: planLoading } = useQuery({
    queryKey: ['event-plan', selectedPlanId],
    queryFn:  () => bookingsService.getEventPlanById(selectedPlanId),
    enabled:  !!selectedPlanId && view === 'detail',
    staleTime: 1000 * 60 * 2,
  });
  const selectedPlan = planDetailData?.data?.plan ?? null;
  const planItems    = selectedPlan?.items ?? [];

  // ── Cancel plan mutation ───────────────────────────────────────────────
  const cancelPlanMutation = useMutation({
    mutationFn: (planId) => bookingsService.deleteEventPlan(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-event-plans'] });
      setView('list');
      setSelectedPlanId(null);
      toastSuccess('Event plan cancelled.');
    },
    onError: (err) => {
      toastError(err.response?.data?.error ?? 'Failed to cancel plan.');
    },
  });

  // ── Remove item mutation ───────────────────────────────────────────────
  const removeItemMutation = useMutation({
    mutationFn: ({ planId, itemId }) => bookingsService.removeItemFromEventPlan(planId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-plan', selectedPlanId] });
      toastSuccess('Service removed from plan.');
    },
    onError: (err) => {
      toastError(err.response?.data?.error ?? 'Failed to remove service.');
    },
  });

  // ── After create → navigate to detail ─────────────────────────────────
  const handlePlanCreated = (newPlanId) => {
    queryClient.invalidateQueries({ queryKey: ['my-event-plans'] });
    if (newPlanId) {
      setSelectedPlanId(newPlanId);
      setView('detail');
    }
  };

  // ── Detail View ───────────────────────────────────────────────────────
  const renderDetailView = () => {
    if (planLoading) return <DetailSkeleton />;
    if (!selectedPlan) return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Plan not found.</p>
        <button onClick={() => setView('list')} className="mt-4 text-[var(--color-gold)] font-bold hover:underline">← Back to events</button>
      </div>
    );

    return (
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={() => { setView('list'); setSelectedPlanId(null); }}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:text-[var(--color-gold)] hover:border-[var(--color-gold)] transition-all shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-dark)]">{selectedPlan.name}</h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
              <Badge variant={planStatusVariant(selectedPlan.status)} size="sm" className="capitalize">{selectedPlan.status}</Badge>
              <span>•</span>
              <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(selectedPlan.created_at)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Col — Services */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-[var(--color-dark)]">Added Services</h2>
            {planItems.length === 0 ? (
              <div className="p-8 text-center bg-white border border-gray-100 rounded-2xl shadow-sm">
                <p className="text-gray-500 mb-4">No services added to this event plan yet.</p>
                <Link to="/services" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-gold)] text-white font-bold hover:bg-[var(--color-gold-dark)] transition-colors">
                  <Plus size={18} /> Browse Services
                </Link>
              </div>
            ) : (
              <>
                {planItems.map(item => {
                  const isRemoving = removeItemMutation.isPending && removeItemMutation.variables?.itemId === item.event_item_id;
                  return (
                    <div key={item.event_item_id} className="flex flex-col sm:flex-row gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm items-center">
                      <img
                        src={item.primary_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.service_title || 'S')}&background=E8C97A&color=fff`}
                        alt={item.service_title}
                        className="w-full sm:w-24 h-24 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0 text-center sm:text-left">
                        <h3 className="font-bold text-[var(--color-dark)] truncate">{item.service_title}</h3>
                        <p className="text-sm text-gray-500">{item.vendor_name}</p>
                        {item.event_date && (
                          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1 justify-center sm:justify-start">
                            <Calendar size={12} /> {formatDate(item.event_date)}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-center sm:items-end shrink-0 gap-2">
                        <span className="font-extrabold text-[var(--color-dark)]">{parseFloat(item.line_total || 0).toLocaleString()} JOD</span>
                        <Badge variant={itemStatusVariant(item.status)} size="sm" className="capitalize">{item.status}</Badge>
                        {selectedPlan.status === 'draft' && (
                          <button
                            onClick={() => removeItemMutation.mutate({ planId: selectedPlan.event_id, itemId: item.event_item_id })}
                            disabled={isRemoving}
                            className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                          >
                            {isRemoving ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                <Link to="/services" className="mt-2 flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-gray-300 text-gray-500 font-bold hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-colors bg-gray-50/50 hover:bg-white">
                  <Plus size={18} /> Add Another Service
                </Link>
              </>
            )}
          </div>

          {/* Right Col — Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-6">
              <h2 className="text-lg font-bold text-[var(--color-dark)]">Cost Breakdown</h2>
              <div className="flex flex-col gap-3 text-sm text-gray-600">
                <div className="flex justify-between"><span>Subtotal</span><span>{parseFloat(selectedPlan.estimated_total_cost || 0).toLocaleString()} JOD</span></div>
                <div className="flex justify-between"><span>Service Fee</span><span>Included</span></div>
                <hr className="border-gray-100" />
                <div className="flex justify-between text-lg font-extrabold text-[var(--color-dark)]">
                  <span>Total Estimated</span><span>{parseFloat(selectedPlan.estimated_total_cost || 0).toLocaleString()} JOD</span>
                </div>
              </div>
              {selectedPlan.status === 'draft' && (
                <>
                  <button className="w-full py-3.5 rounded-xl bg-[var(--color-dark)] text-white font-bold hover:bg-[#1a1a1a] shadow-md transition-all">
                    Submit Event Plan
                  </button>
                  <button
                    onClick={() => cancelPlanMutation.mutate(selectedPlan.event_id)}
                    disabled={cancelPlanMutation.isPending}
                    className="w-full py-3 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {cancelPlanMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                    Cancel Plan
                  </button>
                </>
              )}
              <p className="text-xs text-center text-gray-500 -mt-2">Submitting will send requests to all selected vendors.</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── List View ─────────────────────────────────────────────────────────
  const renderListView = () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-dark)]">My Events</h1>
          <p className="text-sm text-gray-500 mt-1">Plan and manage your upcoming events.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[var(--color-gold)] text-white font-bold hover:bg-[var(--color-gold-dark)] shadow-sm transition-all shrink-0"
        >
          <Plus size={18} /> Create New Plan
        </button>
      </div>

      {plansLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <PlanCardSkeleton /><PlanCardSkeleton /><PlanCardSkeleton />
        </div>
      ) : eventPlans.length === 0 ? (
        <div className="py-16 flex flex-col items-center text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Package size={56} className="text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-[var(--color-dark)]">No event plans yet</h3>
          <p className="text-gray-500 text-sm mt-1 mb-6">Create your first event plan to start booking services.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-gold)] text-white font-bold hover:bg-[var(--color-gold-dark)] shadow-sm transition-all"
          >
            <Plus size={18} /> Create New Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {eventPlans.map(plan => (
            <div
              key={plan.event_id}
              onClick={() => { setSelectedPlanId(plan.event_id); setView('detail'); }}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                <Badge variant="gold" size="sm">Plan</Badge>
                <Badge variant={planStatusVariant(plan.status)} size="sm" className="capitalize">{plan.status}</Badge>
              </div>
              <h3 className="text-lg font-bold text-[var(--color-dark)] mb-4 group-hover:text-[var(--color-gold)] transition-colors line-clamp-1">{plan.name}</h3>

              <div className="flex flex-col gap-2 text-sm text-gray-600 mb-6 flex-1">
                <div className="flex items-center gap-2"><Calendar size={15} className="text-gray-400" /> Created {formatDate(plan.created_at)}</div>
                <div className="flex items-center gap-2"><Users size={15} className="text-gray-400" /> {plan.items_count ?? 0} service{plan.items_count !== 1 ? 's' : ''}</div>
                {plan.confirmed_count > 0 && (
                  <div className="flex items-center gap-2 text-green-600"><MapPin size={15} /> {plan.confirmed_count} confirmed</div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                <div className="flex items-center gap-1.5 font-extrabold text-[var(--color-dark)]">
                  <DollarSign size={16} className="text-[var(--color-gold)]" />
                  {parseFloat(plan.estimated_total_cost || 0).toLocaleString()} JOD
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                  <ShoppingBag size={15} /> {plan.items_count ?? 0} items
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full">
      {view === 'list' ? renderListView() : renderDetailView()}
      {isModalOpen && (
        <CreatePlanModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={handlePlanCreated}
        />
      )}
    </div>
  );
}

export default CustomerEvents;
