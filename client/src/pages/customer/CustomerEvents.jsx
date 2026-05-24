import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, DollarSign, Plus, ArrowLeft, X, ShoppingBag } from 'lucide-react';
import Badge from '../../components/ui/Badge'; // Ensure path is correct based on file location

const MOCK_EVENTS = [
  {
    id: 'e1', title: 'Sarah\'s Graduation Party', type: 'Graduation', date: '2026-07-15', location: 'Amman, Jordan', status: 'draft', guestCount: 50, estimatedCost: 850,
    services: [
      { id: 's1', name: 'The Pearl Ballroom', vendor: 'Pearl Events', price: 500, status: 'pending', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=100&q=80' },
      { id: 's2', name: 'Elite Catering', vendor: 'Elite Foods', price: 350, status: 'accepted', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=100&q=80' }
    ]
  },
  {
    id: 'e2', title: 'Corporate Annual Gala', type: 'Corporate', date: '2026-11-20', location: 'Dead Sea, Jordan', status: 'submitted', guestCount: 200, estimatedCost: 4200, services: []
  }
];

const EVENT_TYPES = ['Wedding', 'Graduation', 'Gender Reveal', 'Corporate', 'General'];

function CustomerEvents() {
  const [view, setView] = useState('list'); // 'list' or 'detail'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const renderModal = () => (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-extrabold text-[var(--color-dark)]">Create New Event Plan</h2>
          <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={20} /></button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Event Type</label>
            <select className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition-all">
              {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Event Title</label>
            <input type="text" placeholder="e.g., Sarah's Wedding" className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Date</label>
              <input type="date" className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Guests</label>
              <input type="number" placeholder="100" className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Location (City)</label>
            <input type="text" placeholder="e.g., Amman" className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition-all" />
          </div>
        </div>
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
          <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors">Cancel</button>
          <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold bg-[var(--color-gold)] text-white hover:bg-[var(--color-gold-dark)] shadow-sm transition-colors">Create Plan</button>
        </div>
      </div>
    </div>
  );

  const renderDetailView = () => (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <button onClick={() => setView('list')} className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:text-[var(--color-gold)] hover:border-[var(--color-gold)] transition-all shrink-0">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-dark)]">{selectedEvent.title}</h1>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
            <Badge variant="gold" size="sm">{selectedEvent.type}</Badge>
            <span>•</span>
            <span className="flex items-center gap-1"><Calendar size={14} /> {selectedEvent.date}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col - Services */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-[var(--color-dark)]">Added Services</h2>
          {selectedEvent.services.length === 0 ? (
            <div className="p-8 text-center bg-white border border-gray-100 rounded-2xl shadow-sm">
              <p className="text-gray-500 mb-4">No services added to this event plan yet.</p>
              <Link to="/services" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-gold)] text-white font-bold hover:bg-[var(--color-gold-dark)] transition-colors">
                <Plus size={18} /> Browse Services
              </Link>
            </div>
          ) : (
            <>
              {selectedEvent.services.map(srv => (
                <div key={srv.id} className="flex flex-col sm:flex-row gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm items-center">
                  <img src={srv.image} alt={srv.name} className="w-full sm:w-24 h-24 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    <h3 className="font-bold text-[var(--color-dark)] truncate">{srv.name}</h3>
                    <p className="text-sm text-gray-500">{srv.vendor}</p>
                  </div>
                  <div className="flex flex-col items-center sm:items-end shrink-0 gap-2">
                    <span className="font-extrabold text-[var(--color-dark)]">{srv.price} JOD</span>
                    <Badge variant={srv.status === 'accepted' ? 'success' : 'warning'} size="sm">{srv.status}</Badge>
                  </div>
                </div>
              ))}
              <Link to="/services" className="mt-2 flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-gray-300 text-gray-500 font-bold hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-colors bg-gray-50/50 hover:bg-white">
                <Plus size={18} /> Add Another Service
              </Link>
            </>
          )}
        </div>

        {/* Right Col - Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-6">
            <h2 className="text-lg font-bold text-[var(--color-dark)]">Cost Breakdown</h2>
            <div className="flex flex-col gap-3 text-sm text-gray-600">
              <div className="flex justify-between"><span>Subtotal</span><span>{selectedEvent.estimatedCost} JOD</span></div>
              <div className="flex justify-between"><span>Service Fee</span><span>Included</span></div>
              <hr className="border-gray-100" />
              <div className="flex justify-between text-lg font-extrabold text-[var(--color-dark)]">
                <span>Total Estimated</span><span>{selectedEvent.estimatedCost} JOD</span>
              </div>
            </div>
            <button className="w-full py-3.5 rounded-xl bg-[var(--color-dark)] text-white font-bold hover:bg-[#1a1a1a] shadow-md transition-all">
              Submit Event Plan
            </button>
            <p className="text-xs text-center text-gray-500 -mt-2">Submitting will send requests to all selected vendors.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderListView = () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-dark)]">My Events</h1>
          <p className="text-sm text-gray-500 mt-1">Plan and manage your upcoming events.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[var(--color-gold)] text-white font-bold hover:bg-[var(--color-gold-dark)] shadow-sm transition-all shrink-0">
          <Plus size={18} /> Create New Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {MOCK_EVENTS.map(event => (
          <div key={event.id} onClick={() => { setSelectedEvent(event); setView('detail'); }} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <Badge variant="gold" size="sm">{event.type}</Badge>
              <Badge variant={event.status === 'draft' ? 'gray' : 'info'} size="sm" className="capitalize">{event.status}</Badge>
            </div>
            <h3 className="text-lg font-bold text-[var(--color-dark)] mb-4 group-hover:text-[var(--color-gold)] transition-colors line-clamp-1">{event.title}</h3>
            
            <div className="flex flex-col gap-2 text-sm text-gray-600 mb-6 flex-1">
              <div className="flex items-center gap-2"><Calendar size={15} className="text-gray-400" /> {event.date}</div>
              <div className="flex items-center gap-2"><MapPin size={15} className="text-gray-400" /> <span className="truncate">{event.location}</span></div>
              <div className="flex items-center gap-2"><Users size={15} className="text-gray-400" /> {event.guestCount} Guests</div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
              <div className="flex items-center gap-1.5 font-extrabold text-[var(--color-dark)]"><DollarSign size={16} className="text-[var(--color-gold)]"/> {event.estimatedCost}</div>
              <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium"><ShoppingBag size={15} /> {event.services.length} items</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {view === 'list' ? renderListView() : renderDetailView()}
      {isModalOpen && renderModal()}
    </div>
  );
}

// Keep the existing export
export default CustomerEvents;
