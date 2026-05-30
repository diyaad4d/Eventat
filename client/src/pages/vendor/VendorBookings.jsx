import React, { useState } from 'react';
import { 
  Calendar, Users, DollarSign, MessageSquare, 
  CheckCircle2,  Clock, ChevronDown, ChevronUp, Search, RefreshCw, XCircle,
} from 'lucide-react';
import EmptyState from '../../components/shared/EmptyState';
import PageTransition from '../../components/shared/PageTransition';

const MOCK_BOOKINGS = [
  {
    id: 'BR-1001',
    customerName: 'Ahmad Client',
    avatar: 'https://i.pravatar.cc/150?img=11',
    category: 'Venue',
    subcategory: 'Halls',
    eventDate: '2026-10-15',
    serviceRequested: 'Grand Royal Ballroom',
    guestCount: 300,
    specialRequests: 'We need a special entrance setup with floral arches and early access for the band.',
    estimatedCost: 1500,
    status: 'Incoming',
    timeline: [
      { status: 'Requested', date: '2026-05-20 10:30 AM', note: 'Customer submitted the booking request.' }
    ]
  },
  {
    id: 'BR-1002',
    customerName: 'Sarah M.',
    avatar: 'https://i.pravatar.cc/150?img=5',
    category: 'Decoration',
    subcategory: 'Outdoor',
    eventDate: '2026-07-20',
    serviceRequested: 'Outdoor Garden Setup',
    guestCount: 150,
    specialRequests: 'None',
    estimatedCost: 450,
    status: 'Incoming',
    timeline: [
      { status: 'Requested', date: '2026-05-22 02:15 PM', note: 'Customer submitted the booking request.' }
    ]
  },
  {
    id: 'BR-0950',
    customerName: 'Lina K.',
    avatar: 'https://i.pravatar.cc/150?img=32',
    category: 'Catering',
    subcategory: 'Buffet',
    eventDate: '2026-09-05',
    serviceRequested: 'Elite Catering (Buffet)',
    guestCount: 100,
    specialRequests: 'Please include vegetarian and gluten-free options.',
    estimatedCost: 850,
    status: 'Confirmed',
    timeline: [
      { status: 'Confirmed', date: '2026-05-18 09:00 AM', note: 'You accepted this booking request.' },
      { status: 'Requested', date: '2026-05-17 04:20 PM', note: 'Customer submitted the booking request.' }
    ]
  }
];

const TABS = ['Incoming', 'Confirmed', 'Completed', 'Cancelled'];

