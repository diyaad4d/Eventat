import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell, Star, DollarSign, CheckCircle2,
  XCircle, CalendarPlus, X, CheckCheck,
} from 'lucide-react';
import EmptyState from '../../components/shared/EmptyState';

const MOCK_NOTIFICATIONS = [
  {
    id: 'n1',
    type: 'booking_new',
    title: 'New Booking Request',
    message: 'Ahmad M. requested Grand Royal Ballroom for Aug 10, 2026.',
    time: '2 minutes ago',
    isRead: false,
    actionLabel: 'View Request',
    actionLink: '/vendor/bookings',
    avatar: 'https://i.pravatar.cc/150?img=11',
  },
  {
    id: 'n2',
    type: 'review_new',
    title: 'New 5-Star Review',
    message: 'Sarah Al-Ahmad left a 5-star review on Grand Royal Ballroom.',
    time: '1 hour ago',
    isRead: false,
    actionLabel: 'See Review',
    actionLink: '/vendors/v1',
    avatar: 'https://i.pravatar.cc/150?img=47',
  },
  {
    id: 'n3',
    type: 'payment',
    title: 'Payment Received',
    message: 'Payment of 1,500 JOD cleared to your account for booking BR-1001.',
    time: '3 hours ago',
    isRead: false,
    actionLabel: 'View Booking',
    actionLink: '/vendor/bookings',
    avatar: null,
  },
  {
    id: 'n4',
    type: 'booking_confirmed',
    title: 'Booking Confirmed',
    message: 'You confirmed Lina K.\'s booking for Elite Catering on Sep 5, 2026.',
    time: '5 hours ago',
    isRead: true,
    actionLabel: 'View Booking',
    actionLink: '/vendor/bookings',
    avatar: 'https://i.pravatar.cc/150?img=32',
  },
  {
    id: 'n5',
    type: 'booking_cancelled',
    title: 'Booking Cancelled',
    message: 'Rania H. cancelled her booking for Elite Catering (Jun 25).',
    time: '1 day ago',
    isRead: true,
    actionLabel: 'View Details',
    actionLink: '/vendor/bookings',
    avatar: 'https://i.pravatar.cc/150?img=25',
  },
  {
    id: 'n6',
    type: 'system',
    title: 'Profile Incomplete',
    message: 'Add your website link to complete your profile and attract more clients.',
    time: '2 days ago',
    isRead: true,
    actionLabel: 'Complete Profile',
    actionLink: '/vendor/profile',
    avatar: null,
  },
  {
    id: 'n7',
    type: 'review_new',
    title: 'New Review',
    message: 'Omar Khalil left a 5-star review on The Pearl Ballroom.',
    time: '3 days ago',
    isRead: true,
    actionLabel: 'See Review',
    actionLink: '/vendors/v1',
    avatar: 'https://i.pravatar.cc/150?img=12',
  },
  {
    id: 'n8',
    type: 'payment',
    title: 'Payment Received',
    message: 'Payment of 850 JOD cleared for booking BR-0950.',
    time: '4 days ago',
    isRead: true,
    actionLabel: 'View Booking',
    actionLink: '/vendor/bookings',
    avatar: null,
  },
];

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
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState('all');

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'bookings') 
      return n.type.startsWith('booking');
    if (filter === 'reviews')  return n.type === 'review_new';
    if (filter === 'payments') return n.type === 'payment';
    return true;
  });

  const markAllRead = () =>
    setNotifications(prev => prev.map(n => ({...n, isRead: true})));

  const markRead = (id) =>
    setNotifications(prev =>
      prev.map(n => n.id === id ? {...n, isRead: true} : n)
    );

  const deleteNotification = (id) =>
    setNotifications(prev => prev.filter(n => n.id !== id));

  const FILTERS = [
    { id: 'all',      label: 'All',      count: notifications.length },
    { id: 'unread',   label: 'Unread',   count: unreadCount          },
    { id: 'bookings', label: 'Bookings', count: notifications.filter(n=>n.type.startsWith('booking')).length },
    { id: 'reviews',  label: 'Reviews',  count: notifications.filter(n=>n.type==='review_new').length },
    { id: 'payments', label: 'Payments', count: notifications.filter(n=>n.type==='payment').length },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto pb-16">

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
    </div>
  );
}

export default VendorNotifications;
