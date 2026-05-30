import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { 
  TrendingUp, Star, CheckCircle, DollarSign, Award, 
  ArrowUpRight, ArrowDownRight, Calendar, Users, Zap, MoreHorizontal, Eye 
} from 'lucide-react';
import PageTransition from '../../components/shared/PageTransition';

const MONTHLY_DATA = [
  { name: 'Jan', bookings: 12, revenue: 1500 },
  { name: 'Feb', bookings: 19, revenue: 2300 },
  { name: 'Mar', bookings: 15, revenue: 1800 },
  { name: 'Apr', bookings: 22, revenue: 3200 },
  { name: 'May', bookings: 28, revenue: 4100 },
  { name: 'Jun', bookings: 35, revenue: 5500 },
];

const WEEKLY_DATA = [
  { name: 'Mon', bookings: 3, revenue: 450 },
  { name: 'Tue', bookings: 5, revenue: 750 },
  { name: 'Wed', bookings: 4, revenue: 600 },
  { name: 'Thu', bookings: 8, revenue: 1200 },
  { name: 'Fri', bookings: 11, revenue: 1650 },
  { name: 'Sat', bookings: 14, revenue: 2100 },
  { name: 'Sun', bookings: 6, revenue: 900 },
];

const CATEGORY_DATA = [
  { name: 'Venue',         value: 45, color: '#6366f1' },
  { name: 'Catering',      value: 32, color: '#E8C97A' },
  { name: 'Decoration',    value: 18, color: '#10b981' },
  { name: 'Photography',   value: 24, color: '#f59e0b' },
  { name: 'Entertainment', value: 12, color: '#ef4444' },
];

const RECENT_BOOKINGS = [
  { id:'b1', client:'Sarah Al-Ahmad', service:'Grand Royal Ballroom', date:'Jun 15, 2025', amount:1500, status:'confirmed' },
  { id:'b2', client:'Omar Khalil',    service:'Elite Catering Buffet', date:'Jun 18, 2025', amount:800,  status:'pending'   },
  { id:'b3', client:'Lina Nasser',    service:'Outdoor Garden Setup',  date:'Jun 20, 2025', amount:300,  status:'confirmed' },
  { id:'b4', client:'Kareem Mansour', service:'Grand Royal Ballroom',  date:'Jun 22, 2025', amount:1500, status:'confirmed' },
  { id:'b5', client:'Rania Haddad',   service:'Elite Catering Buffet', date:'Jun 25, 2025', amount:600,  status:'cancelled' },
];

const TOP_SERVICES = [
  { id: 1, name: 'Grand Royal Ballroom', category: 'Venue', bookings: 45, revenue: 67500, rating: 4.9 },
  { id: 2, name: 'Elite Catering (Buffet)', category: 'Catering', bookings: 32, revenue: 16000, rating: 4.7 },
  { id: 3, name: 'Outdoor Garden Setup', category: 'Decoration', bookings: 18, revenue: 5400, rating: 4.8 },
];

const KPIS = {
  acceptanceRate: 92,
  avgRating: 4.8,
  totalBookings: 131,
  totalRevenue: 89000
};

const LIFETIME_START = 'March 2022';
const TODAY = 'May 25, 2026';

const YEARLY_DATA = [
  { year: '2022', bookings: 48,  revenue: 28500,  rating: 4.5, reviews: 31,  newClients: 38 },
  { year: '2023', bookings: 124, revenue: 74200,  rating: 4.7, reviews: 89,  newClients: 97 },
  { year: '2024', bookings: 198, revenue: 143000, rating: 4.8, reviews: 156, newClients: 142 },
  { year: '2025', bookings: 231, revenue: 189500, rating: 4.9, reviews: 187, newClients: 163 },
  { year: '2026', bookings: 89,  revenue: 67800,  rating: 4.8, reviews: 71,  newClients: 61  },
];

const LIFETIME_TOTALS = {
  totalBookings:  690,
  totalRevenue:   503000,
  totalReviews:   534,
  totalClients:   501,
  avgRating:      4.8,
  topYear:        '2025',
  growthRate:     '+82%',
  yearsActive:    4,
};

