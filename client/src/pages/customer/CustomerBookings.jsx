import React, { useState } from 'react';
import { Calendar, Clock, DollarSign, MapPin, Star, ChevronDown, ChevronUp, XCircle, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const MOCK_BOOKINGS = [
  { id: 'BK-9021', serviceName: 'Grand Royal Ballroom', vendorName: 'Royal Hotels', eventDate: '2026-10-15', bookingDate: '2026-05-20', status: 'Confirmed', estimatedCost: 1500, image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=150&q=80', location: 'Amman, 5th Circle' },
  { id: 'BK-9022', serviceName: 'Zara Photography', vendorName: 'Zara Lens', eventDate: '2026-10-15', bookingDate: '2026-05-21', status: 'Pending', estimatedCost: 350, image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=150&q=80', location: 'Amman, Jordan' },
  { id: 'BK-8055', serviceName: 'Elite Catering', vendorName: 'Elite Foods', eventDate: '2026-02-10', bookingDate: '2025-12-01', status: 'Completed', estimatedCost: 1200, image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=150&q=80', location: 'Amman, Dead Sea' },
  { id: 'BK-7011', serviceName: 'Moonrise Event Space', vendorName: 'Moonrise', eventDate: '2026-01-05', bookingDate: '2025-11-15', status: 'Cancelled', estimatedCost: 650, image: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=150&q=80', location: 'Amman, Khalda' },
];

const TABS = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];

function CustomerBookings() {
  const [activeTab, setActiveTab] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  const filteredBookings = MOCK_BOOKINGS.filter(b => activeTab === 'All' || b.status === activeTab);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'Completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-dark)]">My Bookings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your event reservations and history.</p>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 border-b border-gray-200" style={{ scrollbarWidth: 'none' }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-bold rounded-t-xl transition-colors whitespace-nowrap border-b-2 ${
              activeTab === tab 
                ? 'border-[var(--color-gold)] text-[var(--color-gold)] bg-[var(--color-gold)]/5' 
                : 'border-transparent text-gray-500 hover:text-[var(--color-dark)] hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="flex flex-col gap-4">
        {filteredBookings.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
            <Search size={48} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-[var(--color-dark)]">No bookings found</h3>
            <p className="text-gray-500 text-sm mt-1">You don't have any {activeTab !== 'All' ? activeTab.toLowerCase() : ''} bookings.</p>
          </div>
        ) : (
          filteredBookings.map(booking => {
            const isExpanded = expandedId === booking.id;
            return (
              <div key={booking.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
                
                {/* Card Header (Visible) */}
                <div className="p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                  <img src={booking.image} alt={booking.serviceName} className="w-full sm:w-28 h-24 object-cover rounded-xl shrink-0" />
                  
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-1">
                      <h3 className="text-lg font-extrabold text-[var(--color-dark)] truncate pr-4">{booking.serviceName}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 font-medium mb-3">by {booking.vendorName}</p>
                    
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5"><Calendar size={14} className="text-gray-400" /> {booking.eventDate}</div>
                      <div className="flex items-center gap-1.5"><MapPin size={14} className="text-gray-400" /> {booking.location}</div>
                      <div className="flex items-center gap-1.5 font-bold text-[var(--color-dark)]"><DollarSign size={14} className="text-[var(--color-gold)]" /> {booking.estimatedCost} JOD</div>
                    </div>
                  </div>
                </div>

                {/* Card Footer (Actions & Expander) */}
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {booking.status === 'Pending' && (
                      <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
                        <XCircle size={16} /> Cancel
                      </button>
                    )}
                    {booking.status === 'Completed' && (
                      <Link to={`/services/${booking.id}#reviews`} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-[var(--color-dark)] hover:bg-[#1a1a1a] shadow-sm transition-colors">
                        <Star size={16} /> Write a Review
                      </Link>
                    )}
                  </div>
                  <button 
                    onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                    className="flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-[var(--color-gold)] transition-colors ml-auto"
                  >
                    {isExpanded ? 'Hide Details' : 'View Details'}
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {/* Expanded Details Area */}
                {isExpanded && (
                  <div className="p-5 border-t border-gray-100 bg-white grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm animate-in fade-in slide-in-from-top-2">
                    <div>
                      <p className="text-gray-500 mb-1">Booking ID</p>
                      <p className="font-bold text-[var(--color-dark)]">{booking.id}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Booking Placed On</p>
                      <p className="font-bold text-[var(--color-dark)]">{booking.bookingDate}</p>
                    </div>
                    <div className="sm:col-span-2 pt-3 mt-1 border-t border-gray-100">
                      <Link to={`/services/${booking.id}`} className="text-[var(--color-gold)] font-bold hover:underline">View Service Page &rarr;</Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default CustomerBookings;
