import React, { useState } from 'react';
import { 
  TrendingUp, Download, Calendar, DollarSign, Activity, 
  MapPin, PieChart as PieChartIcon, BarChart3, LineChart as LineChartIcon,
  ArrowUpRight, ArrowDownRight, Layers
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell,
  LineChart, Line, ComposedChart
} from 'recharts';

import { useQuery } from '@tanstack/react-query';
import { getAdminAnalytics } from '../../services/admin.service';

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState('6M');

  const { data: analyticsRes, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: getAdminAnalytics,
  });

  const analytics = analyticsRes?.data || {
    monthlyData: [],
    categoryRevenue: [],
    locationData: [],
    topVendors: [],
    kpis: { totalRevenue: 0, totalBookings: 0, avgBookingValue: 0 }
  };

  const COLORS = ['#6366f1', '#C9A24D', '#10b981', '#f43f5e', '#a855f7', '#06b6d4', '#eab308'];
  
  // Format category revenue to match the expected format for pie chart
  const platformSplit = analytics.categoryRevenue.map(cat => ({
    name: cat.name,
    value: cat.revenue || 0
  })).filter(cat => cat.value > 0);

  const totalRevenueAllCats = platformSplit.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="min-h-screen bg-[#0F1117] p-6 lg:p-8 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* ══ HEADER ══ */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold text-[var(--color-gold)] uppercase tracking-[0.18em] mb-1">
              Admin Panel
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Platform Analytics
            </h1>
            <p className="text-sm text-[#8B8FA8] mt-1">
              Detailed breakdown of revenue, bookings, and platform performance.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-1">
              {['1M', '3M', '6M', '1Y', 'ALL'].map(r => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    timeRange === r ? 'bg-[#2A2D3A] text-white shadow-sm' : 'text-[#8B8FA8] hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-[var(--color-gold)]/10 text-[var(--color-gold)] border border-[var(--color-gold)]/30 rounded-xl hover:bg-[var(--color-gold)]/20 transition-colors text-sm font-bold">
              <Download size={16} /> Export CSV
            </button>
          </div>
        </div>

        {/* ══ KPI ROW ══ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { label: 'Total Revenue', value: `${analytics.kpis.totalRevenue.toLocaleString()} JOD`, trend: '+0%', isUp: true, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Platform Bookings', value: analytics.kpis.totalBookings.toLocaleString(), trend: '+0%', isUp: true, icon: Calendar, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
            { label: 'Avg Booking Value', value: `${analytics.kpis.avgBookingValue.toLocaleString()} JOD`, trend: '0%', isUp: true, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          ].map((stat, i) => (
            <div key={i} className="bg-[#1A1D27] border border-[#2A2D3A] rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                  <stat.icon size={22} />
                </div>
                <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${stat.isUp ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
                  {stat.isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} {stat.trend}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-[#8B8FA8] mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-white">{isLoading ? '...' : stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ══ CHARTS ROW 1 ══ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Revenue Over Time */}
          <div className="lg:col-span-2 bg-[#1A1D27] border border-[#2A2D3A] rounded-2xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <LineChartIcon size={20} className="text-white" />
                <h2 className="text-base font-bold text-white">Revenue vs Bookings</h2>
              </div>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <ComposedChart data={analytics.monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C9A24D" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#C9A24D" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2A2D3A" />
                  <XAxis dataKey="month" stroke="#8B8FA8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="#8B8FA8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `JD${val}`} />
                  <YAxis yAxisId="right" orientation="right" stroke="#8B8FA8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1A1D27', borderColor: '#2A2D3A', borderRadius: '8px', color: '#FFF' }}
                    itemStyle={{ color: '#FFF' }}
                  />
                  <Area yAxisId="left" type="monotone" dataKey="revenue" name="Revenue (JOD)" stroke="#C9A24D" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  <Line yAxisId="right" type="monotone" dataKey="bookings" name="Bookings" stroke="#6366f1" strokeWidth={3} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue Split */}
          <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-2xl p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <PieChartIcon size={20} className="text-white" />
              <h2 className="text-base font-bold text-white">Revenue Streams</h2>
            </div>
            <div className="h-56 w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie
                    data={platformSplit.length ? platformSplit : [{ name: 'None', value: 1 }]}
                    cx="50%" cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {platformSplit.length ? platformSplit.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    )) : (
                      <Cell fill="#2A2D3A" />
                    )}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1A1D27', borderColor: '#2A2D3A', borderRadius: '8px', color: '#FFF' }}
                    itemStyle={{ color: '#FFF' }}
                    formatter={(value) => `${value.toLocaleString()} JOD`}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-[#8B8FA8] font-bold uppercase tracking-wider">Total</span>
                <span className="text-xl font-black text-white">{totalRevenueAllCats >= 1000 ? `${(totalRevenueAllCats/1000).toFixed(1)}k` : totalRevenueAllCats}</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 mt-4 flex-1 justify-end">
              {platformSplit.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-sm font-medium text-[#8B8FA8]">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-white">{item.value.toLocaleString()} JOD</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ CHARTS ROW 2 ══ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Top Vendors */}
          <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-2xl flex flex-col overflow-hidden">
            <div className="p-6 border-b border-[#2A2D3A] flex items-center gap-3">
              <Activity size={20} className="text-white" />
              <h2 className="text-base font-bold text-white">Top Performing Vendors</h2>
            </div>
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-[#2A2D3A] text-xs font-bold uppercase tracking-wider text-[#8B8FA8] bg-[#0F1117]/50">
                    <th className="p-4 pl-6">Vendor</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Revenue</th>
                    <th className="p-4 pr-6 text-right">Growth</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2D3A]">
                  {isLoading ? (
                    <tr><td colSpan={4} className="p-4 text-center text-[#8B8FA8]">Loading vendors...</td></tr>
                  ) : analytics.topVendors.length === 0 ? (
                    <tr><td colSpan={4} className="p-4 text-center text-[#8B8FA8]">No data available.</td></tr>
                  ) : analytics.topVendors.map((v, i) => (
                    <tr key={i} className="hover:bg-[#2A2D3A]/20 transition-colors">
                      <td className="p-4 pl-6 text-sm font-bold text-white">{v.name}</td>
                      <td className="p-4 text-xs font-semibold text-[#8B8FA8]">{v.category}</td>
                      <td className="p-4 text-sm font-bold text-[var(--color-gold)]">{v.revenue.toLocaleString()} JOD</td>
                      <td className="p-4 pr-6 text-right">
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${
                          v.growth > 0 ? 'text-emerald-400 bg-emerald-500/10' : v.growth < 0 ? 'text-red-400 bg-red-500/10' : 'text-[#8B8FA8] bg-[#2A2D3A]'
                        }`}>
                          {v.growth > 0 ? <ArrowUpRight size={12} /> : v.growth < 0 ? <ArrowDownRight size={12} /> : null}
                          {Math.abs(v.growth)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bookings by Location */}
          <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-2xl p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <MapPin size={20} className="text-white" />
              <h2 className="text-base font-bold text-white">Bookings by Location</h2>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={analytics.locationData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2A2D3A" />
                  <XAxis dataKey="city" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8B8FA8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8B8FA8' }} />
                  <Tooltip
                    cursor={{ fill: '#2A2D3A', opacity: 0.4 }}
                    contentStyle={{ backgroundColor: '#1A1D27', borderColor: '#2A2D3A', borderRadius: '8px', color: '#FFF' }}
                    itemStyle={{ color: '#FFF' }}
                  />
                  <Bar dataKey="bookings" name="Bookings" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
