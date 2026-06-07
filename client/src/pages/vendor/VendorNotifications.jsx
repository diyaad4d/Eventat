import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markAsRead, markAllAsRead } from '../../services/notifications.service';
import {
  Bell, Star, DollarSign, CheckCircle2,
  XCircle, CalendarPlus, X, CheckCheck,
} from 'lucide-react';
import EmptyState from '../../components/shared/EmptyState';

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours   = Math.floor(diff / 3600000);
  const days    = Math.floor(diff / 86400000);
  if (minutes < 60)  return `${minutes} minutes ago`;
  if (hours   < 24)  return `${hours} hours ago`;
  return `${days} days ago`;
};

const TYPE_CONFIG = {
  booking_new: {
    icon:    <CalendarPlus size={18} />,
    iconBg:  'bg-amber-50 text-amber-600',
    dotColor:'bg-amber-500',
    label:   'New Booking',
  },
  booking_confirmed: {
    icon:    <CheckCircle2 size={18} />,
    iconBg:  'bg-emerald-50 text-emerald-600',
    dotColor:'bg-emerald-500',
    label:   'Confirmed',
  },
  booking_cancelled: {
    icon:    <XCircle size={18} />,
    iconBg:  'bg-red-50 text-red-500',
    dotColor:'bg-red-500',
    label:   'Cancelled',
  },
  review_new: {
    icon:    <Star size={18} />,
    iconBg:  'bg-yellow-50 text-yellow-500',
    dotColor:'bg-yellow-400',
    label:   'Review',
  },
  payment: {
    icon:    <DollarSign size={18} />,
    iconBg:  'bg-[var(--color-gold)]/10 text-[var(--color-gold-dark)]',
    dotColor:'bg-[var(--color-gold)]',
    label:   'Payment',
  },
  system: {
    icon:    <Bell size={18} />,
    iconBg:  'bg-indigo-50 text-indigo-500',
    dotColor:'bg-indigo-400',
    label:   'System',
  },
};

