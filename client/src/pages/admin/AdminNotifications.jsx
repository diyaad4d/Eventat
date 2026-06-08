import React, { useState } from 'react';
import { 
  Bell, Check, Trash2, ShieldAlert, ShieldCheck, 
  Info, AlertTriangle, Building2, CreditCard, Star, Users
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markAsRead, markAllAsRead } from '../../services/notifications.service';
import { formatDistanceToNow } from 'date-fns';

const getIconForType = (type) => {
  switch (type) {
    case 'vendor_approved':
    case 'account_reinstated':
    case 'profile_changes_approved':
      return ShieldCheck;
    case 'vendor_rejected':
    case 'account_banned':
      return ShieldAlert;
    case 'booking_created':
    case 'booking_status_updated':
      return AlertTriangle;
    default:
      return Info;
  }
};

export default function AdminNotifications() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'

  const { data, isLoading } = useQuery({
    queryKey: ['admin-notifications', filter],
    queryFn: () => getNotifications({ 
      unread_only: filter === 'unread' ? true : undefined,
      limit: 50 // fetch latest 50
    })
  });

  const notifications = data?.data?.notifications || [];
  const unreadCount = data?.data?.unread_count || 0;

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      import('../../utils/toast').then(m => m.toastSuccess('All notifications marked as read'));
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id) => markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    }
  });

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
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={unreadCount === 0 || markAllAsReadMutation.isPending}
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
          {isLoading ? (
            <div className="p-8 text-center text-[#8B8FA8]">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 bg-[#2A2D3A]/50 rounded-full flex items-center justify-center mb-4">
                <Bell size={24} className="text-[#8B8FA8]" />
              </div>
              <h3 className="text-lg font-bold text-white">All caught up!</h3>
              <p className="text-sm text-[#8B8FA8] mt-1">You don't have any notifications right now.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#2A2D3A]">
              {notifications.map((notif) => {
                const Icon = getIconForType(notif.notification_type);
                const isUnread = !notif.is_read;
                return (
                  <div 
                    key={notif.notification_id} 
                    className={`p-5 flex gap-4 transition-colors ${
                      isUnread ? 'bg-[#0F1117]/50 hover:bg-[#0F1117]/80' : 'hover:bg-[#2A2D3A]/20'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-1 ${getIconColor(notif.notification_type)}`}>
                      <Icon size={18} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className={`text-sm font-bold truncate pr-4 ${isUnread ? 'text-white' : 'text-[#8B8FA8]'}`}>
                          {notif.title}
                        </h3>
                        <span className="text-xs font-semibold text-[#8B8FA8] shrink-0 whitespace-nowrap">
                          {notif.created_at ? formatDistanceToNow(new Date(notif.created_at), { addSuffix: true }) : 'N/A'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-[#8B8FA8] leading-relaxed mb-3">
                        {notif.message_body}
                      </p>
                      
                      <div className="flex items-center gap-4">
                        {notif.action_url && (
                          <Link 
                            to={notif.action_url}
                            className="text-xs font-bold text-[var(--color-gold)] hover:text-white transition-colors"
                          >
                            View Details →
                          </Link>
                        )}
                        {isUnread && (
                          <button 
                            onClick={() => markAsReadMutation.mutate(notif.notification_id)}
                            disabled={markAsReadMutation.isPending}
                            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
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
