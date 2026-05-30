import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Briefcase, Calendar, DollarSign, 
  ArrowUpRight, Clock, ArrowRight, ShieldAlert, CheckCircle, Activity, HeartPulse, Headphones, Star
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import PageTransition from '../../components/shared/PageTransition';

// ─────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────
const MONTHLY_REGISTRATIONS = [
  { name: 'Jan', users: 400, vendors: 24 },
  { name: 'Feb', users: 300, vendors: 18 },
  { name: 'Mar', users: 550, vendors: 30 },
  { name: 'Apr', users: 480, vendors: 26 },
  { name: 'May', users: 700, vendors: 42 },
  { name: 'Jun', users: 850, vendors: 50 },
];

const WEEKLY_REGISTRATIONS = [
  { name: 'Week 1', users: 120, vendors: 8 },
  { name: 'Week 2', users: 150, vendors: 12 },
  { name: 'Week 3', users: 200, vendors: 15 },
  { name: 'Week 4', users: 250, vendors: 18 },
];

const CATEGORY_BOOKINGS = [
  { name: 'Venue',         value: 3400, fill: '#6366f1' },
  { name: 'Catering',      value: 2100, fill: '#C9A24D' },
  { name: 'Photography',   value: 1500, fill: '#ec4899' },
  { name: 'Entertainment', value: 900,  fill: '#14b8a6' },
  { name: 'Decoration',    value: 532,  fill: '#f59e0b' },
];

const RECENT_REGISTRATIONS = [
  { id: 1, name: 'Ahmad Photography', role: 'Vendor',   date: '2 hours ago', status: 'pending', initials: 'AP' },
  { id: 2, name: 'Sara Al-Masri',     role: 'Customer', date: '3 hours ago', status: 'active',  initials: 'SA' },
  { id: 3, name: 'Royal Hall Amman',  role: 'Vendor',   date: '5 hours ago', status: 'active',  initials: 'RH' },
  { id: 4, name: 'Omar Yassin',       role: 'Customer', date: '1 day ago',   status: 'active',  initials: 'OY' },
  { id: 5, name: 'Delicious Catering',role: 'Vendor',   date: '1 day ago',   status: 'pending', initials: 'DC' },
  { id: 6, name: 'Layla Weddings',    role: 'Customer', date: '2 days ago',  status: 'active',  initials: 'LW' },
  { id: 7, name: 'Lumina Events',     role: 'Vendor',   date: '2 days ago',  status: 'active',  initials: 'LE' },
  { id: 8, name: 'Khaled Hassan',     role: 'Customer', date: '2 days ago',  status: 'active',  initials: 'KH' },
];

