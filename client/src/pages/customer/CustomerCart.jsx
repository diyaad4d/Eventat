import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Calendar, ShoppingBag, ArrowRight, Store, ArrowLeft, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as bookingsService from '../../services/bookings.service';
import { toastSuccess, toastError } from '../../utils/toast';

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  } catch { return iso; }
}

// ── Skeleton ─────────────────────────────────────────────────────────────────
function CartSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row gap-5 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm animate-pulse">
      <div className="w-full sm:w-32 h-28 rounded-xl bg-gray-200 shrink-0" />
      <div className="flex-1 flex flex-col gap-3">
        <div className="h-5 bg-gray-200 rounded w-2/3" />
        <div className="h-3 bg-gray-100 rounded w-1/3" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────────────────
function CustomerCart() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedPlanId, setSelectedPlanId] = React.useState(null);

  // ── Fetch draft plans from backend ────────────────────────────────────
  // The cart IS the user's first draft event plan.
  // Schema: event_plans (PK: event_id, status: 'draft')
  //         event_plan_items (PK: event_item_id, FK: event_id → event_plans)
  const { data: plansData, isLoading } = useQuery({
    queryKey: ['my-event-plans', 'draft'],
    queryFn:  () => bookingsService.getMyEventPlans({ status: 'draft' }),
    staleTime: 1000 * 30,
  });

  const draftPlans = plansData?.data?.plans ?? [];
  const activePlan = draftPlans.find(p => p.event_id.toString() === selectedPlanId?.toString()) || draftPlans[0] || null;

  // Fetch full plan detail to get items with line_total etc.
  const { data: planDetailData, isLoading: planDetailLoading } = useQuery({
    queryKey: ['event-plan-detail', activePlan?.event_id],
    queryFn:  () => bookingsService.getEventPlanById(activePlan.event_id),
    enabled:  !!activePlan?.event_id,
    staleTime: 1000 * 30,
  });

  // Items from the detailed plan response (includes line_total, unit_price_at_time etc.)
  const cartItems = planDetailData?.data?.plan?.items ?? [];

  // Sum of line_total (price-protected at booking time)
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.line_total ?? 0),
    0,
  );

  // ── Remove item from plan ─────────────────────────────────────────────
  const removeItemMutation = useMutation({
    mutationFn: ({ planId, itemId }) =>
      bookingsService.removeItemFromEventPlan(planId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-event-plans'] });
      queryClient.invalidateQueries({ queryKey: ['event-plan-detail', activePlan?.event_id] });
      toastSuccess('Item removed from cart.');
    },
    onError: (err) => {
      toastError(err.response?.data?.error ?? 'Failed to remove item.');
    },
  });

  const handleRemove = (itemId) => {
    if (!activePlan) return;
    removeItemMutation.mutate({ planId: activePlan.event_id, itemId });
  };

  // ── Checkout: submit the draft plan → vendors get notified ────────────
  // Schema: changes event_plans.status from 'draft' → 'submitted'
  //         event_plan_items.vendor_item_status remain 'pending' awaiting vendor response
  const checkoutMutation = useMutation({
    mutationFn: () => bookingsService.submitEventPlan(activePlan.event_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-event-plans'] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      toastSuccess('Order submitted! Vendors will respond shortly.');
      navigate('/customer/bookings');
    },
    onError: (err) => {
      toastError(err.response?.data?.error ?? 'Checkout failed. Please try again.');
    },
  });

  const handleCheckout = () => {
    if (!activePlan) return;
    if (cartItems.length === 0) {
      toastError('Your cart is empty.');
      return;
    }
    checkoutMutation.mutate();
  };

  // ── Loading state ─────────────────────────────────────────────────────
  const isPageLoading = isLoading || planDetailLoading;

  // ── Empty State ───────────────────────────────────────────────────────
  if (!isPageLoading && cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center max-w-lg mx-auto">
        <div className="w-24 h-24 bg-[var(--color-gold)]/10 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={48} className="text-[var(--color-gold)]" />
        </div>
        <h1 className="text-3xl font-extrabold text-[var(--color-dark)] mb-3">Your cart is empty</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Looks like you haven't added any services to your event plan yet.
          Let's find the perfect services for your upcoming celebration.
        </p>
        <Link
          to="/services"
          className="flex items-center gap-2 px-8 py-3.5 bg-[var(--color-gold)] text-white font-bold rounded-xl hover:bg-[var(--color-gold-dark)] shadow-[0_4px_14px_rgba(201,162,77,0.3)] transition-all"
        >
          Browse Services <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  // ── Filled Cart ───────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-dark)]">Your Cart</h1>
          <p className="text-sm text-gray-500 mt-1">Review your selected services before checkout.</p>
        </div>
        
        {draftPlans.length > 0 && (
          <div className="flex items-center gap-3">
            <label className="text-sm font-bold text-gray-700 whitespace-nowrap">Active Plan:</label>
            <select
              value={activePlan?.event_id || ''}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-gold)] font-semibold text-[var(--color-dark)] transition-all min-w-[200px]"
            >
              {draftPlans.map(plan => (
                <option key={plan.event_id} value={plan.event_id}>
                  {plan.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Cart Items */}
        <div className="lg:col-span-8 flex flex-col gap-4">

          {isPageLoading ? (
            <>
              <CartSkeleton />
              <CartSkeleton />
            </>
          ) : (
            cartItems.map((item) => {
              const isRemoving = removeItemMutation.isPending &&
                removeItemMutation.variables?.itemId === item.event_item_id;

              return (
                <div
                  key={item.event_item_id}
                  className="flex flex-col sm:flex-row gap-5 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative"
                >
                  <Link to={`/service/${item.service_id}`} className="shrink-0 block">
                    <img
                      src={item.primary_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.service_title || 'S')}&background=E8C97A&color=fff`}
                      alt={item.service_title}
                      className="w-full sm:w-32 h-28 object-cover rounded-xl border border-gray-100"
                    />
                  </Link>

                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <Link
                          to={`/service/${item.service_id}`}
                          className="text-lg font-bold text-[var(--color-dark)] hover:text-[var(--color-gold)] transition-colors truncate block"
                        >
                          {item.service_title}
                        </Link>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mt-1">
                          <Store size={14} /> {item.vendor_name}
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemove(item.event_item_id)}
                        disabled={isRemoving}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0 disabled:opacity-50"
                        aria-label="Remove item"
                      >
                        {isRemoving ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                      </button>
                    </div>

                    <div className="flex flex-wrap items-end justify-between gap-4 mt-4">
                      {item.event_date && (
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                          <Calendar size={14} className="text-[var(--color-gold)]" />
                          <span className="text-sm font-semibold text-gray-700">{formatDate(item.event_date)}</span>
                        </div>
                      )}

                      <div className="text-right ml-auto">
                        <div className="text-xs text-gray-400 mb-0.5">
                          {parseFloat(item.unit_price_at_time || 0).toLocaleString()} JOD
                          {item.quantity > 1 ? ` × ${item.quantity}` : ''}
                        </div>
                        <div className="text-lg font-extrabold text-[var(--color-dark)] leading-none">
                          {parseFloat(item.line_total || 0).toLocaleString()} JOD
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          <div className="mt-4">
            <Link to="/services" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[var(--color-gold)] transition-colors">
              <ArrowLeft size={16} /> Continue Shopping
            </Link>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 bg-white p-6 sm:p-8 rounded-2xl border border-[var(--color-gold)]/30 shadow-[0_8px_30px_rgba(201,162,77,0.08)] flex flex-col gap-6">
            <h2 className="text-xl font-extrabold text-[var(--color-dark)]">Order Summary</h2>

            <div className="flex flex-col gap-4 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})</span>
                <span className="font-semibold text-[var(--color-dark)]">{cartTotal.toLocaleString()} JOD</span>
              </div>
              <div className="flex justify-between">
                <span>Service Fee</span>
                <span className="text-green-600 font-semibold">Free</span>
              </div>
            </div>

            <hr className="border-gray-100" />

            <div className="flex justify-between items-end">
              <span className="text-base font-bold text-[var(--color-dark)]">Total</span>
              <span className="text-2xl font-black text-[var(--color-dark)] leading-none">{cartTotal.toLocaleString()} JOD</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={checkoutMutation.isPending || cartItems.length === 0 || isPageLoading}
              className="w-full py-4 bg-[var(--color-dark)] hover:bg-[#1a1a1a] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {checkoutMutation.isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  Proceed to Checkout <ArrowRight size={18} />
                </>
              )}
            </button>

            <p className="text-xs text-center text-gray-400 -mt-2">
              Submitting sends requests to all vendors. You won't be charged yet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerCart;
