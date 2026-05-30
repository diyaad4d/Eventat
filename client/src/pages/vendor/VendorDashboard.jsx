import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageTransition from '../../components/shared/PageTransition';
import { 
  Briefcase, ClipboardList, CheckCircle, DollarSign, 
  Plus, ArrowRight, Check, X, Bell,
  ArrowUpRight, ArrowDownRight, Star, Edit2, TrendingUp
} from 'lucide-react';

const INITIAL_REQUESTS = [
  { id: 'req_1', customer: 'Ahmad M.', service: 'Grand Royal Ballroom', date: '2026-08-10', price: 1500, avatar: 'https://i.pravatar.cc/150?img=11' },
  { id: 'req_2', customer: 'Lina K.', service: 'Elite Catering', date: '2026-09-05', price: 850, avatar: 'https://i.pravatar.cc/150?img=32' },
  { id: 'req_3', customer: 'Omar S.', service: 'Grand Royal Ballroom', date: '2026-07-22', price: 1200, avatar: 'https://i.pravatar.cc/150?img=12' },
];

const MOCK_ACTIVITY = [
  { id: 1, text: 'You accepted a booking for Elite Catering.', time: '2 hours ago' },
  { id: 2, text: 'New 5-star review from Sarah on Grand Royal Ballroom.', time: '5 hours ago' },
  { id: 3, text: 'Payment of 500 JOD cleared to your account.', time: '1 day ago' },
  { id: 4, text: 'You updated the price for Elite Catering.', time: '2 days ago' },
];

