import React from 'react';
import { Link } from 'react-router-dom';
import PageTransition from '../../components/shared/PageTransition';
import {
  Briefcase, ClipboardList, CheckCircle, DollarSign,
  Plus, ArrowRight, Check, X, Bell,
  ArrowUpRight, ArrowDownRight, Star, Edit2,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import vendorService from '../../services/vendor.service';
import { toastSuccess, toastError } from '../../utils/toast';

// ── Skeleton ──────────────────────────────────────────────────────────────────
function KpiSkeleton() {
  return (
    <div className="animate-pulse bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="w-11 h-11 rounded-xl bg-gray-200" />
        <div className="h-5 w-12 rounded-full bg-gray-200" />
      </div>
      <div>
        <div className="h-3 bg-gray-200 rounded w-24 mb-2" />
        <div className="h-8 bg-gray-200 rounded w-16" />
        <div className="h-2.5 bg-gray-100 rounded w-28 mt-2" />
      </div>
      <div className="flex items-end gap-0.5 h-8">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="flex-1 rounded-sm bg-gray-100" style={{ height: `${Math.random() * 100}%` }} />
        ))}
      </div>
    </div>
  );
}

function RequestSkeleton() {
  return (
    <div className="animate-pulse flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-gray-50">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0" />
        <div className="flex flex-col gap-2">
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-3 bg-gray-100 rounded w-48" />
          <div className="h-3 bg-gray-100 rounded w-24" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-9 w-20 rounded-full bg-gray-100" />
        <div className="h-9 w-20 rounded-full bg-gray-100" />
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
function VendorDashboard() {
  const queryClient = useQueryClient();

  // ── Query: analytics KPIs ──────────────────────────────────────────────────
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['vendor-analytics'],
    queryFn:  () => vendorService.getAnalytics(),
    staleTime: 1000 * 60 * 2,
  });
  const kpis = analyticsData?.kpis ?? {};

  // ── Query: pending bookings list (last 5) ──────────────────────────────────
  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ['vendor-bookings', 'pending-dashboard'],
    queryFn:  () => vendorService.getMyBookings({ status: 'pending', limit: 5 }),
    staleTime: 1000 * 30,
  });
  const pendingRequests = bookingsData?.bookings ?? [];

  // monthlyData for sparklines (last 6 months)
  const monthlyData = analyticsData?.monthlyData ?? [];
  const bookingBars = monthlyData.slice(-6).map(m => Number(m.bookings_count ?? 0));
  const revenueBars = monthlyData.slice(-6).map(m => Number(m.revenue ?? 0));

  const KPI_CONFIG = [
    {
      label:    'Active Services',
      value:    kpis.total_bookings !== undefined ? (analyticsData?.topServices?.length ?? '—') : '—',
      suffix:   '',
      trendPct: '',
      up:       true,
      icon:     <Briefcase size={22} />,
      iconBg:   'bg-indigo-50 text-indigo-600',
      bars:     bookingBars.length > 0 ? bookingBars : [2, 3, 2, 4, 3, 3],
      barColor: '#6366f1',
    },
    {
      label:    'Pending Requests',
      value:    kpis.pending_bookings ?? '—',
      suffix:   '',
      trendPct: '',
      up:       false,
      icon:     <ClipboardList size={22} />,
      iconBg:   'bg-amber-50 text-amber-600',
      bars:     bookingBars.length > 0 ? bookingBars : [1, 2, 3, 2, 4, 3],
      barColor: '#f59e0b',
    },
    {
      label:    'Confirmed Bookings',
      value:    kpis.confirmed_bookings ?? '—',
      suffix:   '',
      trendPct: `${kpis.acceptance_rate ?? 0}%`,
      up:       true,
      icon:     <CheckCircle size={22} />,
      iconBg:   'bg-emerald-50 text-emerald-600',
      bars:     bookingBars.length > 0 ? bookingBars : [4, 6, 8, 9, 10, 12],
      barColor: '#10b981',
    },
    {
      label:    'Total Revenue',
      value:    kpis.total_revenue !== undefined ? Number(kpis.total_revenue).toLocaleString() : '—',
      suffix:   ' JOD',
      trendPct: '',
      up:       true,
      icon:     <DollarSign size={22} />,
      iconBg:   'bg-[var(--color-gold)]/10 text-[var(--color-gold-dark)]',
      bars:     revenueBars.length > 0 ? revenueBars : [20, 35, 28, 45, 38, 55],
      barColor: '#C9A24D',
    },
  ];

  // ── Mutation: accept booking ───────────────────────────────────────────────
  const acceptMutation = useMutation({
    mutationFn: (itemId) => vendorService.acceptBooking(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-bookings-count'] });
      toastSuccess('Booking accepted.');
    },
    onError: (err) => {
      toastError(err.response?.data?.error ?? 'Failed to accept booking.');
    },
  });

  // ── Mutation: reject booking ───────────────────────────────────────────────
  const rejectMutation = useMutation({
    mutationFn: ({ itemId, reason }) => vendorService.rejectBooking(itemId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-bookings-count'] });
      toastSuccess('Booking rejected.');
    },
    onError: (err) => {
      toastError(err.response?.data?.error ?? 'Failed to reject booking.');
    },
  });

  const handleAction = (itemId, action) => {
    if (action === 'accept') {
      acceptMutation.mutate(itemId);
    } else {
      rejectMutation.mutate({ itemId, reason: '' });
    }
  };

  // TODO (Step 2.5.6): Replace MOCK_ACTIVITY with real notifications
  // from GET /api/notifications once the notifications service is wired.
  const MOCK_ACTIVITY = [
    { id: 1, text: 'You accepted a booking.', time: '2 hours ago', type: 'accepted' },
    { id: 2, text: 'New review on your service.', time: '5 hours ago', type: 'review' },
    { id: 3, text: 'Payment cleared to your account.', time: '1 day ago', type: 'payment' },
    { id: 4, text: 'You updated a service listing.', time: '2 days ago', type: 'updated' },
  ];

  return (
    <PageTransition className="w-full max-w-7xl mx-auto pb-12">
      {/* ── Header & Quick Actions ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-dark)]">Vendor Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Here is what's happening with your business today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/vendor/bookings" className="hidden sm:flex items-center gap-2 px-4 py-2.5 min-h-[44px] bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:border-[var(--color-gold)] transition-colors text-sm">
            View All Requests
          </Link>
          <Link to="/vendor/services/new" className="flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] bg-[var(--color-gold)] text-white font-bold rounded-xl hover:bg-[var(--color-gold-dark)] shadow-sm transition-colors text-sm">
            <Plus size={16} /> Add New Service
          </Link>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {analyticsLoading
          ? [1, 2, 3, 4].map(i => <KpiSkeleton key={i} />)
          : KPI_CONFIG.map((kpi, index) => (
            <div key={index} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-default">
              <div className="flex items-start justify-between">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${kpi.iconBg}`}>
                  {kpi.icon}
                </div>
                {kpi.trendPct && (
                  <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${kpi.up ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                    {kpi.up ? <ArrowUpRight size={11}/> : <ArrowDownRight size={11}/>}
                    {kpi.trendPct}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-0.5">{kpi.label}</p>
                <p className="text-3xl font-black text-[var(--color-dark)]">
                  {kpi.value}<span className="text-base font-medium text-gray-400">{kpi.suffix ? ' ' + kpi.suffix : ''}</span>
                </p>
              </div>
              {/* Mini sparkline */}
              <div className="flex items-end gap-0.5 h-8">
                {kpi.bars.map((h, i) => {
                  const max = Math.max(...kpi.bars, 1);
                  return (
                    <div key={i}
                      className="flex-1 rounded-sm transition-all duration-300"
                      style={{
                        height: `${(h / max) * 100}%`,
                        background: i === kpi.bars.length - 1 ? kpi.barColor : `${kpi.barColor}44`,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          ))
        }
      </div>

      {/* ── Main Content Split ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left: Pending Requests */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex justify-between items-end">
            <h2 className="text-lg font-bold text-[var(--color-dark)]">Urgent Pending Requests</h2>
            <Link to="/vendor/bookings" className="text-sm font-bold text-[var(--color-gold)] hover:text-[var(--color-gold-dark)] flex items-center gap-1 min-h-[44px]">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            {bookingsLoading ? (
              <>{[1, 2, 3].map(i => <RequestSkeleton key={i} />)}</>
            ) : pendingRequests.length === 0 ? (
              <div className="p-8 text-center text-gray-500">You have no pending requests. Great job!</div>
            ) : (
              pendingRequests.map((req) => {
                const daysUntil = Math.ceil((new Date(req.event_date) - new Date()) / 86400000);
                const isAccepting = acceptMutation.isPending && acceptMutation.variables === req.event_item_id;
                const isRejecting = rejectMutation.isPending && rejectMutation.variables?.itemId === req.event_item_id;
                return (
                  <div key={req.event_item_id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[var(--color-gold)]/10 flex items-center justify-center text-lg font-extrabold text-[var(--color-gold-dark)] shrink-0">
                        {(req.customer_name ?? 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-[var(--color-dark)]">{req.customer_name}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            daysUntil <= 7 ? 'bg-red-50 text-red-700' :
                            daysUntil <= 30 ? 'bg-amber-50 text-amber-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {daysUntil <= 7 ? `Urgent · ${daysUntil}d` : daysUntil <= 30 ? `Soon · ${daysUntil}d` : `${daysUntil}d away`}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">Service: <span className="font-semibold text-gray-700">{req.service_title}</span></p>
                        <p className="text-xs text-gray-500">Event Date: <span className="font-semibold text-[var(--color-gold-dark)]">{req.event_date}</span></p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between sm:justify-end gap-4 sm:gap-6 sm:w-auto w-full mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-gray-100">
                      <span className="font-extrabold text-[var(--color-dark)] text-lg">
                        {Number(req.line_total ?? req.unit_price_at_time ?? 0).toLocaleString()} <span className="text-sm font-semibold text-gray-500">JOD</span>
                      </span>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleAction(req.event_item_id, 'accept')}
                          disabled={isAccepting || isRejecting}
                          className="flex justify-center items-center gap-1.5 px-4 py-3 sm:py-2 rounded-full min-h-[44px] sm:min-h-0 bg-green-50 text-green-700 hover:bg-green-100 font-bold text-sm transition-colors disabled:opacity-60"
                        >
                          <Check size={16} /> {isAccepting ? '...' : 'Accept'}
                        </button>
                        <button
                          onClick={() => handleAction(req.event_item_id, 'reject')}
                          disabled={isAccepting || isRejecting}
                          className="flex justify-center items-center gap-1.5 px-4 py-3 sm:py-2 rounded-full min-h-[44px] sm:min-h-0 bg-red-50 text-red-600 hover:bg-red-100 font-bold text-sm transition-colors disabled:opacity-60"
                        >
                          <X size={16} /> {isRejecting ? '...' : 'Reject'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Recent Activity (TODO Step 2.5.6: replace with real notifications) */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-[var(--color-dark)]">Recent Activity</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex flex-col gap-6">
              {MOCK_ACTIVITY.map((act) => {
                let ActIcon = Bell;
                let iconBg = 'bg-gray-50 text-gray-500';
                if (act.type === 'accepted') { ActIcon = CheckCircle; iconBg = 'bg-green-50 text-green-600'; }
                else if (act.type === 'review') { ActIcon = Star; iconBg = 'bg-amber-50 text-amber-500'; }
                else if (act.type === 'payment') { ActIcon = DollarSign; iconBg = 'bg-[var(--color-gold)]/10 text-[var(--color-gold-dark)]'; }
                else if (act.type === 'updated') { ActIcon = Edit2; iconBg = 'bg-blue-50 text-blue-600'; }
                return (
                  <div key={act.id} className="flex gap-4 relative">
                    <div className={`w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center shrink-0 z-10 ${iconBg}`}>
                      <ActIcon size={14} />
                    </div>
                    {act.id !== MOCK_ACTIVITY.length && (
                      <div className="absolute top-8 left-4 bottom-[-24px] w-px bg-gray-100" />
                    )}
                    <div className="pt-1.5">
                      <p className="text-sm text-gray-700 font-medium leading-snug">{act.text}</p>
                      <p className="text-xs text-gray-400 mt-1">{act.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </PageTransition>
  );
}

export default VendorDashboard;
