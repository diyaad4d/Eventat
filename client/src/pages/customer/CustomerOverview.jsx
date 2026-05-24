import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ClipboardList, Clock, Plus, Search, MapPin, CheckCircle2, MoreHorizontal } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';

const MOCK_STATS = {
  activeEvents: 2,
  totalBookings: 14,
  upcomingEvents: 1
};

const MOCK_UPCOMING_BOOKINGS = [
  { id: 'b1', serviceName: 'Grand Royal Ballroom', date: 'Oct 15, 2026', status: 'Confirmed', vendor: 'Royal Hotels', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=150&q=80' },
  { id: 'b2', serviceName: 'Zara Photography', date: 'Oct 15, 2026', status: 'Pending', vendor: 'Zara Lens', image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=150&q=80' },
  { id: 'b3', serviceName: 'Elite Catering', date: 'Nov 02, 2026', status: 'Confirmed', vendor: 'Elite Foods', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=150&q=80' }
];

const MOCK_ACTIVITIES = [
  { id: 1, action: 'Booked', target: 'The Pearl Ballroom', time: '2 hours ago' },
  { id: 2, action: 'Left a 5-star review for', target: 'Moonrise Event Space', time: '1 day ago' },
  { id: 3, action: 'Saved', target: 'Crystal Palace Venue', time: '3 days ago' },
  { id: 4, action: 'Created new event plan', target: 'Graduation Party', time: '1 week ago' },
];

function CustomerOverview() {
  const { user } = useAuthStore();

  return (
    <div className="w-full">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Avatar src={user?.avatar} alt={user?.full_name || user?.username} size="lg" />
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
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--color-gold)]/10 text-[var(--color-gold)] shrink-0">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Active Events</p>
            <p className="text-2xl font-bold text-[var(--color-dark)]">{MOCK_STATS.activeEvents}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--color-gold)]/10 text-[var(--color-gold)] shrink-0">
            <ClipboardList size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Bookings</p>
            <p className="text-2xl font-bold text-[var(--color-dark)]">{MOCK_STATS.totalBookings}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--color-gold)]/10 text-[var(--color-gold)] shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Upcoming Events</p>
            <p className="text-2xl font-bold text-[var(--color-dark)]">{MOCK_STATS.upcomingEvents}</p>
          </div>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Upcoming Bookings */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-bold mb-4 text-[var(--color-dark)]">Upcoming Bookings</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {MOCK_UPCOMING_BOOKINGS.map((booking) => (
              <div key={booking.id} className="flex items-center gap-4 p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                <img src={booking.image} alt={booking.serviceName} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[var(--color-dark)] truncate">{booking.serviceName}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar size={12} /> {booking.date}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin size={12} /> {booking.vendor}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <Badge variant={booking.status === 'Confirmed' ? 'success' : 'warning'}>
                    {booking.status}
                  </Badge>
                  <button className="text-gray-400 hover:text-[var(--color-gold)] transition-colors p-1" aria-label="View Details">
                    <MoreHorizontal size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Recent Activity */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-bold mb-4 text-[var(--color-dark)]">Recent Activity</h2>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex flex-col relative">
              {MOCK_ACTIVITIES.map((activity) => (
                <div key={activity.id} className="relative pl-6 pb-4 last:pb-0 before:absolute before:left-1 before:top-1.5 before:w-2 before:h-2 before:bg-[var(--color-gold)] before:rounded-full after:absolute after:left-[7px] after:top-4 after:bottom-0 after:w-px after:bg-gray-100 last:after:hidden">
                  <p className="text-sm">
                    <span className="text-gray-500">{activity.action}</span>{' '}
                    <span className="font-semibold text-[var(--color-dark)]">{activity.target}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}

export default CustomerOverview;
