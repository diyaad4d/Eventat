import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { 
  TrendingUp, Star, CheckCircle, DollarSign, Award, 
  ArrowUpRight, ArrowDownRight, Calendar, Users, Zap, MoreHorizontal, Eye 
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import PageTransition from '../../components/shared/PageTransition';
import vendorService from '../../services/vendor.service';

// ── Skeleton components ───────────────────────────────────────────────────────
function KpiSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="w-11 h-11 rounded-xl bg-gray-200" />
        <div className="w-14 h-5 rounded-full bg-gray-200" />
      </div>
      <div>
        <div className="h-3 w-24 rounded bg-gray-200 mb-2" />
        <div className="h-8 w-20 rounded bg-gray-200" />
        <div className="h-3 w-32 rounded bg-gray-200 mt-2" />
      </div>
      <div className="flex items-end gap-0.5 h-8">
        {[60,80,55,90,70,100].map((h, i) => (
          <div key={i} className="flex-1 rounded-sm bg-gray-200" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

function TableSkeleton({ rows = 3 }) {
  return (
    <div className="divide-y divide-gray-50">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
          <div className="w-7 h-7 rounded-lg bg-gray-200 shrink-0" />
          <div className="flex-1">
            <div className="h-3 w-40 rounded bg-gray-200 mb-2" />
            <div className="h-3 w-24 rounded bg-gray-200" />
          </div>
          <div className="text-right">
            <div className="h-4 w-20 rounded bg-gray-200 mb-1" />
            <div className="h-3 w-12 rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

function VendorAnalytics() {
  const [chartRange, setChartRange] = useState('monthly');

  // ── Query: analytics data ──────────────────────────────────────────────────
  // API returns:
  //   kpis: { total_bookings, confirmed_bookings, pending_bookings,
  //            rejected_bookings, total_revenue, acceptance_rate,
  //            avg_rating, total_reviews }
  //   monthlyData: [{ month_label, month_num, year, bookings_count, revenue, confirmed_count }]
  //   topServices: [{ service_id, title, bookings, revenue, rating }]
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
  } = useQuery({
    queryKey: ['vendor-analytics'],
    queryFn: () => vendorService.getAnalytics(),
    staleTime: 1000 * 60 * 5,
  });

  const kpis        = analyticsData?.kpis        ?? {};
  const monthlyData = analyticsData?.monthlyData  ?? [];
  const topServices = analyticsData?.topServices  ?? [];

  // Transform monthlyData to chart-friendly format
  // API field month_label → name, bookings_count → bookings, revenue → revenue
  const chartData = monthlyData.map((m) => ({
    name:     m.month_label ?? `${m.year}-${m.month_num}`,
    bookings: Number(m.bookings_count ?? 0),
    revenue:  Number(m.revenue ?? 0),
  }));

  // For the weekly toggle: no weekly endpoint yet — use monthly data for both
  // TODO: add a weekly analytics endpoint and fetch conditionally
  const displayChartData = chartData; // same for both monthly/weekly until endpoint exists

  // Sparkline bars from monthly bookings and revenue
  const bookingBars = monthlyData.map((m) => Number(m.bookings_count ?? 0));
  const revenueBars = monthlyData.map((m) => Number(m.revenue ?? 0));
  const maxBookings = Math.max(...bookingBars, 1);
  const maxRevenue  = Math.max(...revenueBars, 1);

  // Acceptance rate from kpis (0–100)
  const acceptanceRate = Number(kpis.acceptance_rate ?? 0);
  const avgRating      = Number(kpis.avg_rating ?? 0);

  return (
    <PageTransition className="w-full max-w-7xl mx-auto pb-16 space-y-8">

      {/* ══ PAGE HEADER ══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold text-[var(--color-gold)] uppercase tracking-[0.18em] mb-1">
            Dashboard
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-dark)]">
            Analytics & Performance
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track your growth, revenue, and customer satisfaction.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 
          rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 shadow-sm">
          <Calendar size={15} className="text-[var(--color-gold)]" />
          Last 6 months
        </div>
      </div>

      {/* ══ KPI CARDS ══ */}
      {analyticsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <KpiSkeleton /><KpiSkeleton /><KpiSkeleton /><KpiSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

          {/* Total Bookings */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 
            flex flex-col gap-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center 
                justify-center text-indigo-600">
                <TrendingUp size={22} />
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 
                bg-emerald-50 px-2 py-1 rounded-full">
                <ArrowUpRight size={12} /> +{kpis.confirmed_bookings ?? 0}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Bookings</p>
              <p className="text-3xl font-black text-[var(--color-dark)]">
                {kpis.total_bookings ?? 0}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {kpis.confirmed_bookings ?? 0} confirmed · {kpis.pending_bookings ?? 0} pending
              </p>
            </div>
            {/* Mini sparkline bar */}
            <div className="flex items-end gap-0.5 h-8">
              {bookingBars.length > 0 ? bookingBars.map((count, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-indigo-100 hover:bg-indigo-400 transition-colors"
                  style={{ height: `${(count / maxBookings) * 100}%` }}
                />
              )) : (
                <div className="flex-1 rounded-sm bg-gray-100" style={{ height: '20%' }} />
              )}
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 
            flex flex-col gap-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-xl bg-[var(--color-gold)]/10 flex items-center 
                justify-center text-[var(--color-gold-dark)]">
                <DollarSign size={22} />
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 
                bg-emerald-50 px-2 py-1 rounded-full">
                <ArrowUpRight size={12} /> confirmed
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Revenue (Take-home)</p>
              <p className="text-3xl font-black text-[var(--color-dark)]">
                {Number((kpis.total_revenue ?? 0) * 0.90).toLocaleString()}
                <span className="text-lg font-bold text-gray-400"> JOD</span>
              </p>
              <p className="text-xs font-medium text-gray-400 mt-1">From <span className="font-bold text-[var(--color-gold-dark)]">{Number(kpis.total_revenue ?? 0).toLocaleString()} JOD</span> total bookings</p>
            </div>
            <div className="flex items-end gap-0.5 h-8">
              {revenueBars.length > 0 ? revenueBars.map((rev, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-amber-100 hover:bg-amber-400 transition-colors"
                  style={{ height: `${(rev / maxRevenue) * 100}%` }}
                />
              )) : (
                <div className="flex-1 rounded-sm bg-gray-100" style={{ height: '20%' }} />
              )}
            </div>
          </div>

          {/* Acceptance Rate */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 
            flex flex-col gap-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center 
                justify-center text-emerald-600">
                <CheckCircle size={22} />
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 
                bg-emerald-50 px-2 py-1 rounded-full">
                <ArrowUpRight size={12} /> live
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Acceptance Rate</p>
              <p className="text-3xl font-black text-[var(--color-dark)]">
                {acceptanceRate.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {kpis.rejected_bookings ?? 0} rejected bookings
              </p>
            </div>
            {/* Circular progress */}
            <div className="relative w-10 h-10">
              <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90">
                <circle cx="18" cy="18" r="15" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                <circle cx="18" cy="18" r="15" fill="none"
                  stroke="#10b981" strokeWidth="3"
                  strokeDasharray={`${acceptanceRate * 0.942} 100`}
                  strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center 
                text-[9px] font-black text-emerald-600">
                {Math.round(acceptanceRate)}%
              </span>
            </div>
          </div>

          {/* Average Rating */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 
            flex flex-col gap-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center 
                justify-center text-amber-500">
                <Star size={22} fill="currentColor" />
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 
                bg-emerald-50 px-2 py-1 rounded-full">
                <ArrowUpRight size={12} /> all-time
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Average Rating</p>
              <p className="text-3xl font-black text-[var(--color-dark)]">
                {avgRating.toFixed(1)}
                <span className="text-lg font-medium text-gray-400"> / 5.0</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Based on {kpis.total_reviews ?? 0} reviews
              </p>
            </div>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={16}
                  fill={s <= Math.round(avgRating) ? '#f59e0b' : 'none'}
                  color={s <= Math.round(avgRating) ? '#f59e0b' : '#d1d5db'}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ CHARTS ROW ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Bookings + Revenue Chart (spans 2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          
          {/* Chart header with toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-base font-bold text-[var(--color-dark)]">
                Bookings & Revenue
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Combined performance overview (last 6 months)
              </p>
            </div>
            <div className="flex bg-gray-100 rounded-lg p-1 gap-1 self-start sm:self-auto">
              {['weekly', 'monthly'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setChartRange(r)}
                  className={[
                    'px-3 py-1.5 rounded-md text-xs font-bold capitalize transition-all',
                    chartRange === r
                      ? 'bg-white shadow-sm text-[var(--color-dark)]'
                      : 'text-gray-500 hover:text-gray-700',
                  ].join(' ')}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {analyticsLoading ? (
            <div className="h-72 bg-gray-100 rounded-xl animate-pulse" />
          ) : displayChartData.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-gray-400 text-sm">
              No booking data yet for this period.
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={displayChartData}
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false}
                    tick={{ fontSize: 12, fill: '#9ca3af' }} dy={8} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false}
                    tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false}
                    tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px', border: 'none',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                      fontSize: '12px',
                    }}
                    cursor={{ fill: '#f9fafb' }}
                  />
                  <Bar yAxisId="left" dataKey="bookings" name="Bookings"
                    fill="var(--color-dark)" radius={[6, 6, 0, 0]} barSize={20} />
                  <Bar yAxisId="right" dataKey="revenue" name="Revenue (JOD)"
                    fill="var(--color-gold)" radius={[6, 6, 0, 0]} barSize={20}
                    fillOpacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-6 mt-4 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-[var(--color-dark)]" />
              <span className="text-xs text-gray-500 font-medium">Bookings</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-[var(--color-gold)]" />
              <span className="text-xs text-gray-500 font-medium">Revenue (JOD)</span>
            </div>
          </div>
        </div>

        {/* Top Services (1 col) — replaces Category Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-[var(--color-dark)] mb-1">
            Top Services
          </h2>
          <p className="text-xs text-gray-400 mb-6">By confirmed revenue</p>

          {analyticsLoading ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="h-3 w-28 rounded bg-gray-200" />
                    <div className="h-3 w-12 rounded bg-gray-200" />
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gray-200" style={{ width: `${60 - i * 15}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : topServices.length === 0 ? (
            <div className="flex items-center justify-center text-gray-400 text-sm h-40">
              No services data yet.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {topServices.map((svc) => {
                const maxRevenue = Math.max(...topServices.map((s) => Number(s.revenue)), 1);
                const pct = Math.round((Number(svc.revenue) / maxRevenue) * 100);
                const colors = ['#6366f1', '#E8C97A', '#10b981', '#f59e0b', '#ef4444'];
                const colorIdx = topServices.indexOf(svc) % colors.length;
                return (
                  <div key={svc.service_id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ background: colors[colorIdx] }} />
                        <span className="text-sm font-semibold text-gray-700 truncate max-w-[120px]">
                          {svc.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{svc.bookings}</span>
                        <span className="text-xs font-bold text-gray-600">{pct}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: colors[colorIdx] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Total */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between">
            <span className="text-sm font-semibold text-gray-500">Total Bookings</span>
            <span className="text-sm font-extrabold text-[var(--color-dark)]">
              {kpis.total_bookings ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* ══ BOTTOM ROW: Top Services table + Recent note ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top Performing Services */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-[var(--color-dark)] flex items-center gap-2">
              <Award size={18} className="text-[var(--color-gold)]" />
              Top Services
            </h2>
            <button type="button"
              className="text-xs font-semibold text-[var(--color-gold)] hover:underline transition-all">
              View all →
            </button>
          </div>

          {analyticsLoading ? (
            <TableSkeleton rows={3} />
          ) : topServices.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-400 text-sm">
              No top services data yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {topServices.slice(0, 5).map((s, i) => (
                <div key={s.service_id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
                  {/* Rank */}
                  <div className={[
                    'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0',
                    i === 0 ? 'bg-amber-100 text-amber-600' :
                    i === 1 ? 'bg-gray-100 text-gray-600' :
                              'bg-orange-50 text-orange-500',
                  ].join(' ')}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[var(--color-dark)] truncate">
                      {s.title}
                    </p>
                    <p className="text-xs text-gray-400">{s.bookings} bookings</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-extrabold text-[var(--color-dark)]">
                      {Number(s.revenue).toLocaleString()} JOD
                    </p>
                    <div className="flex items-center justify-end gap-0.5 mt-0.5">
                      <Star size={11} fill="#f59e0b" color="#f59e0b" />
                      <span className="text-xs font-bold text-gray-500">{Number(s.rating).toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* KPI Summary card (replaces Recent Bookings which has no API) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-[var(--color-dark)] flex items-center gap-2">
              <Zap size={18} className="text-[var(--color-gold)]" />
              Booking Summary
            </h2>
          </div>
          {analyticsLoading ? (
            <div className="p-6 space-y-4 animate-pulse">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-12 bg-gray-100 rounded-xl" />)}
            </div>
          ) : (
            <div className="p-6 space-y-3">
              {[
                { label: 'Total Bookings',    value: kpis.total_bookings    ?? 0, color: 'bg-indigo-50 text-indigo-700' },
                { label: 'Confirmed',         value: kpis.confirmed_bookings ?? 0, color: 'bg-emerald-50 text-emerald-700' },
                { label: 'Pending Review',    value: kpis.pending_bookings   ?? 0, color: 'bg-amber-50 text-amber-700' },
                { label: 'Rejected',          value: kpis.rejected_bookings  ?? 0, color: 'bg-red-50 text-red-700' },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-sm font-semibold text-gray-600">{row.label}</span>
                  <span className={`text-sm font-extrabold px-2.5 py-1 rounded-full ${row.color}`}>
                    {row.value}
                  </span>
                </div>
              ))}
              <div className="flex flex-col gap-1 mt-2">
                <div className="flex items-center justify-between p-3 bg-[var(--color-gold)]/5 rounded-xl border border-[var(--color-gold)]/20">
                  <span className="text-sm font-bold text-[var(--color-dark)]">Total Revenue (Take-home)</span>
                  <span className="text-sm font-black text-[var(--color-gold-dark)]">
                    {Number((kpis.total_revenue ?? 0) * 0.90).toLocaleString()} JOD
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 text-center font-medium">From {Number(kpis.total_revenue ?? 0).toLocaleString()} JOD total bookings</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══ LIFETIME SECTION ══ */}
      <div className="border-t-2 border-dashed border-gray-200 pt-8">
        <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-8 text-center">
          <p className="text-sm font-bold text-gray-400 mb-1">
            All-Time Analytics
          </p>
          <p className="text-xs text-gray-400">
            Lifetime performance data will appear here
            as your business grows. Check back later!
          </p>
        </div>
      </div>

    </PageTransition>
  );
}

export default VendorAnalytics;