function VendorAnalytics() {
  const [chartRange, setChartRange] = useState('monthly');
  const chartData = chartRange === 'weekly' ? WEEKLY_DATA : MONTHLY_DATA;

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
        {/* Date range badge */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 
          rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 shadow-sm">
          <Calendar size={15} className="text-[var(--color-gold)]" />
          Jun 1 – Jun 30, 2025
        </div>
      </div>

      {/* ══ KPI CARDS ══ */}
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
              <ArrowUpRight size={12} /> +12%
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Bookings</p>
            <p className="text-3xl font-black text-[var(--color-dark)]">
              {KPIS.totalBookings}
            </p>
            <p className="text-xs text-gray-400 mt-1">vs 117 last month</p>
          </div>
          {/* Mini sparkline bar */}
          <div className="flex items-end gap-0.5 h-8">
            {MONTHLY_DATA.map((d, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm bg-indigo-100 hover:bg-indigo-400 
                  transition-colors"
                style={{ height: `${(d.bookings / 35) * 100}%` }}
              />
            ))}
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
              <ArrowUpRight size={12} /> +18%
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Revenue</p>
            <p className="text-3xl font-black text-[var(--color-dark)]">
              89,000 <span className="text-lg font-bold text-gray-400">JOD</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">vs 75,400 JOD last month</p>
          </div>
          <div className="flex items-end gap-0.5 h-8">
            {MONTHLY_DATA.map((d, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm bg-amber-100 hover:bg-amber-400 
                  transition-colors"
                style={{ height: `${(d.revenue / 5500) * 100}%` }}
              />
            ))}
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
              <ArrowUpRight size={12} /> +3%
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Acceptance Rate</p>
            <p className="text-3xl font-black text-[var(--color-dark)]">
              {KPIS.acceptanceRate}%
            </p>
            <p className="text-xs text-gray-400 mt-1">vs 89% last month</p>
          </div>
          {/* Circular progress bar */}
          <div className="relative w-10 h-10">
            <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90">
              <circle cx="18" cy="18" r="15" fill="none" 
                stroke="#e5e7eb" strokeWidth="3" />
              <circle cx="18" cy="18" r="15" fill="none"
                stroke="#10b981" strokeWidth="3"
                strokeDasharray={`${KPIS.acceptanceRate * 0.942} 100`}
                strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center 
              text-[9px] font-black text-emerald-600">
              {KPIS.acceptanceRate}%
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
              <ArrowUpRight size={12} /> +0.2
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Average Rating</p>
            <p className="text-3xl font-black text-[var(--color-dark)]">
              {KPIS.avgRating}
              <span className="text-lg font-medium text-gray-400"> / 5.0</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">Based on 124 reviews</p>
          </div>
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={16}
                fill={s <= Math.round(KPIS.avgRating) ? '#f59e0b' : 'none'}
                color={s <= Math.round(KPIS.avgRating) ? '#f59e0b' : '#d1d5db'}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ══ CHARTS ROW ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Bookings + Revenue Chart (spans 2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 
          shadow-sm p-6">
          
          {/* Chart header with toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-base font-bold text-[var(--color-dark)]">
                Bookings & Revenue
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Combined performance overview
              </p>
            </div>
            <div className="flex bg-gray-100 rounded-lg p-1 gap-1 self-start sm:self-auto">
              {['weekly','monthly'].map(r => (
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

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={chartData} 
                margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} 
                  stroke="#f3f4f6" />
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
                  fill="var(--color-dark)" radius={[6,6,0,0]} barSize={20} />
                <Bar yAxisId="right" dataKey="revenue" name="Revenue (JOD)"
                  fill="var(--color-gold)" radius={[6,6,0,0]} barSize={20} 
                  fillOpacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>

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

        {/* Category Breakdown (1 col) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-[var(--color-dark)] mb-1">
            By Category
          </h2>
          <p className="text-xs text-gray-400 mb-6">Bookings per service type</p>

          <div className="flex flex-col gap-4">
            {CATEGORY_DATA.map((cat) => {
              const total = CATEGORY_DATA.reduce((s,c) => s + c.value, 0);
              const pct = Math.round((cat.value / total) * 100);
              return (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: cat.color }} />
                      <span className="text-sm font-semibold text-gray-700">
                        {cat.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{cat.value}</span>
                      <span className="text-xs font-bold text-gray-600">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: cat.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between">
            <span className="text-sm font-semibold text-gray-500">Total Bookings</span>
            <span className="text-sm font-extrabold text-[var(--color-dark)]">
              {CATEGORY_DATA.reduce((s,c) => s + c.value, 0)}
            </span>
          </div>
        </div>
      </div>

      {/* ══ BOTTOM ROW: Top Services + Recent Bookings ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top Performing Services */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 
            border-b border-gray-100">
            <h2 className="font-bold text-[var(--color-dark)] flex items-center gap-2">
              <Award size={18} className="text-[var(--color-gold)]" />
              Top Services
            </h2>
            <button type="button"
              className="text-xs font-semibold text-[var(--color-gold)] 
              hover:underline transition-all">
              View all →
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {TOP_SERVICES.map((s, i) => (
              <div key={s.id}
                className="flex items-center gap-4 px-6 py-4 
                hover:bg-gray-50/50 transition-colors">
                {/* Rank */}
                <div className={[
                  'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0',
                  i === 0 ? 'bg-amber-100 text-amber-600' :
                  i === 1 ? 'bg-gray-100 text-gray-600' :
                            'bg-orange-50 text-orange-500'
                ].join(' ')}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[var(--color-dark)] truncate">
                    {s.name}
                  </p>
                  <p className="text-xs text-gray-400">{s.category} · {s.bookings} bookings</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-extrabold text-[var(--color-dark)]">
                    {s.revenue.toLocaleString()} JOD
                  </p>
                  <div className="flex items-center justify-end gap-0.5 mt-0.5">
                    <Star size={11} fill="#f59e0b" color="#f59e0b" />
                    <span className="text-xs font-bold text-gray-500">{s.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 
            border-b border-gray-100">
            <h2 className="font-bold text-[var(--color-dark)] flex items-center gap-2">
              <Zap size={18} className="text-[var(--color-gold)]" />
              Recent Bookings
            </h2>
            <button type="button"
              className="text-xs font-semibold text-[var(--color-gold)] 
              hover:underline">
              View all →
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {RECENT_BOOKINGS.map((b) => {
              const statusStyle = {
                confirmed: 'bg-emerald-50 text-emerald-700',
                pending:   'bg-amber-50 text-amber-700',
                cancelled: 'bg-red-50 text-red-600',
              }[b.status];

              return (
                <div key={b.id}
                  className="flex items-center gap-4 px-6 py-4 
                  hover:bg-gray-50/50 transition-colors">
                  {/* Avatar initial */}
                  <div className="w-9 h-9 rounded-full bg-[var(--color-gold)]/10 
                    flex items-center justify-center text-sm font-extrabold 
                    text-[var(--color-gold-dark)] shrink-0">
                    {b.client.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[var(--color-dark)] truncate">
                      {b.client}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {b.service} · {b.date}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-sm font-extrabold text-[var(--color-dark)]">
                      {b.amount.toLocaleString()} JOD
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusStyle}`}>
                      {b.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t-2 border-dashed border-gray-200 pt-8">
        <LifetimeSection />
      </div>

    </PageTransition>
  );
}

function LifetimeSection() {
  const [activeYear, setActiveYear] = useState(null);

  return (
    <section className="space-y-6">

      {/* ── Section Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end 
        justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold text-[var(--color-gold)] 
            uppercase tracking-[0.18em] mb-1">
            Since {LIFETIME_START}
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold 
            text-[var(--color-dark)]">
            All-Time Performance
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Complete record from day one · Last updated {TODAY}
          </p>
        </div>
        {/* Active badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto 
          bg-emerald-50 border border-emerald-200 
          px-4 py-2 rounded-full">
          <div className="w-2 h-2 rounded-full bg-emerald-500 
            animate-pulse" />
          <span className="text-xs font-bold text-emerald-700">
            Active · {LIFETIME_TOTALS.yearsActive}+ years
          </span>
        </div>
      </div>

      {/* ── Lifetime KPI Strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">

        {[
          {
            label: 'Total Bookings',
            value: LIFETIME_TOTALS.totalBookings.toLocaleString(),
            icon: <TrendingUp size={16} />,
            color: 'text-indigo-600 bg-indigo-50',
          },
          {
            label: 'Total Revenue',
            value: `${(LIFETIME_TOTALS.totalRevenue / 1000).toFixed(0)}K JOD`,
            icon: <DollarSign size={16} />,
            color: 'text-[var(--color-gold-dark)] bg-[var(--color-gold)]/10',
          },
          {
            label: 'Happy Clients',
            value: LIFETIME_TOTALS.totalClients.toLocaleString(),
            icon: <Users size={16} />,
            color: 'text-purple-600 bg-purple-50',
          },
          {
            label: 'Total Reviews',
            value: LIFETIME_TOTALS.totalReviews.toLocaleString(),
            icon: <Star size={16} />,
            color: 'text-amber-600 bg-amber-50',
          },
          {
            label: 'Avg Rating',
            value: LIFETIME_TOTALS.avgRating.toFixed(1),
            icon: <Award size={16} />,
            color: 'text-emerald-600 bg-emerald-50',
          },
          {
            label: 'YoY Growth',
            value: LIFETIME_TOTALS.growthRate,
            icon: <ArrowUpRight size={16} />,
            color: 'text-rose-600 bg-rose-50',
          },
        ].map((kpi) => (
          <div key={kpi.label}
            className="bg-white rounded-2xl border border-gray-100 
            shadow-sm p-4 flex flex-col gap-2 hover:shadow-md 
            transition-shadow duration-200">
            <div className={`w-8 h-8 rounded-lg flex items-center 
              justify-center shrink-0 ${kpi.color}`}>
              {kpi.icon}
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-400 
                uppercase tracking-wide leading-none mb-1">
                {kpi.label}
              </p>
              <p className="text-xl font-black text-[var(--color-dark)]">
                {kpi.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Yearly Bar Chart (full width) ── */}
      <div className="bg-white rounded-2xl border border-gray-100 
        shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center 
          justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-bold text-[var(--color-dark)]">
              Year-by-Year Growth
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Bookings and revenue across all active years
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[var(--color-dark)]" />
              <span className="text-xs text-gray-500 font-medium">
                Bookings
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[var(--color-gold)]" />
              <span className="text-xs text-gray-500 font-medium">
                Revenue (÷100 JOD)
              </span>
            </div>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart
              data={YEARLY_DATA}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              onMouseLeave={() => setActiveYear(null)}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false}
                stroke="#f3f4f6" />
              <XAxis dataKey="year" axisLine={false} tickLine={false}
                tick={{ fontSize: 13, fontWeight: 700, fill: '#374151' }}
                dy={8} />
              <YAxis axisLine={false} tickLine={false}
                tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <Tooltip
                contentStyle={{
                  borderRadius: '14px', border: 'none',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                  fontSize: '12px', fontWeight: 600,
                }}
                formatter={(value, name) => {
                  if (name === 'revenue÷100') 
                    return [`${(value * 100).toLocaleString()} JOD`, 'Revenue'];
                  return [value, 'Bookings'];
                }}
                cursor={{ fill: '#f9fafb', radius: 8 }}
              />
              <Bar dataKey="bookings" name="bookings"
                fill="var(--color-dark)"
                radius={[8,8,0,0]} barSize={28}
                onMouseEnter={(_, i) => 
                  setActiveYear(YEARLY_DATA[i].year)}
              />
              <Bar
                dataKey={(d) => Math.round(d.revenue / 100)}
                name="revenue÷100"
                fill="var(--color-gold)"
                radius={[8,8,0,0]} barSize={28}
                fillOpacity={0.85}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Year highlights below chart */}
        <div className="grid grid-cols-5 gap-2 mt-4 pt-4 
          border-t border-gray-100">
          {YEARLY_DATA.map((y) => (
            <div key={y.year}
              className={[
                'flex flex-col items-center gap-1 p-2 rounded-xl',
                'cursor-default transition-colors duration-200',
                y.year === LIFETIME_TOTALS.topYear
                  ? 'bg-[var(--color-gold)]/8 border border-[var(--color-gold)]/20'
                  : 'hover:bg-gray-50',
              ].join(' ')}>
              <span className="text-xs font-black text-[var(--color-dark)]">
                {y.year}
                {y.year === LIFETIME_TOTALS.topYear && (
                  <span className="ml-1 text-[9px] text-[var(--color-gold)] 
                    font-bold">★ BEST</span>
                )}
              </span>
              <span className="text-[11px] font-bold text-indigo-600">
                {y.bookings} bookings
              </span>
              <span className="text-[11px] font-bold text-[var(--color-gold-dark)]">
                {(y.revenue / 1000).toFixed(0)}K JOD
              </span>
              <div className="flex gap-px mt-0.5">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={9}
                    fill={s <= Math.round(y.rating) ? '#f59e0b' : 'none'}
                    color={s <= Math.round(y.rating) ? '#f59e0b' : '#d1d5db'}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Year-by-Year Stats Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 
        shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-bold text-[var(--color-dark)] flex items-center gap-2">
            <Eye size={16} className="text-[var(--color-gold)]" />
            Detailed Year-by-Year Breakdown
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-bold 
                uppercase tracking-wider text-gray-400">
                <th className="p-4 pl-6">Year</th>
                <th className="p-4 text-center">Bookings</th>
                <th className="p-4 text-center">New Clients</th>
                <th className="p-4 text-center">Reviews</th>
                <th className="p-4 text-center">Avg Rating</th>
                <th className="p-4 pr-6 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {YEARLY_DATA.map((y, i) => {
                const prevYear = YEARLY_DATA[i - 1];
                const growth = prevYear
                  ? Math.round(((y.bookings - prevYear.bookings) / prevYear.bookings) * 100)
                  : null;
                const isCurrentYear = y.year === '2026';
                const isBestYear = y.year === LIFETIME_TOTALS.topYear;

                return (
                  <tr key={y.year}
                    className={[
                      'transition-colors',
                      isCurrentYear
                        ? 'bg-[var(--color-gold)]/4'
                        : 'hover:bg-gray-50/60',
                    ].join(' ')}>
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-[var(--color-dark)]">
                          {y.year}
                        </span>
                        {isBestYear && (
                          <span className="text-[10px] font-bold px-2 py-0.5 
                            rounded-full bg-amber-100 text-amber-700">
                            Best Year
                          </span>
                        )}
                        {isCurrentYear && (
                          <span className="text-[10px] font-bold px-2 py-0.5 
                            rounded-full bg-emerald-100 text-emerald-700">
                            Current
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="font-extrabold text-[var(--color-dark)]">
                          {y.bookings}
                        </span>
                        {growth !== null && (
                          <span className={[
                            'text-[10px] font-bold flex items-center gap-0.5',
                            growth >= 0 
                              ? 'text-emerald-600' 
                              : 'text-red-500',
                          ].join(' ')}>
                            {growth >= 0 
                              ? <ArrowUpRight size={10} /> 
                              : <ArrowDownRight size={10} />}
                            {Math.abs(growth)}%
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center font-semibold text-gray-600">
                      {y.newClients}
                    </td>
                    <td className="p-4 text-center font-semibold text-gray-600">
                      {y.reviews}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star size={12} fill="#f59e0b" color="#f59e0b" />
                        <span className="font-bold text-[var(--color-dark)]">
                          {y.rating}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 pr-6 text-right font-extrabold 
                      text-[var(--color-dark)]">
                      {y.revenue.toLocaleString()} JOD
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Totals footer row */}
            <tfoot>
              <tr className="border-t-2 border-gray-200 bg-gray-50/80">
                <td className="p-4 pl-6 font-black text-[var(--color-dark)] text-sm">
                  All Time
                </td>
                <td className="p-4 text-center font-black text-[var(--color-dark)]">
                  {LIFETIME_TOTALS.totalBookings}
                </td>
                <td className="p-4 text-center font-black text-[var(--color-dark)]">
                  {LIFETIME_TOTALS.totalClients}
                </td>
                <td className="p-4 text-center font-black text-[var(--color-dark)]">
                  {LIFETIME_TOTALS.totalReviews}
                </td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Star size={13} fill="#f59e0b" color="#f59e0b" />
                    <span className="font-black text-[var(--color-dark)]">
                      {LIFETIME_TOTALS.avgRating}
                    </span>
                  </div>
                </td>
                <td className="p-4 pr-6 text-right font-black 
                  text-[var(--color-gold-dark)] text-base">
                  {LIFETIME_TOTALS.totalRevenue.toLocaleString()} JOD
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </section>
  );
}

export default VendorAnalytics;