function VendorBookings() {
  const [activeTab, setActiveTab] = useState('Incoming');
  const [bookings, setBookings] = useState(MOCK_BOOKINGS);
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBookings = bookings
    .filter(b => b.status === activeTab)
    .filter(b => 
      searchTerm === '' ||
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.serviceRequested.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleAction = (id, newStatus) => {
    setBookings(prev => prev.map(booking => {
      if (booking.id === id) {
        const newTimeline = [
          { 
            status: newStatus, 
            date: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }), 
            note: `You ${newStatus.toLowerCase()} this booking request.` 
          },
          ...booking.timeline
        ];
        return { ...booking, status: newStatus, timeline: newTimeline };
      }
      return booking;
    }));
  };

  return (
    <PageTransition className="w-full max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-dark)]">Booking Requests</h1>
        <p className="text-sm text-gray-500 mt-1">Review and manage your incoming and past client bookings.</p>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 border-b border-gray-200 mb-6" style={{ scrollbarWidth: 'none' }}>
        {TABS.map(tab => {
          const count = bookings.filter(b => b.status === tab).length;
          return (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setExpandedId(null); }}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-t-xl transition-colors whitespace-nowrap border-b-2 ${
                activeTab === tab 
                  ? 'border-[var(--color-gold)] text-[var(--color-gold)] bg-[var(--color-gold)]/5' 
                  : 'border-transparent text-gray-500 hover:text-[var(--color-dark)] hover:bg-gray-50'
              }`}
            >
              {tab}
              <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab ? 'bg-[var(--color-gold)]/20 text-[var(--color-gold-dark)]' : 'bg-gray-100 text-gray-500'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Bookings List */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 
          -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by client, service, or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 
          rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-gold)] 
          text-sm transition-all"
        />
      </div>
      <div className="flex flex-col gap-5">
        {filteredBookings.length === 0 ? (
          <EmptyState 
            variant="no-bookings" 
            title={`No ${activeTab.toLowerCase()} requests`}
            subtitle="You don't have any bookings in this status."
            actionLabel={null}
          />
        ) : (
          filteredBookings.map(booking => {
            const isExpanded = expandedId === booking.id;
            const daysUntil = Math.ceil(
              (new Date(booking.eventDate) - new Date()) / 86400000
            );
            const urgencyClass = daysUntil <= 14
              ? 'bg-red-50 text-red-700 border-red-200'
              : daysUntil <= 60
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-gray-100 text-gray-600 border-gray-200';

            return (
              <div key={booking.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
                
                {/* Main Card Body */}
                <div className="p-5 md:p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    
                    {/* Left: Customer Info */}
                    <div className="flex items-start gap-4 md:w-1/3 shrink-0">
                      <img src={booking.avatar} alt={booking.customerName} className="w-14 h-14 rounded-full object-cover border-2 border-gray-50 shadow-sm" />
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-extrabold text-[var(--color-dark)] text-lg leading-tight">{booking.customerName}</h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${urgencyClass}`}>
                            Event in {daysUntil}d
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">Request ID: {booking.id}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-block px-2.5 py-1 bg-[var(--color-gold)]/10 text-[var(--color-gold-dark)] text-xs font-bold uppercase tracking-wider rounded-md">
                            {booking.category}
                          </span>
                          {booking.subcategory && (
                            <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider rounded-md">
                              {booking.subcategory}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Booking Details */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Service Requested</p>
                        <p className="font-bold text-[var(--color-dark)]">{booking.serviceRequested}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Estimated Cost</p>
                        <p className="font-extrabold text-[var(--color-gold-dark)] flex items-center gap-1"><DollarSign size={16}/> {booking.estimatedCost} JOD</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Event Date</p>
                        <p className="font-medium text-gray-700 flex items-center gap-1.5"><Calendar size={16} className="text-gray-400"/> {booking.eventDate}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Guest Count</p>
                        <p className="font-medium text-gray-700 flex items-center gap-1.5"><Users size={16} className="text-gray-400"/> {booking.guestCount} Guests</p>
                      </div>
                      
                      {/* Special Requests */}
                      <div className="sm:col-span-2 mt-2 bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5"><MessageSquare size={14}/> Special Requests / Notes</p>
                        <p className="text-sm text-gray-700 italic">{booking.specialRequests}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer (Actions & Expander) */}
                <div className="px-5 py-3 md:px-6 bg-gray-50/80 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {booking.status === 'Incoming' ? (
                      <>
                        <button onClick={() => handleAction(booking.id, 'Confirmed')} className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl min-h-[44px] text-sm font-bold text-white bg-green-600 hover:bg-green-700 shadow-sm transition-colors">
                          <CheckCircle2 size={16} /> Accept
                        </button>
                        <button onClick={() => handleAction(booking.id, 'Cancelled')} className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl min-h-[44px] text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
                          <XCircle size={16} /> Reject
                        </button>
                      </>
                    ) : (
                      <>
                        <span className={`px-4 py-1.5 rounded-lg text-sm font-bold border ${
                          booking.status === 'Confirmed' ? 'bg-green-50 text-green-700 border-green-200' : 
                          booking.status === 'Completed' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                          'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          Status: {booking.status}
                        </span>
                        {booking.status === 'Confirmed' && (
                          <button
                            onClick={() => handleAction(booking.id, 'Completed')}
                            className="flex items-center gap-1.5 px-4 py-1.5 min-h-[44px] sm:min-h-0 rounded-lg text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200"
                          >
                            <CheckCircle2 size={15}/> Mark Complete
                          </button>
                        )}
                      </>
                    )}
                  </div>
                  <button 
                    onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                    className="flex items-center gap-1 text-sm font-bold min-h-[44px] text-gray-500 hover:text-[var(--color-gold)] transition-colors ml-auto"
                  >
                    {isExpanded ? 'Hide Timeline' : 'View Timeline'}
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {/* Expanded Timeline Area */}
                {isExpanded && (
                  <div className="p-5 md:p-6 border-t border-gray-100 bg-white animate-in fade-in slide-in-from-top-2">
                    <h4 className="text-sm font-bold text-[var(--color-dark)] mb-4 flex items-center gap-2"><Clock size={16} className="text-[var(--color-gold)]"/> Status History</h4>
                    <div className="relative pl-4 border-l-2 border-gray-100 flex flex-col gap-4 ml-2">
                      {booking.timeline.map((event, index) => (
                        <div key={index} className="relative">
                          <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white ${index === 0 ? 'bg-[var(--color-gold)]' : 'bg-gray-300'}`} />
                          <p className={`text-sm font-bold ${index === 0 ? 'text-[var(--color-dark)]' : 'text-gray-600'}`}>{event.status}</p>
                          <p className="text-xs text-gray-400 mt-0.5 mb-1">{event.date}</p>
                          <p className="text-sm text-gray-500">{event.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </PageTransition>
  );
}

export default VendorBookings;
