import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Calendar, ShoppingBag, ArrowRight, Store, ArrowLeft } from 'lucide-react';

const MOCK_CART_ITEMS = [
  {
    id: 'c1',
    serviceId: 's1',
    serviceName: 'Grand Royal Ballroom',
    vendorName: 'Royal Hotels & Resorts',
    eventDate: '2026-10-15',
    price: 150,
    quantity: 5, // e.g., 5 hours
    pricingUnit: 'per_hour',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=150&q=80'
  },
  {
    id: 'c2',
    serviceId: 's2',
    serviceName: 'Elite Catering (Gold Package)',
    vendorName: 'Elite Foods',
    eventDate: '2026-10-15',
    price: 25,
    quantity: 100, // 100 persons
    pricingUnit: 'per_person',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=150&q=80'
  }
];

function CustomerCart() {
  const [cartItems, setCartItems] = useState(MOCK_CART_ITEMS);

  const handleRemove = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const getUnitLabel = (unit) => {
    switch(unit) {
      case 'per_hour': return 'hrs';
      case 'per_person': return 'guests';
      case 'per_day': return 'days';
      case 'per_item': return 'items';
      default: return 'units';
    }
  };

  // ── Empty State ──
  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center max-w-lg mx-auto">
        <div className="w-24 h-24 bg-[var(--color-gold)]/10 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={48} className="text-[var(--color-gold)]" />
        </div>
        <h1 className="text-3xl font-extrabold text-[var(--color-dark)] mb-3">Your cart is empty</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">Looks like you haven't added any services to your event plan yet. Let's find the perfect services for your upcoming celebration.</p>
        <Link to="/services" className="flex items-center gap-2 px-8 py-3.5 bg-[var(--color-gold)] text-white font-bold rounded-xl hover:bg-[var(--color-gold-dark)] shadow-[0_4px_14px_rgba(201,162,77,0.3)] transition-all">
          Browse Services <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  // ── Filled Cart State ──
  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-dark)]">Your Cart</h1>
        <p className="text-sm text-gray-500 mt-1">Review your selected services before checkout.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Cart Items */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row gap-5 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative">
              
              <Link to={`/services/${item.serviceId}`} className="shrink-0 block">
                <img src={item.image} alt={item.serviceName} className="w-full sm:w-32 h-28 object-cover rounded-xl border border-gray-100" />
              </Link>
              
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <Link to={`/services/${item.serviceId}`} className="text-lg font-bold text-[var(--color-dark)] hover:text-[var(--color-gold)] transition-colors truncate block">
                      {item.serviceName}
                    </Link>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mt-1">
                      <Store size={14} /> {item.vendorName}
                    </div>
                  </div>
                  
                  {/* Remove Button */}
                  <button 
                    onClick={() => handleRemove(item.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                    aria-label="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="flex flex-wrap items-end justify-between gap-4 mt-4">
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <Calendar size={14} className="text-[var(--color-gold)]" />
                    <span className="text-sm font-semibold text-gray-700">{item.eventDate}</span>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xs text-gray-400 mb-0.5">
                      {item.price} JOD × {item.quantity} {getUnitLabel(item.pricingUnit)}
                    </div>
                    <div className="text-lg font-extrabold text-[var(--color-dark)] leading-none">
                      {(item.price * item.quantity).toLocaleString()} JOD
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <div className="mt-4">
            <Link to="/services" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[var(--color-gold)] transition-colors">
              <ArrowLeft size={16} /> Continue Shopping
            </Link>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 bg-white p-6 sm:p-8 rounded-2xl border border-[var(--color-gold)]/30 shadow-[0_8px_30px_rgba(201,162,77,0.08)] flex flex-col gap-6">
            <h2 className="text-xl font-extrabold text-[var(--color-dark)]">Order Summary</h2>
            
            <div className="flex flex-col gap-4 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal ({cartItems.length} items)</span>
                <span className="font-semibold text-[var(--color-dark)]">{subtotal.toLocaleString()} JOD</span>
              </div>
              <div className="flex justify-between">
                <span>Service Fee</span>
                <span className="text-green-600 font-semibold">Free</span>
              </div>
            </div>
            
            <hr className="border-gray-100" />
            
            <div className="flex justify-between items-end">
              <span className="text-base font-bold text-[var(--color-dark)]">Total</span>
              <span className="text-2xl font-black text-[var(--color-dark)] leading-none">{subtotal.toLocaleString()} JOD</span>
            </div>

            <button className="w-full py-4 bg-[var(--color-dark)] hover:bg-[#1a1a1a] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2">
              Proceed to Checkout <ArrowRight size={18} />
            </button>

            <p className="text-xs text-center text-gray-400 -mt-2">
              You won't be charged yet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerCart;
