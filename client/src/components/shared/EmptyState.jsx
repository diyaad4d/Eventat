import React, { useState, useEffect } from 'react';
import { ShoppingCart, Calendar, Briefcase, SearchX, Bell, Users } from 'lucide-react';

const VARIANTS = {
  'empty-cart': {
    icon: ShoppingCart,
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-300',
    title: 'Your cart is empty',
    subtitle: "You haven't added any services yet. Browse our vendors to get started.",
    actionLabel: 'Browse Services',
  },
  'no-bookings': {
    icon: Calendar,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-300', // Note: prompt says text-gray-300 but using a slight tint can be nice. Sticking to text-gray-300 as requested.
    title: 'No bookings yet',
    subtitle: "You haven't made any bookings. Find a service and plan your next event.",
    actionLabel: 'Browse Services',
  },
  'no-services': {
    icon: Briefcase,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-300',
    title: 'No services listed',
    subtitle: 'Start growing your business by adding your first service listing.',
    actionLabel: 'Add Your First Service',
  },
  'no-results': {
    icon: SearchX,
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-300',
    title: 'No results found',
    subtitle: 'No services match your current filters. Try adjusting your search.',
    actionLabel: 'Clear Filters',
  },
  'no-notifications': {
    icon: Bell,
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-300',
    title: "You're all caught up!",
    subtitle: "No new notifications. We'll let you know when something happens.",
  },
  'no-vendors': {
    icon: Users,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-300',
    title: 'No vendors found',
    subtitle: 'No vendors match your search criteria. Try different keywords.',
    actionLabel: 'Clear Search',
  },
};

function EmptyState({ variant, title, subtitle, actionLabel, onAction }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 20);
    return () => clearTimeout(t);
  }, []);

  const config = VARIANTS[variant] || VARIANTS['no-results'];
  const Icon = config.icon;
  
  const displayTitle = title || config.title;
  const displaySubtitle = subtitle || config.subtitle;
  const displayActionLabel = actionLabel || config.actionLabel;

  return (
    <div
      className="flex flex-col items-center justify-center text-center py-16 px-6"
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 400ms ease-out, transform 400ms ease-out',
      }}
    >
      <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-5 ${config.iconBg}`}>
        <Icon size={36} className="text-gray-300" aria-hidden="true" />
      </div>
      
      <h3 className="text-xl font-extrabold text-[var(--color-dark)] mb-2">
        {displayTitle}
      </h3>
      
      <p className="text-sm text-gray-500 max-w-xs leading-relaxed mb-7">
        {displaySubtitle}
      </p>
      
      {displayActionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-[var(--color-gold)] hover:bg-[var(--color-gold-dark)] shadow-[0_4px_14px_rgba(201,162,77,0.28)] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          {displayActionLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
