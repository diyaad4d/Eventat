import React, { useState } from 'react';
import { Calendar, DollarSign, MapPin, ChevronDown, ChevronUp, XCircle, Search, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as bookingsService from '../../services/bookings.service';
import { toastSuccess, toastError } from '../../utils/toast';

// ── Constants ───────────────────────────────────────────────────────────────
const TABS = ['All', 'Pending', 'Accepted', 'Paid', 'Rejected', 'Completed', 'Cancelled'];

const TAB_STATUS_MAP = {
  'All':       undefined,
  'Pending':   'pending',
  'Accepted':  'accepted',
  'Paid':      'paid',
  'Rejected':  'rejected',
  'Completed': 'completed',
  'Cancelled': 'cancelled',
};

// ── Helpers ─────────────────────────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return iso; }
}

function getStatusBadge(status) {
  switch (status) {
    case 'pending':   return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'accepted':  return 'bg-green-100 text-green-800 border-green-200';
    case 'rejected':  return 'bg-red-100 text-red-800 border-red-200';
    case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'cancelled': return 'bg-gray-100 text-gray-600 border-gray-200';
    default:          return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

// ── Skeleton row ─────────────────────────────────────────────────────────────
function BookingRowSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      <div className="p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
        <div className="w-full sm:w-28 h-24 rounded-xl bg-gray-200 shrink-0" />
        <div className="flex-1 w-full flex flex-col gap-3">
          <div className="h-5 bg-gray-200 rounded w-2/3" />
          <div className="h-3 bg-gray-100 rounded w-1/3" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 h-12" />
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────────────────
function CustomerBookings() {
  const [activeTab,   setActiveTab]   = useState('All');
  const [expandedId,  setExpandedId]  = useState(null);
  const queryClient = useQueryClient();

  const statusParam = TAB_STATUS_MAP[activeTab];

  // ── Main query ──────────────────────────────────────────────────────────
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['my-bookings', activeTab],
    queryFn:  () => bookingsService.getMyBookings({ status: statusParam, limit: 20 }),
    staleTime: 1000 * 60 * 2,
    placeholderData: (prev) => prev,
  });

  const bookings = data?.data?.bookings ?? [];

  // ── Cancel mutation ─────────────────────────────────────────────────────
  const cancelMutation = useMutation({
    mutationFn: (bookingId) => bookingsService.cancelBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      toastSuccess('Booking cancelled successfully.');
    },
    onError: (err) => {
      const msg = err.response?.data?.error ?? 'Failed to cancel booking.';
      toastError(msg);
    },
  });

  // ── Tab change ──────────────────────────────────────────────────────────
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setExpandedId(null);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-dark)]">My Bookings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your event reservations and history.</p>
      </div>

      {/* Subtle fetch indicator */}
      {isFetching && !isLoading && (
        <div className="h-0.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-[var(--color-gold)] rounded-full animate-pulse" style={{ width: '60%' }} />
        </div>
      )}

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 border-b border-gray-200" style={{ scrollbarWidth: 'none' }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`px-5 py-2.5 text-sm font-bold rounded-t-xl transition-colors whitespace-nowrap border-b-2 ${
              activeTab === tab
                ? 'border-[var(--color-gold)] text-[var(--color-gold)] bg-[var(--color-gold)]/5'
                : 'border-transparent text-gray-500 hover:text-[var(--color-dark)] hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="flex flex-col gap-4">
        {isLoading ? (
          <>
            <BookingRowSkeleton />
            <BookingRowSkeleton />
            <BookingRowSkeleton />
          </>
        ) : bookings.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
            <Search size={48} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-[var(--color-dark)]">No bookings found</h3>
            <p className="text-gray-500 text-sm mt-1">
              You don't have any {activeTab !== 'All' ? activeTab.toLowerCase() : ''} bookings.
            </p>
          </div>
        ) : (
          bookings.map(booking => {
            const isExpanded = expandedId === booking.event_item_id;
            const isCancelling = cancelMutation.isPending && cancelMutation.variables === booking.event_item_id;

            return (
              <div key={booking.event_item_id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md">

                {/* Card Header */}
                <div className="p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                  <img
                    src={booking.primary_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.service_title || 'S')}&background=E8C97A&color=fff`}
                    alt={booking.service_title}
                    className="w-full sm:w-28 h-24 object-cover rounded-xl shrink-0"
                  />

                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-1">
                      <h3 className="text-lg font-extrabold text-[var(--color-dark)] truncate pr-4">{booking.service_title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(booking.status)} capitalize`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 font-medium mb-3">by {booking.vendor_name}</p>

                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5"><Calendar size={14} className="text-gray-400" /> {formatDate(booking.event_date)}</div>
                      <div className="flex items-center gap-1.5"><MapPin size={14} className="text-gray-400" /> {booking.service_city || '—'}</div>
                      <div className="flex items-center gap-1.5 font-bold text-[var(--color-dark)]"><DollarSign size={14} className="text-[var(--color-gold)]" /> {parseFloat(booking.line_total || 0).toLocaleString()} JOD</div>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => cancelMutation.mutate(booking.event_item_id)}
                        disabled={isCancelling}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-60"
                      >
                        {isCancelling ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                        Cancel
                      </button>
                    )}
                    {booking.status === 'accepted' && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                        </span>
                        <span className="text-xs font-bold text-green-700">Go to My Events to pay</span>
                      </div>
                    )}
                    {booking.status === 'completed' && (
                      <Link
                        to={`/service/${booking.service_id}#reviews`}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-[var(--color-dark)] hover:bg-[#1a1a1a] shadow-sm transition-colors"
                      >
                        Write a Review
                      </Link>
                    )}
                  </div>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : booking.event_item_id)}
                    className="flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-[var(--color-gold)] transition-colors ml-auto"
                  >
                    {isExpanded ? 'Hide Details' : 'View Details'}
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-5 border-t border-gray-100 bg-white grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm animate-in fade-in slide-in-from-top-2">
                    <div>
                      <p className="text-gray-500 mb-1">Booking ID</p>
                      <p className="font-bold text-[var(--color-dark)]">#{booking.event_item_id}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Booking Placed On</p>
                      <p className="font-bold text-[var(--color-dark)]">{formatDate(booking.created_at)}</p>
                    </div>
                    {booking.vendor_note && (
                      <div className="sm:col-span-2">
                        <p className="text-gray-500 mb-1">Vendor Note</p>
                        <p className="font-medium text-[var(--color-dark)]">{booking.vendor_note}</p>
                      </div>
                    )}
                    <div className="sm:col-span-2 pt-3 mt-1 border-t border-gray-100">
                      <Link to={`/service/${booking.service_id}`} className="text-[var(--color-gold)] font-bold hover:underline">
                        View Service Page &rarr;
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default CustomerBookings;
