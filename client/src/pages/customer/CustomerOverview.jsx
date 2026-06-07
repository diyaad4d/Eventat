import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ClipboardList, Clock, Plus, Search, MapPin, MoreHorizontal, Bell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import useAuthStore from '../../store/authStore';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import * as bookingsService     from '../../services/bookings.service';
import * as notificationsService from '../../services/notifications.service';

// ── Helpers ────────────────────────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return iso; }
}

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  if (mins < 60)    return `${mins} min${mins !== 1 ? 's' : ''} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24)   return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  const days  = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

// ── Status badge variant mapping (vendor_item_status) ──────────────────────
function statusVariant(status) {
  switch (status) {
    case 'accepted':   return 'success';
    case 'pending':    return 'warning';
    case 'rejected':   return 'error';
    case 'completed':  return 'info';
    case 'cancelled':  return 'error';
    default:           return 'gray';
  }
}

// ── Skeleton helpers ────────────────────────────────────────────────────────
function StatSkeleton() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 animate-pulse">
      <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0" />
      <div className="flex flex-col gap-2 flex-1">
        <div className="h-3 bg-gray-200 rounded w-24" />
        <div className="h-6 bg-gray-200 rounded w-10" />
      </div>
    </div>
  );
}

function BookingSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-50 animate-pulse">
      <div className="w-16 h-16 rounded-xl bg-gray-200 shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
      <div className="h-6 w-20 bg-gray-200 rounded-full shrink-0" />
    </div>
  );
}

// ── Component ───────────────────────────────────────────────────────────────
function CustomerOverview() {
  const { user } = useAuthStore();

  // QUERY 1 — upcoming accepted bookings (up to 3)
  const { data: upcomingData, isLoading: upcomingLoading } = useQuery({
    queryKey: ['my-bookings', { limit: 3, status: 'accepted' }],
    queryFn:  () => bookingsService.getMyBookings({ limit: 3, status: 'accepted' }),
    staleTime: 1000 * 60 * 2,
  });
  const upcomingBookings = upcomingData?.data?.bookings ?? [];

  // QUERY 2 — event plans total (for "Active Events" KPI)
  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: ['my-event-plans'],
    queryFn:  () => bookingsService.getMyEventPlans(),
    staleTime: 1000 * 60 * 2,
  });
  const totalPlans = plansData?.data?.plans?.length ?? 0;

  // QUERY 3 — bookings total count (for "Total Bookings" KPI)
  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ['my-bookings', { limit: 1 }],
    queryFn:  () => bookingsService.getMyBookings({ limit: 1 }),
    staleTime: 1000 * 60 * 2,
  });
  const totalBookings = bookingsData?.data?.pagination?.total ?? 0;

  // QUERY 4 — recent notifications for activity feed
  const { data: notifData } = useQuery({
    queryKey: ['notifications', { limit: 5 }],
    queryFn:  () => notificationsService.getNotifications({ limit: 5 }),
    staleTime: 1000 * 60 * 1,
    refetchInterval: 1000 * 60 * 2,
  });
  const activities = notifData?.data?.notifications?.slice(0, 5) ?? [];

  const statsLoading = plansLoading || bookingsLoading;

  return (
    <div className="w-full">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Avatar src={user?.avatar_url} alt={user?.full_name || user?.username} size="lg" />
          <h1 className="text-2xl font-extrabold text-[var(--color-dark)]">
            Welcome back, {user?.full_name || user?.username || 'Guest'}!
          </h1>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Link
            to="/services"
            className="px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all bg-white border border-gray-200 text-gray-700 hover:border-[var(--color-gold)] flex-1 sm:flex-none"
          >
            <Search size={16} /> Browse Services
          </Link>
          <Link
            to="/customer/events"
            className="px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all bg-[var(--color-gold)] text-white hover:bg-[var(--color-gold-dark)] shadow-sm flex-1 sm:flex-none"
          >
            <Plus size={16} /> Plan New Event
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statsLoading ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          <>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--color-gold)]/10 text-[var(--color-gold)] shrink-0">
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Active Events</p>
                <p className="text-2xl font-bold text-[var(--color-dark)]">{totalPlans}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--color-gold)]/10 text-[var(--color-gold)] shrink-0">
                <ClipboardList size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Bookings</p>
                <p className="text-2xl font-bold text-[var(--color-dark)]">{totalBookings}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--color-gold)]/10 text-[var(--color-gold)] shrink-0">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Upcoming Events</p>
                <p className="text-2xl font-bold text-[var(--color-dark)]">{upcomingBookings.length}</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column - Upcoming Bookings */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-bold mb-4 text-[var(--color-dark)]">Upcoming Bookings</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {upcomingLoading ? (
              <>
                <BookingSkeleton />
                <BookingSkeleton />
                <BookingSkeleton />
              </>
            ) : upcomingBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <Calendar size={40} className="text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm font-medium">No upcoming bookings yet.</p>
                <Link to="/services" className="mt-3 text-sm font-bold text-[var(--color-gold)] hover:underline">
                  Browse services →
                </Link>
              </div>
            ) : (
              upcomingBookings.map((booking) => (
                <div key={booking.event_item_id} className="flex items-center gap-4 p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <img
                    src={booking.primary_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.service_title || 'S')}&background=E8C97A&color=fff`}
                    alt={booking.service_title}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[var(--color-dark)] truncate">{booking.service_title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar size={12} /> {formatDate(booking.event_date)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin size={12} /> {booking.vendor_name}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Badge variant={statusVariant(booking.status)}>
                      {booking.status}
                    </Badge>
                    <button className="text-gray-400 hover:text-[var(--color-gold)] transition-colors p-1" aria-label="View Details">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column - Recent Activity */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-bold mb-4 text-[var(--color-dark)]">Recent Activity</h2>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            {activities.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <Bell size={32} className="text-gray-300" />
                <p className="text-sm text-gray-400">No recent activity yet.</p>
                <Link to="/services" className="text-xs font-bold text-[var(--color-gold)] hover:underline">Browse services →</Link>
              </div>
            ) : (
              <div className="flex flex-col relative">
                {activities.map((activity, idx) => (
                  <div
                    key={activity.notification_id ?? idx}
                    className="relative pl-6 pb-4 last:pb-0 before:absolute before:left-1 before:top-1.5 before:w-2 before:h-2 before:bg-[var(--color-gold)] before:rounded-full after:absolute after:left-[7px] after:top-4 after:bottom-0 after:w-px after:bg-gray-100 last:after:hidden"
                  >
                    <p className="text-sm">
                      <span className="font-semibold text-[var(--color-dark)]">{activity.title}</span>
                    </p>
                    {activity.message_body && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{activity.message_body}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{timeAgo(activity.created_at)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default CustomerOverview;
