import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Calendar, ShoppingBag, ArrowRight, Store, ArrowLeft, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useCartStore from '../../store/cartStore';
import * as bookingsService from '../../services/bookings.service';
import { toastSuccess, toastError } from '../../utils/toast';

// ── Helpers ──────────────────────────────────────────────────────────────────
function getUnitLabel(unit) {
  switch (unit) {
    case 'per_hour':   return 'hrs';
    case 'per_person': return 'guests';
    case 'per_day':    return 'days';
    case 'per_item':   return 'items';
    default:           return 'units';
  }
}

// ── Component ────────────────────────────────────────────────────────────────
function CustomerCart() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Cart state from Zustand (localStorage) — no API for reading cart
  const { items, removeItem, clearCart, getTotalCost } = useCartStore();
  const cartItems = items;
  const subtotal  = getTotalCost();

  // ── Remove item (local store only — no API) ───────────────────────────
  const handleRemove = (serviceId) => {
    removeItem(serviceId);
  };

  // ── Checkout mutation ─────────────────────────────────────────────────
  // Step 1: Create event plan
  // Step 2: Add each cart item to the plan
  // Step 3: Clear cart + redirect
  const checkoutMutation = useMutation({
    mutationFn: async () => {
      // Create the event plan (backend requires a 'name' field)
      const planRes = await bookingsService.createEventPlan({
        name: `My Event Plan (${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})`,
      });
      const planId = planRes?.data?.plan?.event_id;
      if (!planId) throw new Error('Failed to create event plan.');

      // Add each cart item to the plan sequentially to avoid race conditions
      for (const item of items) {
        await bookingsService.addItemToEventPlan(planId, {
          service_id: item.serviceId,
          quantity:   item.quantity ?? 1,
          event_date: item.eventDate ?? undefined,
        });
      }

      return planId;
    },
    onSuccess: () => {
      clearCart();
      queryClient.invalidateQueries({ queryKey: ['my-event-plans'] });
      toastSuccess('Your event plan has been created!');
      navigate('/customer/events');
    },
    onError: (err) => {
      const msg = err.response?.data?.error ?? err.message ?? 'Checkout failed. Please try again.';
      toastError(msg);
    },
  });

  // ── Empty State ──────────────────────────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center max-w-lg mx-auto">
        <div className="w-24 h-24 bg-[var(--color-gold)]/10 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={48} className="text-[var(--color-gold)]" />
        </div>
        <h1 className="text-3xl font-extrabold text-[var(--color-dark)] mb-3">Your cart is empty</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Looks like you haven't added any services to your event plan yet. Let's find the perfect services for your upcoming celebration.
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

  // ── Filled Cart ──────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-dark)]">Your Cart</h1>
        <p className="text-sm text-gray-500 mt-1">Review your selected services before checkout.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Cart Items */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {cartItems.map((item) => (
            <div key={item.serviceId} className="flex flex-col sm:flex-row gap-5 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative">

              <Link to={`/services/${item.serviceId}`} className="shrink-0 block">
                <img
                  src={item.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.title || 'S')}&background=E8C97A&color=fff`}
                  alt={item.title}
                  className="w-full sm:w-32 h-28 object-cover rounded-xl border border-gray-100"
                />
              </Link>

              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <Link
                      to={`/services/${item.serviceId}`}
                      className="text-lg font-bold text-[var(--color-dark)] hover:text-[var(--color-gold)] transition-colors truncate block"
                    >
                      {item.title}
                    </Link>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mt-1">
                      <Store size={14} /> {item.vendorName}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(item.serviceId)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                    aria-label="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="flex flex-wrap items-end justify-between gap-4 mt-4">
                  {item.eventDate && (
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                      <Calendar size={14} className="text-[var(--color-gold)]" />
                      <span className="text-sm font-semibold text-gray-700">{item.eventDate}</span>
                    </div>
                  )}

                  <div className="text-right ml-auto">
                    <div className="text-xs text-gray-400 mb-0.5">
                      {item.basePrice} JOD × {item.quantity} unit{item.quantity !== 1 ? 's' : ''}
                    </div>
                    <div className="text-lg font-extrabold text-[var(--color-dark)] leading-none">
                      {(item.basePrice * item.quantity).toLocaleString()} JOD
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

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
                <span className="font-semibold text-[var(--color-dark)]">{subtotal.toLocaleString()} JOD</span>
              </div>
              <div className="flex justify-between">
                <span>Service Fee</span>
                <span className="text-green-600 font-semibold">Free</span>
              </div>
            </div>

            <hr className="border-gray-100" />

            <div className="flex justify-between items-end">
              <span className="text-base font-bold text-[var(--color-dark)]">Total</span>
              <span className="text-2xl font-black text-[var(--color-dark)] leading-none">{subtotal.toLocaleString()} JOD</span>
            </div>

            <button
              onClick={() => checkoutMutation.mutate()}
              disabled={checkoutMutation.isPending || cartItems.length === 0}
              className="w-full py-4 bg-[var(--color-dark)] hover:bg-[#1a1a1a] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {checkoutMutation.isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Creating Plan...
                </>
              ) : (
                <>
                  Proceed to Checkout <ArrowRight size={18} />
                </>
              )}
            </button>

            <p className="text-xs text-center text-gray-400 -mt-2">
              You won't be charged yet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerCart;
