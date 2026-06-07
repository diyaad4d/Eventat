import React from 'react';
import { Bell, CheckCircle2, ShoppingBag, Info, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as notificationsService from '../../services/notifications.service';
import { toastError } from '../../utils/toast';

// ── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  if (mins < 1)     return 'just now';
  if (mins < 60)    return `${mins} min${mins !== 1 ? 's' : ''} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24)   return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  const days  = Math.floor(hours / 24);
  if (days < 7)     return `${days} day${days !== 1 ? 's' : ''} ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getIcon(type) {
  switch (type) {
    case 'booking_new':
    case 'booking_cancelled':
    case 'booking_status':
      return <ShoppingBag size={20} className="text-blue-500" />;
    case 'review_new':
      return <CheckCircle2 size={20} className="text-[var(--color-gold)]" />;
    case 'plan_reminder':
      return <AlertCircle size={20} className="text-amber-500" />;
    default:
      return <Info size={20} className="text-gray-400" />;
  }
}

// ── Skeleton row ─────────────────────────────────────────────────────────────
function NotifSkeleton() {
  return (
    <div className="flex gap-4 p-5 border-b border-gray-50 animate-pulse">
      <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0 mt-0.5" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-1/4" />
      </div>
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────────────────
function CustomerNotifications() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ── Notifications query ──────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn:  () => notificationsService.getNotifications({ limit: 50 }),
    staleTime: 1000 * 60 * 1,
    refetchInterval: 1000 * 60 * 2,
  });

  const notifications = data?.data?.notifications ?? [];
  const unreadCount   = data?.data?.unread_count   ?? 0;

  // ── Mark single as read ──────────────────────────────────────────────
  const markReadMutation = useMutation({
    mutationFn: (notifId) => notificationsService.markAsRead(notifId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: () => {
      toastError('Failed to mark notification as read.');
    },
  });

  // ── Mark all as read ─────────────────────────────────────────────────
  const markAllMutation = useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: () => {
      toastError('Failed to mark notifications as read.');
    },
  });

  // ── Click handler ────────────────────────────────────────────────────
  const handleNotifClick = (notif) => {
    if (!notif.is_read) {
      markReadMutation.mutate(notif.notification_id);
    }
    if (notif.action_url) {
      navigate(notif.action_url);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto pb-12">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-dark)]">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">Stay updated with your events and bookings.</p>
        </div>
        <button
          onClick={() => markAllMutation.mutate()}
          disabled={unreadCount === 0 || markAllMutation.isPending}
          className="text-sm font-bold text-[var(--color-gold)] hover:text-[var(--color-gold-dark)] transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {markAllMutation.isPending && <Loader2 size={14} className="animate-spin" />}
          Mark all as read
        </button>
      </div>

      {/* Notifications list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <>
            <NotifSkeleton />
            <NotifSkeleton />
            <NotifSkeleton />
            <NotifSkeleton />
            <NotifSkeleton />
          </>
        ) : notifications.length === 0 ? (
          <div className="p-12 flex flex-col items-center text-center">
            <Bell size={40} className="text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">You're all caught up!</p>
            <p className="text-sm text-gray-400 mt-1">No notifications yet. We'll notify you about your bookings and events.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.notification_id}
              onClick={() => handleNotifClick(n)}
              className={`flex gap-4 p-5 border-b border-gray-50 last:border-0 cursor-pointer transition-colors ${
                n.is_read
                  ? 'bg-white hover:bg-gray-50/60'
                  : 'bg-blue-50/30 hover:bg-blue-50/50'
              }`}
            >
              <div className="shrink-0 mt-1">{getIcon(n.notification_type)}</div>
              <div className="flex-1 min-w-0">
                {n.title && (
                  <p className={`text-sm font-bold ${n.is_read ? 'text-gray-700' : 'text-[var(--color-dark)]'}`}>
                    {n.title}
                  </p>
                )}
                {n.message_body && (
                  <p className={`text-sm mt-0.5 ${n.is_read ? 'text-gray-500' : 'text-gray-700 font-medium'}`}>
                    {n.message_body}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1.5">{timeAgo(n.created_at)}</p>
              </div>
              {!n.is_read && (
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-gold)] shrink-0 mt-1.5" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CustomerNotifications;