const PENDING_VENDORS = [
  { id: 1, company: 'Ahmad Photography',   submitted: '2 hours ago', category: 'Photography' },
  { id: 2, company: 'Delicious Catering',  submitted: '1 day ago',   category: 'Catering' },
  { id: 3, company: 'Skyfire Pyrotechnics',submitted: '2 days ago',  category: 'Fireworks' },
  { id: 4, company: 'Orion Live Band',     submitted: '3 days ago',  category: 'Entertainment' },
];

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState('monthly');
  const chartData = timeRange === 'monthly' ? MONTHLY_REGISTRATIONS : WEEKLY_REGISTRATIONS;

  return (
    <PageTransition className="min-h-screen bg-[#0F1117] p-6 lg:p-8 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* SECTION 1 — PAGE HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <p className="text-[var(--color-gold)] text-xs font-extrabold uppercase tracking-widest mb-1.5">
              Admin Panel
            </p>
            <h1 className="text-3xl font-extrabold text-white">Platform Overview</h1>
            <p className="text-[#8B8FA8] mt-2 text-sm max-w-lg">
              Real-time stats across the entire Eventat marketplace.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-[#1A1D27] border border-[#2A2D3A] px-4 py-2 rounded-lg shrink-0">
            <Clock size={14} className="text-[var(--color-gold)]" />
            <span className="text-xs font-semibold text-[#8B8FA8]">Today 14:32</span>
          </div>
        </div>

        {/* SECTION 2 — 4 KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Card 1: Users */}
          <div className="group bg-[#1A1D27] border border-[#2A2D3A] hover:border-[var(--color-gold)]/40 rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_0_20px_rgba(201,162,77,0.1)] flex flex-col justify-between h-40 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#8B8FA8] text-xs font-bold uppercase tracking-wider mb-1">Total Registered Users</p>
                <h3 className="text-2xl font-extrabold text-white">2,847</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Users size={18} />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-auto z-10">
              <span className="flex items-center text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md">
                <ArrowUpRight size={12} className="mr-0.5" /> +124
              </span>
              <span className="text-[#8B8FA8] text-xs">this month</span>
            </div>
            {/* Sparkline decoration */}
            <div className="absolute bottom-0 right-4 flex items-end gap-1 opacity-20 group-hover:opacity-40 transition-opacity">
              {[30, 50, 40, 70, 60, 90].map((h, i) => (
                <div key={i} className="w-1.5 bg-indigo-400 rounded-t-sm" style={{ height: `${h}px` }} />
              ))}
            </div>
          </div>

          {/* Card 2: Vendors */}
          <div className="group bg-[#1A1D27] border border-[#2A2D3A] hover:border-[var(--color-gold)]/40 rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_0_20px_rgba(201,162,77,0.1)] flex flex-col justify-between h-40 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#8B8FA8] text-xs font-bold uppercase tracking-wider mb-1">Active Vendors</p>
                <h3 className="text-2xl font-extrabold text-white">318</h3>
                <Link to="/admin/vendors" className="text-amber-500 text-[10px] font-bold mt-1 hover:underline block relative z-20">
                  24 pending approval
                </Link>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[var(--color-gold)]/10 flex items-center justify-center text-[var(--color-gold)]">
                <Briefcase size={18} />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-auto z-10">
              <span className="flex items-center text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md">
                <ArrowUpRight size={12} className="mr-0.5" /> +12
              </span>
              <span className="text-[#8B8FA8] text-xs">this month</span>
            </div>
            {/* Sparkline decoration */}
            <div className="absolute bottom-0 right-4 flex items-end gap-1 opacity-20 group-hover:opacity-40 transition-opacity">
              {[20, 30, 25, 45, 40, 65].map((h, i) => (
                <div key={i} className="w-1.5 bg-[var(--color-gold)] rounded-t-sm" style={{ height: `${h}px` }} />
              ))}
            </div>
          </div>

          {/* Card 3: Bookings */}
          <div className="group bg-[#1A1D27] border border-[#2A2D3A] hover:border-[var(--color-gold)]/40 rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_0_20px_rgba(201,162,77,0.1)] flex flex-col justify-between h-40 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#8B8FA8] text-xs font-bold uppercase tracking-wider mb-1">Platform Bookings</p>
                <h3 className="text-2xl font-extrabold text-white">8,432</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Calendar size={18} />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-auto z-10">
              <span className="flex items-center text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md">
                <ArrowUpRight size={12} className="mr-0.5" /> +342
              </span>
              <span className="text-[#8B8FA8] text-xs">this month</span>
            </div>
            {/* Sparkline decoration */}
            <div className="absolute bottom-0 right-4 flex items-end gap-1 opacity-20 group-hover:opacity-40 transition-opacity">
              {[50, 40, 60, 80, 75, 100].map((h, i) => (
                <div key={i} className="w-1.5 bg-emerald-400 rounded-t-sm" style={{ height: `${h}px` }} />
              ))}
            </div>
          </div>

          {/* Card 4: Revenue */}
          <div className="group bg-[#1A1D27] border border-[#2A2D3A] hover:border-[var(--color-gold)]/40 rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_0_20px_rgba(201,162,77,0.1)] flex flex-col justify-between h-40 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#8B8FA8] text-xs font-bold uppercase tracking-wider mb-1">Gross Platform Revenue</p>
                <h3 className="text-2xl font-extrabold text-white">1.24M <span className="text-sm font-medium text-[#8B8FA8]">JOD</span></h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                <DollarSign size={18} />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-auto z-10">
              <span className="flex items-center text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md">
                <ArrowUpRight size={12} className="mr-0.5" /> +18%
              </span>
              <span className="text-[#8B8FA8] text-xs">this month</span>
            </div>
            {/* Sparkline decoration */}
            <div className="absolute bottom-0 right-4 flex items-end gap-1 opacity-20 group-hover:opacity-40 transition-opacity">
              {[40, 50, 70, 65, 85, 110].map((h, i) => (
                <div key={i} className="w-1.5 bg-purple-400 rounded-t-sm" style={{ height: `${h}px` }} />
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 3 — CHARTS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Monthly Registrations */}
          <div className="lg:col-span-2 bg-[#1A1D27] border border-[#2A2D3A] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold text-white">Registration Growth</h2>
              <div className="flex items-center bg-[#0F1117] p-1 rounded-lg border border-[#2A2D3A]">
                <button
                  onClick={() => setTimeRange('weekly')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                    timeRange === 'weekly' ? 'bg-[#2A2D3A] text-white' : 'text-[#8B8FA8] hover:text-white'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setTimeRange('monthly')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                    timeRange === 'monthly' ? 'bg-[#2A2D3A] text-white' : 'text-[#8B8FA8] hover:text-white'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2D3A" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#8B8FA8" 
                    tick={{ fill: '#8B8FA8', fontSize: 12 }} 
                    axisLine={false} 
                    tickLine={false} 
                    dy={10} 
                  />
                  <YAxis 
                    stroke="#8B8FA8" 
                    tick={{ fill: '#8B8FA8', fontSize: 12 }} 
                    axisLine={false} 
                    tickLine={false} 
                    dx={-10} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1A1D27', borderColor: '#2A2D3A', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                    labelStyle={{ color: '#8B8FA8', marginBottom: '4px', fontSize: '12px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    name="Users" 
                    stroke="#6366f1" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#1A1D27', stroke: '#6366f1', strokeWidth: 2 }} 
                    activeDot={{ r: 6, fill: '#6366f1', stroke: '#1A1D27', strokeWidth: 2 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="vendors" 
                    name="Vendors" 
                    stroke="#C9A24D" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#1A1D27', stroke: '#C9A24D', strokeWidth: 2 }} 
                    activeDot={{ r: 6, fill: '#C9A24D', stroke: '#1A1D27', strokeWidth: 2 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right: Bookings by Category */}
          <div className="lg:col-span-1 bg-[#1A1D27] border border-[#2A2D3A] rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-8">Bookings by Category</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height="100%">
                <BarChart data={CATEGORY_BOOKINGS} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2D3A" horizontal={true} vertical={false} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#8B8FA8', fontSize: 12 }} 
                    width={80}
                  />
                  <Tooltip 
                    cursor={{ fill: '#2A2D3A', opacity: 0.4 }}
                    contentStyle={{ backgroundColor: '#1A1D27', borderColor: '#2A2D3A', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    labelStyle={{ display: 'none' }}
                  />
                  <Bar dataKey="value" name="Bookings" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* SECTION 4 — TWO-COLUMN BOTTOM ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Registrations */}
          <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-2xl flex flex-col overflow-hidden">
            <div className="p-6 border-b border-[#2A2D3A]">
              <h2 className="text-lg font-bold text-white">Recent Registrations</h2>
            </div>
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <tbody>
                  {RECENT_REGISTRATIONS.map((user, idx) => (
                    <tr key={user.id} className={`border-b border-[#2A2D3A] hover:bg-[#22253A] transition-colors ${idx === RECENT_REGISTRATIONS.length - 1 ? 'border-b-0' : ''}`}>
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            user.role === 'Vendor' ? 'bg-[var(--color-gold)]/10 text-[var(--color-gold)]' : 'bg-indigo-500/10 text-indigo-400'
                          }`}>
                            {user.initials}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white leading-tight mb-0.5">{user.name}</p>
                            <p className="text-[10px] uppercase tracking-wider text-[#8B8FA8] font-bold">{user.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-xs font-medium text-[#8B8FA8]">{user.date}</td>
                      <td className="p-4 pr-6 text-right">
                        {user.status === 'active' ? (
                          <div className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-emerald-500" title="Active" />
                        ) : (
                          <div className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-amber-500" title="Pending" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-[#2A2D3A] bg-[#0F1117]/50 text-center">
              <Link to="/admin/users" className="text-xs font-bold text-[var(--color-gold)] hover:text-white transition-colors flex items-center justify-center gap-1">
                View All Users <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Pending Vendor Approvals */}
          <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-2xl flex flex-col relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
            <div className="p-6 border-b border-[#2A2D3A] flex items-center gap-3">
              <ShieldAlert className="text-amber-500" size={20} />
              <h2 className="text-lg font-bold text-white">{PENDING_VENDORS.length} Vendors waiting for approval</h2>
            </div>
            <div className="flex-1 p-4 space-y-3">
              {PENDING_VENDORS.length > 0 ? (
                PENDING_VENDORS.map((vendor) => (
                  <div key={vendor.id} className="bg-[#0F1117] border border-[#2A2D3A] rounded-xl p-4 flex items-center justify-between hover:border-[var(--color-gold)]/40 transition-colors">
                    <div>
                      <h3 className="text-sm font-bold text-white">{vendor.company}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-[#8B8FA8] bg-[#1A1D27] px-2 py-0.5 rounded">{vendor.category}</span>
                        <span className="text-[10px] text-[#8B8FA8] flex items-center gap-1">
                          <Clock size={10} /> {vendor.submitted}
                        </span>
                      </div>
                    </div>
                    <Link to="/admin/vendors" className="text-xs font-bold text-[var(--color-gold)] hover:text-white transition-colors flex items-center gap-1">
                      Review <ArrowRight size={14} />
                    </Link>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-emerald-400">
                  <CheckCircle size={32} className="mb-2 opacity-50" />
                  <p className="text-sm font-bold">All vendors approved ✓</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-[#2A2D3A] mt-auto">
              <Link 
                to="/admin/vendors"
                className="w-full py-3 bg-[var(--color-gold)] hover:bg-[#b58f3e] text-[#0F1117] font-extrabold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Go to Approval Queue <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* SECTION 5 — PLATFORM HEALTH STRIP */}
        <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row items-center divide-y md:divide-y-0 md:divide-x divide-[#2A2D3A]">
          <div className="flex-1 w-full flex flex-col items-center py-4 md:py-0">
            <HeartPulse size={24} className="text-pink-500 mb-2 opacity-50" />
            <h4 className="text-2xl font-extrabold text-white">99.97%</h4>
            <p className="text-xs font-bold uppercase tracking-wider text-[#8B8FA8] mt-1">Platform Uptime</p>
          </div>
          <div className="flex-1 w-full flex flex-col items-center py-4 md:py-0">
            <Activity size={24} className="text-emerald-500 mb-2 opacity-50" />
            <h4 className="text-2xl font-extrabold text-white">1.8 <span className="text-base text-white/50">hours</span></h4>
            <p className="text-xs font-bold uppercase tracking-wider text-[#8B8FA8] mt-1">Avg Response Time</p>
          </div>
          <div className="flex-1 w-full flex flex-col items-center py-4 md:py-0">
            <Headphones size={24} className="text-indigo-500 mb-2 opacity-50" />
            <h4 className="text-2xl font-extrabold text-white">12</h4>
            <p className="text-xs font-bold uppercase tracking-wider text-[#8B8FA8] mt-1">Support Tickets Open</p>
          </div>
          <div className="flex-1 w-full flex flex-col items-center py-4 md:py-0">
            <Star size={24} className="text-[var(--color-gold)] mb-2 opacity-50" />
            <h4 className="text-2xl font-extrabold text-white">4.8 <span className="text-base text-white/50">★</span></h4>
            <p className="text-xs font-bold uppercase tracking-wider text-[#8B8FA8] mt-1">Avg Platform Rating</p>
          </div>
        </div>

      </div>
    </PageTransition>
  );
}
