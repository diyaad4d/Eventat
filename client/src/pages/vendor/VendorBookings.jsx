import React, { useState } from 'react';
import {
  Calendar, Users, DollarSign, MessageSquare,
  CheckCircle2, Clock, ChevronDown, ChevronUp, Search, XCircle, AlertTriangle,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import EmptyState from '../../components/shared/EmptyState';
import PageTransition from '../../components/shared/PageTransition';
import vendorService from '../../services/vendor.service';
import { toastSuccess, toastError } from '../../utils/toast';

// ─────────────────────────────────────────────────────────────
// Tab configuration
// vendor_item_status ENUM: pending | accepted | rejected | completed | cancelled
// UI Label → API status value
// ─────────────────────────────────────────────────────────────
const TABS = [
  { label: 'Incoming',  apiStatus: 'pending'   },
  { label: 'Confirmed', apiStatus: 'accepted'  },
  { label: 'Completed', apiStatus: 'completed' },
  { label: 'Cancelled', apiStatus: 'rejected'  }, // includes both rejected + cancelled
];

// ── Skeleton ──────────────────────────────────────────────────────────────────
function BookingCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      <div className="p-5 md:p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex items-start gap-4 md:w-1/3 shrink-0">
            <div className="w-14 h-14 rounded-full bg-gray-200 shrink-0" />
            <div className="flex flex-col gap-2 flex-1">
              <div className="h-5 bg-gray-200 rounded w-32" />
              <div className="h-3 bg-gray-100 rounded w-24" />
              <div className="flex gap-2">
                <div className="h-5 w-16 rounded-md bg-gray-200" />
              </div>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex flex-col gap-1">
                <div className="h-3 bg-gray-100 rounded w-20" />
                <div className="h-4 bg-gray-200 rounded w-28" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="px-5 py-3 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between gap-4">
        <div className="flex gap-2">
          <div className="h-9 w-24 rounded-xl bg-gray-200" />
          <div className="h-9 w-24 rounded-xl bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
function VendorBookings() {
  const queryClient = useQueryClient();
  const [activeTabIndex, setActiveTabIndex] = useState(0); // index into TABS
  const [expandedId,     setExpandedId]     = useState(null);
  const [searchTerm,     setSearchTerm]     = useState('');

  const activeTab = TABS[activeTabIndex];

  // ── Query ──────────────────────────────────────────────────────────────────
  const { data, isLoading, isError } = useQuery({
    queryKey: ['vendor-bookings', activeTab.apiStatus],
    queryFn:  () => vendorService.getMyBookings({ status: activeTab.apiStatus }),
    staleTime: 1000 * 30,
  });

  // Also fetch summary (all statuses at once) for tab counts
  const { data: summaryData } = useQuery({
    queryKey: ['vendor-bookings-summary'],
    queryFn:  () => vendorService.getMyBookings({}),
    staleTime: 1000 * 60,
  });

  const bookings = data?.bookings ?? [];
  const summary  = summaryData?.summary ?? {};

  // Tab count mapping
  const tabCount = (tab) => {
    if (tab.apiStatus === 'pending')   return summary.pending   ?? 0;
    if (tab.apiStatus === 'accepted')  return summary.accepted  ?? 0;
    if (tab.apiStatus === 'completed') return summary.completed ?? 0;
    if (tab.apiStatus === 'rejected')  return (summary.rejected ?? 0) + (summary.cancelled ?? 0);
    return 0;
  };

  // ── Accept mutation ────────────────────────────────────────────────────────
  const acceptMutation = useMutation({
    mutationFn: (itemId) => vendorService.acceptBooking(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-bookings-summary'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-analytics'] });
      toastSuccess('Booking accepted! ✓');
    },
    onError: (err) => {
      toastError(err.response?.data?.error ?? 'Failed to accept booking.');
    },
  });

  // ── Reject mutation ────────────────────────────────────────────────────────
  const rejectMutation = useMutation({
    mutationFn: ({ itemId, reason }) => vendorService.rejectBooking(itemId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-bookings-summary'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-analytics'] });
      toastSuccess('Booking rejected.');
    },
    onError: (err) => {
      toastError(err.response?.data?.error ?? 'Failed to reject booking.');
    },
  });

  // ── Search filter (client-side over loaded page) ───────────────────────────
  const filteredBookings = bookings.filter((b) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      (b.customer_name ?? '').toLowerCase().includes(q) ||
      (b.service_title ?? '').toLowerCase().includes(q) ||
      String(b.event_item_id).includes(q)
    );
  });

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <PageTransition className="w-full max-w-5xl mx-auto pb-12">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-dark)]">Booking Requests</h1>
        <p className="text-sm text-gray-500 mt-1">Review and manage your incoming and past client bookings.</p>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 border-b border-gray-200 mb-6" style={{ scrollbarWidth: 'none' }}>
        {TABS.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => { setActiveTabIndex(i); setExpandedId(null); }}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-t-xl transition-colors whitespace-nowrap border-b-2 ${
              i === activeTabIndex
                ? 'border-[var(--color-gold)] text-[var(--color-gold)] bg-[var(--color-gold)]/5'
                : 'border-transparent text-gray-500 hover:text-[var(--color-dark)] hover:bg-gray-50'
            }`}
          >
            {tab.label}
            <span className={`px-2 py-0.5 rounded-full text-xs ${i === activeTabIndex ? 'bg-[var(--color-gold)]/20 text-[var(--color-gold-dark)]' : 'bg-gray-100 text-gray-500'}`}>
              {isLoading ? '…' : tabCount(tab)}
            </span>
          </button>
        ))}
      </div>

      {/* Error */}
      {isError && !isLoading && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm font-semibold">
          <AlertTriangle size={16} className="shrink-0" />
          Failed to load bookings.
          <button onClick={() => queryClient.invalidateQueries({ queryKey: ['vendor-bookings'] })} className="ml-auto underline text-red-600 text-xs">
            Retry
          </button>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by client, service, or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-gold)] text-sm transition-all"
        />
      </div>

      {/* Booking Cards */}
      <div className="flex flex-col gap-5">
        {isLoading ? (
          [1, 2, 3].map(i => <BookingCardSkeleton key={i} />)
        ) : filteredBookings.length === 0 ? (
          <EmptyState
            variant="no-bookings"
            title={`No ${activeTab.label.toLowerCase()} requests`}
            subtitle="You don't have any bookings in this status."
            actionLabel={null}
          />
        ) : (
          filteredBookings.map((booking) => {
            const isExpanded = expandedId === booking.event_item_id;
            const daysUntil = Math.ceil(
              (new Date(booking.event_date) - new Date()) / 86400000,
            );
            const urgencyClass =
              daysUntil <= 14
                ? 'bg-red-50 text-red-700 border-red-200'
                : daysUntil <= 60
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-gray-100 text-gray-600 border-gray-200';

            const isAccepting = acceptMutation.isPending && acceptMutation.variables === booking.event_item_id;
            const isRejecting = rejectMutation.isPending && rejectMutation.variables?.itemId === booking.event_item_id;

            // Status display for non-incoming
            const STATUS_STYLE = {
              accepted:  'bg-green-50 text-green-700 border-green-200',
              completed: 'bg-blue-50 text-blue-700 border-blue-200',
              rejected:  'bg-red-50 text-red-700 border-red-200',
              cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
            };
            const STATUS_LABEL = {
              accepted:  'Confirmed',
              completed: 'Completed',
              rejected:  'Rejected',
              cancelled: 'Cancelled',
            };

            return (
              <div key={booking.event_item_id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md">

                {/* Main Card Body */}
                <div className="p-5 md:p-6">
                  <div className="flex flex-col md:flex-row gap-6">

                    {/* Left: Customer Info */}
                    <div className="flex items-start gap-4 md:w-1/3 shrink-0">
                      {booking.customer_avatar ? (
                        <img
                          src={booking.customer_avatar}
                          alt={booking.customer_name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-gray-50 shadow-sm"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-[var(--color-gold)]/10 flex items-center justify-center text-xl font-extrabold text-[var(--color-gold-dark)] border-2 border-gray-50 shadow-sm shrink-0">
                          {(booking.customer_name ?? 'C').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-extrabold text-[var(--color-dark)] text-lg leading-tight">{booking.customer_name}</h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${urgencyClass}`}>
                            {daysUntil > 0 ? `${daysUntil}d away` : 'Past'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">Request #{booking.event_item_id}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-block px-2.5 py-1 bg-[var(--color-gold)]/10 text-[var(--color-gold-dark)] text-xs font-bold uppercase tracking-wider rounded-md">
                            {booking.service_city ?? '—'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Booking Details */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Service Requested</p>
                        <p className="font-bold text-[var(--color-dark)]">{booking.service_title ?? '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total</p>
                        <p className="font-extrabold text-[var(--color-gold-dark)] flex items-center gap-1">
                          <DollarSign size={16} />
                          {Number(booking.line_total ?? booking.unit_price_at_time ?? 0).toLocaleString()} JOD
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Event Date</p>
                        <p className="font-medium text-gray-700 flex items-center gap-1.5">
                          <Calendar size={16} className="text-gray-400" />
                          {booking.event_date ? new Date(booking.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Guest Count</p>
                        <p className="font-medium text-gray-700 flex items-center gap-1.5">
                          <Users size={16} className="text-gray-400" />
                          {booking.guest_count ? `${booking.guest_count} Guests` : 'Not specified'}
                        </p>
                      </div>

                      {/* Special Requests */}
                      {booking.special_requests && (
                        <div className="sm:col-span-2 mt-2 bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <MessageSquare size={14} /> Special Requests / Notes
                          </p>
                          <p className="text-sm text-gray-700 italic">{booking.special_requests}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer (Actions & Expander) */}
                <div className="px-5 py-3 md:px-6 bg-gray-50/80 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {booking.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => acceptMutation.mutate(booking.event_item_id)}
                          disabled={isAccepting || isRejecting}
                          className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl min-h-[44px] text-sm font-bold text-white bg-green-600 hover:bg-green-700 shadow-sm transition-colors disabled:opacity-60"
                        >
                          <CheckCircle2 size={16} /> {isAccepting ? 'Accepting…' : 'Accept'}
                        </button>
                        <button
                          onClick={() => rejectMutation.mutate({ itemId: booking.event_item_id, reason: '' })}
                          disabled={isAccepting || isRejecting}
                          className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl min-h-[44px] text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-60"
                        >
                          <XCircle size={16} /> {isRejecting ? 'Rejecting…' : 'Reject'}
                        </button>
                      </>
                    ) : (
                      <span className={`px-4 py-1.5 rounded-lg text-sm font-bold border ${STATUS_STYLE[booking.status] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {STATUS_LABEL[booking.status] ?? booking.status}
                      </span>
                    )}
                  </div>

                  {/* Expander toggle */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : booking.event_item_id)}
                    className="flex items-center gap-1 text-sm font-bold min-h-[44px] text-gray-500 hover:text-[var(--color-gold)] transition-colors ml-auto"
                  >
                    {isExpanded ? 'Hide Details' : 'View Details'}
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-5 md:p-6 border-t border-gray-100 bg-white animate-in fade-in slide-in-from-top-2">
                    <h4 className="text-sm font-bold text-[var(--color-dark)] mb-4 flex items-center gap-2">
                      <Clock size={16} className="text-[var(--color-gold)]" /> Booking Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      {booking.customer_email && (
                        <div>
                          <p className="text-xs text-gray-400 font-bold uppercase mb-1">Customer Email</p>
                          <p className="font-semibold text-gray-700">{booking.customer_email}</p>
                        </div>
                      )}
                      {booking.customer_phone && (
                        <div>
                          <p className="text-xs text-gray-400 font-bold uppercase mb-1">Customer Phone</p>
                          <p className="font-semibold text-gray-700">{booking.customer_phone}</p>
                        </div>
                      )}
                      {booking.plan_name && (
                        <div>
                          <p className="text-xs text-gray-400 font-bold uppercase mb-1">Event Plan</p>
                          <p className="font-semibold text-gray-700">{booking.plan_name}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">Unit Price</p>
                        <p className="font-semibold text-gray-700">{Number(booking.unit_price_at_time ?? 0).toLocaleString()} JOD × {booking.quantity ?? 1}</p>
                      </div>
                      {booking.created_at && (
                        <div>
                          <p className="text-xs text-gray-400 font-bold uppercase mb-1">Request Submitted</p>
                          <p className="font-semibold text-gray-700">{new Date(booking.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                      )}
                    </div>
                    {booking.vendor_note && (
                      <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-700">
                        <p className="font-bold text-xs uppercase mb-1">Your Note</p>
                        {booking.vendor_note}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </PageTransition>
  );
}

export default VendorBookings;
