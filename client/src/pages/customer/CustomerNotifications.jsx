import React, { useState } from 'react';
import { Bell, CheckCircle2, Calendar, ShoppingBag, Info, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'booking', message: 'Your booking for Grand Royal Ballroom has been confirmed!', timestamp: '2 mins ago', read: false, link: '/customer/bookings' },
  { id: 2, type: 'review', message: 'How was your experience at Elite Catering? Leave a review!', timestamp: '2 hours ago', read: false, link: '/customer/bookings' },
  { id: 3, type: 'info', message: 'Your event plan "Graduation Party" is approaching in 3 days.', timestamp: '1 day ago', read: true, link: '/customer/events' },
  { id: 4, type: 'booking', message: 'The vendor Zara Lens has rejected your booking request.', timestamp: '2 days ago', read: true, link: '/customer/bookings' },
];

function CustomerNotifications() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const navigate = useNavigate();

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type) => {
    switch(type) {
      case 'booking': return <ShoppingBag size={20} className="text-blue-500" />;
      case 'review': return <CheckCircle2 size={20} className="text-[var(--color-gold)]" />;
      default: return <Info size={20} className="text-gray-400" />;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto pb-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-dark)]">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">Stay updated with your events and bookings.</p>
        </div>
        <button onClick={markAllAsRead} className="text-sm font-bold text-[var(--color-gold)] hover:text-[var(--color-gold-dark)] transition-colors">
          Mark all as read
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No new notifications.</div>
        ) : (
          notifications.map((n) => (
            <div 
              key={n.id} 
              onClick={() => navigate(n.link)}
              className={`flex gap-4 p-5 border-b border-gray-50 last:border-0 cursor-pointer transition-colors ${n.read ? 'bg-white' : 'bg-blue-50/30 hover:bg-blue-50/50'}`}
            >
              <div className="shrink-0 mt-1">{getIcon(n.type)}</div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${n.read ? 'text-gray-600' : 'text-[var(--color-dark)] font-bold'}`}>
                  {n.message}
                </p>
                <p className="text-xs text-gray-400 mt-1.5">{n.timestamp}</p>
              </div>
              {!n.read && <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-gold)] shrink-0 mt-1.5" />}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CustomerNotifications;