function VendorDashboard() {
  const [requests, setRequests] = useState(INITIAL_REQUESTS);

  const computedKPIs = {
    totalServices:       3,
    pendingRequests:     requests.length,
    confirmedThisMonth:  12,
    totalRevenue:        requests.reduce((s, r) => s + r.price, 0),
  };

  const handleAction = (id, action) => {
    // In a real app, this would trigger an API call. For now, just remove from the list.
    setRequests(prev => prev.filter(req => req.id !== id));
  };

  const KPI_CONFIG = [
    {
      label:    'Active Services',
      value:    computedKPIs.totalServices,
      suffix:   '',
      trend:    '+1',
      trendPct: '+20%',
      up:       true,
      icon:     <Briefcase size={22} />,
      iconBg:   'bg-indigo-50 text-indigo-600',
      bars:     [2, 3, 2, 4, 3, 3],
      barColor: '#6366f1',
    },
    {
      label:    'Pending Requests',
      value:    computedKPIs.pendingRequests,
      suffix:   '',
      trend:    '+2',
      trendPct: '+50%',
      up:       false,
      icon:     <ClipboardList size={22} />,
      iconBg:   'bg-amber-50 text-amber-600',
      bars:     [1, 2, 3, 2, 4, 3],
      barColor: '#f59e0b',
    },
    {
      label:    'Confirmed (Month)',
      value:    computedKPIs.confirmedThisMonth,
      suffix:   '',
      trend:    '+3',
      trendPct: '+33%',
      up:       true,
      icon:     <CheckCircle size={22} />,
      iconBg:   'bg-emerald-50 text-emerald-600',
      bars:     [4, 6, 8, 9, 10, 12],
      barColor: '#10b981',
    },
    {
      label:    'Total Revenue',
      value:    computedKPIs.totalRevenue.toLocaleString(),
      suffix:   ' JOD',
      trend:    '+18%',
      trendPct: '+18%',
      up:       true,
      icon:     <DollarSign size={22} />,
      iconBg:   'bg-[var(--color-gold)]/10 text-[var(--color-gold-dark)]',
      bars:     [20, 35, 28, 45, 38, 55],
      barColor: '#C9A24D',
    },
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
        {KPI_CONFIG.map((kpi, index) => (
          <div key={index} className="bg-white rounded-2xl border border-gray-100 shadow-sm 
            p-5 flex flex-col gap-4 hover:-translate-y-0.5 hover:shadow-md 
            transition-all duration-200 cursor-default">
            
            <div className="flex items-start justify-between">
              <div className={`w-11 h-11 rounded-xl flex items-center 
                justify-center shrink-0 ${kpi.iconBg}`}>
                {kpi.icon}
              </div>
              <span className={`flex items-center gap-1 text-xs font-bold 
                px-2 py-1 rounded-full ${kpi.up 
                  ? 'bg-emerald-50 text-emerald-700' 
                  : 'bg-red-50 text-red-600'}`}>
                {kpi.up ? <ArrowUpRight size={11}/> : <ArrowDownRight size={11}/>}
                {kpi.trendPct}
              </span>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 mb-0.5">{kpi.label}</p>
              <p className="text-3xl font-black text-[var(--color-dark)]">
                {kpi.value}<span className="text-base font-medium text-gray-400">
                {kpi.suffix ? ' ' + kpi.suffix : ''}</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">{kpi.trend} since last month</p>
            </div>

            {/* Mini sparkline */}
            <div className="flex items-end gap-0.5 h-8">
              {kpi.bars.map((h, i) => {
                const max = Math.max(...kpi.bars);
                return (
                  <div key={i}
                    className="flex-1 rounded-sm transition-all duration-300"
                    style={{ 
                      height: `${(h/max)*100}%`,
                      background: i === kpi.bars.length - 1 
                        ? kpi.barColor 
                        : `${kpi.barColor}44`
                    }}
                  />
                );
              })}
            </div>
          </div>
        ))}
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
            {requests.length === 0 ? (
              <div className="p-8 text-center text-gray-500">You have no pending requests. Great job!</div>
            ) : (
              requests.map((req) => {
                const daysUntil = Math.ceil((new Date(req.date) - new Date()) / 86400000);
                return (
                  <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <img src={req.avatar} alt={req.customer} className="w-12 h-12 rounded-full object-cover shrink-0" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-[var(--color-dark)]">{req.customer}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            daysUntil <= 7 ? 'bg-red-50 text-red-700' :
                            daysUntil <= 30 ? 'bg-amber-50 text-amber-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {daysUntil <= 7 ? `Urgent · ${daysUntil}d` : daysUntil <= 30 ? `Soon · ${daysUntil}d` : `${daysUntil}d away`}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">Requested: <span className="font-semibold text-gray-700">{req.service}</span></p>
                        <p className="text-xs text-gray-500">Event Date: <span className="font-semibold text-[var(--color-gold-dark)]">{req.date}</span></p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between sm:justify-end gap-4 sm:gap-6 sm:w-auto w-full mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-gray-100">
                      <span className="font-extrabold text-[var(--color-dark)] text-lg">{req.price} <span className="text-sm font-semibold text-gray-500">JOD</span></span>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                        <button onClick={() => handleAction(req.id, 'accept')} className="flex justify-center items-center gap-1.5 px-4 py-3 sm:py-2 rounded-full min-h-[44px] sm:min-h-0 bg-green-50 text-green-700 hover:bg-green-100 font-bold text-sm transition-colors">
                          <Check size={16} /> Accept
                        </button>
                        <button onClick={() => handleAction(req.id, 'reject')} className="flex justify-center items-center gap-1.5 px-4 py-3 sm:py-2 rounded-full min-h-[44px] sm:min-h-0 bg-red-50 text-red-600 hover:bg-red-100 font-bold text-sm transition-colors">
                          <X size={16} /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Recent Activity */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-[var(--color-dark)]">Recent Activity</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex flex-col gap-6">
              {MOCK_ACTIVITY.map((act) => {
                let ActIcon = Bell;
                let iconBg = "bg-gray-50 text-gray-500";
                
                if (act.text.includes('accepted')) {
                  ActIcon = CheckCircle;
                  iconBg = "bg-green-50 text-green-600";
                } else if (act.text.toLowerCase().includes('review')) {
                  ActIcon = Star;
                  iconBg = "bg-amber-50 text-amber-500";
                } else if (act.text.toLowerCase().includes('payment')) {
                  ActIcon = DollarSign;
                  iconBg = "bg-[var(--color-gold)]/10 text-[var(--color-gold-dark)]";
                } else if (act.text.toLowerCase().includes('updated')) {
                  ActIcon = Edit2;
                  iconBg = "bg-blue-50 text-blue-600";
                }

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
