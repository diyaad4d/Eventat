import React, { useState } from 'react';
import { 
  Bell, Check, Trash2, ShieldAlert, ShieldCheck, 
  Info, AlertTriangle, Building2, CreditCard, Star, Users
} from 'lucide-react';
import { Link } from 'react-router-dom';

// ─────────────────────────────────────────────────────────────
//  MOCK DATA
// ─────────────────────────────────────────────────────────────

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: 'alert',
    title: 'New Vendor Registration',
    message: 'Royal Catering has submitted a vendor application and is pending approval.',
    time: '10 mins ago',
    isUnread: true,
    icon: Building2,
    link: '/admin/vendors'
  },
  {
    id: 2,
    type: 'warning',
    title: 'High Dispute Rate',
    message: 'Vendor "Elite Audio Visual" has received 3 disputes in the last 7 days.',
    time: '2 hours ago',
    isUnread: true,
    icon: AlertTriangle,
    link: '/admin/vendors'
  },
  {
    id: 3,
    type: 'success',
    title: 'Payout Processed',
    message: 'Monthly payouts to 45 vendors have been successfully processed.',
    time: 'Yesterday',
    isUnread: false,
    icon: CreditCard,
    link: '/admin/analytics'
  },
  {
    id: 4,
    type: 'info',
    title: 'New Review Milestone',
    message: 'The platform just reached 10,000 verified user reviews!',
    time: 'Yesterday',
    isUnread: false,
    icon: Star,
    link: null
  },
  {
    id: 5,
    type: 'alert',
    title: 'Profile Update Review',
    message: 'Vendor "Diamond Events" has requested profile updates. Review pending.',
    time: '2 days ago',
    isUnread: false,
    icon: ShieldAlert,
    link: '/admin/vendors'
  },
  {
    id: 6,
    type: 'info',
    title: 'System Update Completed',
    message: 'v2.4.1 has been deployed successfully. All services operating normally.',
    time: '3 days ago',
    isUnread: false,
    icon: ShieldCheck,
    link: null
  },
  {
    id: 7,
    type: 'alert',
    title: 'Suspicious Activity Detected',
    message: 'Multiple failed login attempts detected from IP 192.168.1.100 on Admin account.',
    time: '4 days ago',
    isUnread: false,
    icon: ShieldAlert,
    link: null
  }
];

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState('all');

  const unreadCount = notifications.filter(n => n.isUnread).length;

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return n.isUnread;
    return true;
  });

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isUnread: false })));
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isUnread: false } : n));
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'alert': return 'text-amber-500 bg-amber-500/10';
      case 'warning': return 'text-red-400 bg-red-500/10';
      case 'success': return 'text-emerald-400 bg-emerald-500/10';
      case 'info':
      default: return 'text-indigo-400 bg-indigo-500/10';
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1117] p-6 lg:p-8 font-sans">
      <div className="max-w-[800px] mx-auto space-y-8">
        
        {/* ══ HEADER ══ */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold text-[var(--color-gold)] uppercase tracking-[0.18em] mb-1">
              Admin Panel
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              Notifications
              {unreadCount > 0 && (
                <span className="bg-amber-500 text-[#0F1117] text-xs font-black px-2.5 py-1 rounded-full">
                  {unreadCount} New
                </span>
              )}
            </h1>
            <p className="text-sm text-[#8B8FA8] mt-1">
              System alerts, vendor updates, and platform notifications.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-2 px-4 py-2 bg-[#1A1D27] border border-[#2A2D3A] text-white rounded-xl hover:bg-[#2A2D3A] transition-colors text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check size={16} /> Mark all read
            </button>
          </div>
        </div>

        {/* ══ FILTERS ══ */}
        <div className="flex bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-1 w-fit">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              filter === 'all' ? 'bg-[#2A2D3A] text-white shadow-sm' : 'text-[#8B8FA8] hover:text-white'
            }`}
          >
            All Notifications
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              filter === 'unread' ? 'bg-[#2A2D3A] text-white shadow-sm' : 'text-[#8B8FA8] hover:text-white'
            }`}
          >
            Unread
            {unreadCount > 0 && (
              <span className={`w-2 h-2 rounded-full ${filter === 'unread' ? 'bg-amber-500' : 'bg-amber-500/50'}`} />
            )}
          </button>
        </div>

        {/* ══ NOTIFICATIONS LIST ══ */}
        <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-2xl overflow-hidden flex flex-col">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 bg-[#2A2D3A]/50 rounded-full flex items-center justify-center mb-4">
                <Bell size={24} className="text-[#8B8FA8]" />
              </div>
              <h3 className="text-lg font-bold text-white">All caught up!</h3>
              <p className="text-sm text-[#8B8FA8] mt-1">You don't have any notifications right now.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#2A2D3A]">
              {filteredNotifications.map((notif) => {
                const Icon = notif.icon;
                return (
                  <div 
                    key={notif.id} 
                    className={`p-5 flex gap-4 transition-colors ${
                      notif.isUnread ? 'bg-[#0F1117]/50 hover:bg-[#0F1117]/80' : 'hover:bg-[#2A2D3A]/20'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-1 ${getIconColor(notif.type)}`}>
                      <Icon size={18} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className={`text-sm font-bold truncate pr-4 ${notif.isUnread ? 'text-white' : 'text-[#8B8FA8]'}`}>
                          {notif.title}
                        </h3>
                        <span className="text-xs font-semibold text-[#8B8FA8] shrink-0 whitespace-nowrap">
                          {notif.time}
                        </span>
                      </div>
                      
                      <p className="text-sm text-[#8B8FA8] leading-relaxed mb-3">
                        {notif.message}
                      </p>
                      
                      <div className="flex items-center gap-4">
                        {notif.link && (
                          <Link 
                            to={notif.link}
                            className="text-xs font-bold text-[var(--color-gold)] hover:text-white transition-colors"
                          >
                            View Details →
                          </Link>
                        )}
                        {notif.isUnread && (
                          <button 
                            onClick={() => markAsRead(notif.id)}
                            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>

                    <button 
                      onClick={() => deleteNotification(notif.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-[#8B8FA8] hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