function VendorNotifications() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');

  const {
    data: notifData,
    isLoading: notifLoading,
  } = useQuery({
    queryKey: ['vendor-notifications'],
    queryFn: () => getNotifications({ limit: 50 }),
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });

  const notifications = (notifData?.notifications ?? []).map((n) => ({
    id: n.notification_id ?? n.id,
    type: n.notification_type ?? n.type ?? 'system',
    title: n.title,
    message: n.message_body ?? n.message,
    time: formatTimeAgo(n.created_at),
    isRead: n.is_read ?? false,
    actionLabel: n.action_url ? 'View' : null,
    actionLink: n.action_url ?? '#',
    avatar: n.avatar_url ?? null,
  }));

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'bookings') 
      return n.type.startsWith('booking');
    if (filter === 'reviews')  return n.type === 'review_new';
    if (filter === 'payments') return n.type === 'payment';
    return true;
  });

  const markAllMutation = useMutation({
    mutationFn: () => markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-notifications-count'] });
    },
  });

  const markAllRead = () => {
    markAllMutation.mutate();
  };

  const markReadMutation = useMutation({
    mutationFn: (id) => markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-notifications-count'] });
    },
  });

  const markRead = (id) => {
    markReadMutation.mutate(id);
  };

  const deleteNotification = (id) => {
    queryClient.setQueryData(['vendor-notifications'], (old) => {
      if (!old) return old;
      return {
        ...old,
        notifications: (old.notifications ?? []).filter(
          (n) => (n.notification_id ?? n.id) !== id
        ),
      };
    });
  };

  const FILTERS = [
    { id: 'all',      label: 'All',      count: notifications.length },
    { id: 'unread',   label: 'Unread',   count: unreadCount          },
    { id: 'bookings', label: 'Bookings', count: notifications.filter(n=>n.type.startsWith('booking')).length },
    { id: 'reviews',  label: 'Reviews',  count: notifications.filter(n=>n.type==='review_new').length },
    { id: 'payments', label: 'Payments', count: notifications.filter(n=>n.type==='payment').length },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto pb-16">
      {notifLoading ? (
        <div className="flex flex-col gap-2 mt-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse flex items-start gap-4 p-4 rounded-2xl border border-gray-100 bg-white"
            >
              <div className="w-11 h-11 rounded-full bg-gray-200 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
                <div className="h-3 bg-gray-100 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>

      {/* ══ HEADER ══ */}
      <div className="flex flex-col sm:flex-row sm:items-center 
        justify-between gap-4 mb-8">
        <div>
          <p className="text-[11px] font-bold text-[var(--color-gold)] 
            uppercase tracking-[0.18em] mb-1">
            Vendor Dashboard
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold 
            text-[var(--color-dark)] flex items-center gap-3">
            Notifications
            {unreadCount > 0 && (
              <span className="text-base font-black px-2.5 py-0.5 
                rounded-full bg-red-500 text-white">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Stay updated on bookings, reviews, and payments.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2.5 
              bg-white border border-gray-200 text-gray-700 
              text-sm font-bold rounded-xl 
              hover:border-[var(--color-gold)] 
              hover:text-[var(--color-gold)]
              transition-colors shrink-0"
          >
            <CheckCheck size={15}/> Mark all as read
          </button>
        )}
      </div>

      {/* ══ FILTER TABS ══ */}
      <div className="flex gap-2 flex-wrap mb-6">
        {FILTERS.map(f => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl 
              text-sm font-bold transition-all
              ${filter === f.id
                ? 'bg-[var(--color-gold)] text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]'}`}
          >
            {f.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-black
              ${filter === f.id
                ? 'bg-white/25 text-white'
                : 'bg-gray-100 text-gray-500'}`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* ══ NOTIFICATIONS LIST ══ */}
      {filtered.length === 0 ? (
        <EmptyState variant="no-notifications" />
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((notif) => {
            const cfg = TYPE_CONFIG[notif.type];
            return (
              <div
                key={notif.id}
                onClick={() => markRead(notif.id)}
                className={`relative flex items-start gap-4 p-4 sm:p-5 
                  rounded-2xl border transition-all cursor-pointer group
                  ${!notif.isRead
                    ? 'bg-white border-[var(--color-gold)]/25 shadow-sm hover:shadow-md'
                    : 'bg-white border-gray-100 hover:border-gray-200'}`}
              >
                {/* Unread dot */}
                {!notif.isRead && (
                  <div className={`absolute top-4 right-4 w-2.5 h-2.5 
                    rounded-full shrink-0 ${cfg.dotColor}`} />
                )}

                {/* Icon or Avatar */}
                <div className="shrink-0">
                  {notif.avatar ? (
                    <div className="relative">
                      <img
                        src={notif.avatar}
                        alt=""
                        className="w-11 h-11 rounded-full object-cover"
                      />
                      <div className={`absolute -bottom-1 -right-1 
                        w-5 h-5 rounded-full flex items-center 
                        justify-center border-2 border-white ${cfg.iconBg}`}
                        style={{ fontSize: '10px' }}>
                        <span className="scale-75">{cfg.icon}</span>
                      </div>
                    </div>
                  ) : (
                    <div className={`w-11 h-11 rounded-full flex 
                      items-center justify-center ${cfg.iconBg}`}>
                      {cfg.icon}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between 
                    gap-2 mb-0.5">
                    <p className={`text-sm font-bold leading-snug
                      ${!notif.isRead 
                        ? 'text-[var(--color-dark)]' 
                        : 'text-gray-700'}`}>
                      {notif.title}
                    </p>
                    <span className="text-[10px] text-gray-400 
                      whitespace-nowrap shrink-0 mt-0.5">
                      {notif.time}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed mb-2">
                    {notif.message}
                  </p>
                  <div className="flex items-center gap-3">
                    <Link
                      to={notif.actionLink}
                      onClick={e => e.stopPropagation()}
                      className="text-xs font-bold text-[var(--color-gold)] 
                        hover:text-[var(--color-gold-dark)] 
                        hover:underline transition-colors"
                    >
                      {notif.actionLabel} →
                    </Link>
                    {/* Type badge */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 
                      rounded-full ${cfg.iconBg}`}>
                      {cfg.label}
                    </span>
                  </div>
                </div>

                {/* Delete button — visible on hover */}
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    deleteNotification(notif.id);
                  }}
                  className="shrink-0 w-7 h-7 rounded-full 
                    flex items-center justify-center
                    text-gray-300 hover:text-red-500 
                    hover:bg-red-50 transition-all
                    opacity-0 group-hover:opacity-100"
                  aria-label="Delete notification"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
      </>
      )}
    </div>
  );
}

export default VendorNotifications;
