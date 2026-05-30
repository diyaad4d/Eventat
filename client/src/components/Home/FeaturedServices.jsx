import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import ServiceCard from './ServiceCard';

// ─────────────────────────────────────────────────────────────
//  Mock data — 8 top-rated services, sorted by rating desc.
//  Shape mirrors what the real API will return (Step 3.3).
// ─────────────────────────────────────────────────────────────
export const MOCK_FEATURED_SERVICES = [
  {
    id: 'svc-001',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=640&q=80',
    category: 'Venue',
    categorySlug: 'venue',
    title: 'The Grand Ballroom at Four Seasons',
    vendorName: 'Four Seasons Events',
    location: 'Amman, Jordan',
    rating: 4.9,
    reviewCount: 214,
    basePrice: 2800,
    pricingUnit: 'per_event',
  },
  {
    id: 'svc-002',
    image: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=640&q=80',
    category: 'Photography',
    categorySlug: 'photography',
    title: 'Luminary Wedding & Portrait Studio',
    vendorName: 'Luminary Creative',
    location: 'Amman, Jordan',
    rating: 4.9,
    reviewCount: 178,
    basePrice: 650,
    pricingUnit: 'per_event',
  },
  {
    id: 'svc-003',
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=640&q=80',
    category: 'Catering',
    categorySlug: 'catering',
    title: 'Royal Feast Premium Catering',
    vendorName: 'Royal Feast Co.',
    location: 'Amman, Jordan',
    rating: 4.8,
    reviewCount: 309,
    basePrice: 45,
    pricingUnit: 'per_person',
  },
  {
    id: 'svc-004',
    image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=640&q=80',
    category: 'Entertainment',
    categorySlug: 'entertainment',
    title: 'Orion Live Band & DJ Experience',
    vendorName: 'Orion Entertainment',
    location: 'Irbid, Jordan',
    rating: 4.8,
    reviewCount: 132,
    basePrice: 900,
    pricingUnit: 'per_event',
  },
  {
    id: 'svc-005',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=640&q=80',
    category: 'Decoration',
    categorySlug: 'decoration',
    title: 'Bloom & Bloom Floral Decoration',
    vendorName: 'Bloom & Bloom Studio',
    location: 'Amman, Jordan',
    rating: 4.7,
    reviewCount: 98,
    basePrice: 380,
    pricingUnit: 'per_event',
  },
  {
    id: 'svc-006',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=640&q=80',
    category: 'Accommodation',
    categorySlug: 'accommodation',
    title: 'Prestige Suites — Wedding Block',
    vendorName: 'Prestige Hotels',
    location: 'Dead Sea, Jordan',
    rating: 4.7,
    reviewCount: 87,
    basePrice: 180,
    pricingUnit: 'per_day',
  },
  {
    id: 'svc-007',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=640&q=80',
    category: 'Transport',
    categorySlug: 'transport',
    title: 'Elite Luxury Car Fleet & Chauffeur',
    vendorName: 'Elite Rides JO',
    location: 'Aqaba, Jordan',
    rating: 4.6,
    reviewCount: 64,
    basePrice: 220,
    pricingUnit: 'per_event',
  },
  {
    id: 'svc-008',
    image: 'https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=640&q=80',
    category: 'Fireworks',
    categorySlug: 'fireworks',
    title: 'Skyfire Professional Pyrotechnics',
    vendorName: 'Skyfire Shows',
    location: 'Zarqa, Jordan',
    rating: 4.6,
    reviewCount: 51,
    basePrice: 750,
    pricingUnit: 'per_event',
  },
];

// ─────────────────────────────────────────────────────────────
//  FeaturedServices
//  Heading: "Top Rated Services"
//  "View All" → /services
//  Horizontal scroll strip with arrow buttons (desktop)
//  Native swipe on mobile
//  Scrollbar hidden via CSS utility .scrollbar-hide
// ─────────────────────────────────────────────────────────────
function FeaturedServices() {
  const scrollRef = useRef(null);
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(true);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate API fetch with 900ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setServices(MOCK_FEATURED_SERVICES);
      setIsLoading(false);
    }, 900);
    return () => clearTimeout(timer);
  }, []);

  // Track scroll position to show/hide arrow buttons
  const syncArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', syncArrows, { passive: true });
    // Initial check after content renders
    setTimeout(syncArrows, 100);
    return () => el.removeEventListener('scroll', syncArrows);
  }, [services]);

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = direction === 'left' ? -320 : 320;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  };

  // Skeleton loader — 4 ghost cards
  if (isLoading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white" aria-label="Loading featured services">
        <div className="max-w-7xl mx-auto">
          {/* Heading skeleton */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="h-3 w-24 bg-gray-200 rounded-full animate-pulse mb-3" />
              <div className="h-8 w-56 bg-gray-200 rounded-xl animate-pulse" />
            </div>
            <div className="h-9 w-24 bg-gray-100 rounded-xl animate-pulse" />
          </div>
          {/* Card skeletons */}
          <div className="flex gap-5 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[80vw] sm:w-80 rounded-2xl bg-gray-100 animate-pulse"
                style={{ height: '360px' }}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="py-16 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden"
      aria-label="Top Rated Services"
    >
      {/* Subtle background decoration */}
      <div
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-[0.04] bg-[var(--color-gold)] pointer-events-none blur-3xl"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto">

        {/* ── Section header ──────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--color-gold-dark)]">
              Handpicked for You
            </span>
            <h2 className="mt-1.5 text-2xl sm:text-3xl font-extrabold text-[var(--color-dark)] leading-tight">
              Top Rated{' '}
              <span className="text-gradient-gold">Services</span>
            </h2>
            {/* <p className="mt-1 text-sm text-gray-500">
              Sorted by customer ratings — only the best make this list.
            </p> */}
          </div>

          {/* View All CTA */}
          <Link
            to="/services"
            className={[
              'group inline-flex items-center gap-2 shrink-0',
              'px-5 py-2.5 rounded-xl text-sm font-semibold',
              'border-2 border-[var(--color-gold)] text-[var(--color-gold)]',
              'hover:bg-[var(--color-gold)] hover:text-white',
              'transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] focus-visible:ring-offset-2',
            ].join(' ')}
            aria-label="View all services"
          >
            View All
            <ArrowRight
              size={16}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>

        {/* ── Scroll strip wrapper ─────────────────────────── */}
        <div className="relative">

          {/* Left arrow */}
          <button
            onClick={() => scroll('left')}
            disabled={!canLeft}
            aria-label="Scroll left"
            className={[
              'absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10',
              'w-10 h-10 rounded-full bg-white shadow-lg border border-gray-100',
              'flex items-center justify-center text-[var(--color-dark)]',
              'hover:bg-[var(--color-gold)] hover:text-white hover:border-[var(--color-gold)]',
              'transition-all duration-200',
              'disabled:opacity-0 disabled:pointer-events-none',
              'hidden sm:flex',
            ].join(' ')}
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>

          {/* Right arrow */}
          <button
            onClick={() => scroll('right')}
            disabled={!canRight}
            aria-label="Scroll right"
            className={[
              'absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10',
              'w-10 h-10 rounded-full bg-white shadow-lg border border-gray-100',
              'flex items-center justify-center text-[var(--color-dark)]',
              'hover:bg-[var(--color-gold)] hover:text-white hover:border-[var(--color-gold)]',
              'transition-all duration-200',
              'disabled:opacity-0 disabled:pointer-events-none',
              'hidden sm:flex',
            ].join(' ')}
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>

          {/* Horizontal scroll track */}
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1 snap-x snap-mandatory"
            style={{
              /* Ensure native-smooth scroll on iOS */
              WebkitOverflowScrolling: 'touch',
            }}
            role="list"
            aria-label="Featured services"
          >
            {services.map((service) => (
              <div key={service.id} role="listitem" className="snap-start flex-shrink-0 w-[80vw] sm:w-80">
                <ServiceCard service={service} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Scroll hint dots — mobile only ──────────────── */}
        <div
          className="flex justify-center gap-1.5 mt-4 sm:hidden"
          aria-hidden="true"
        >
          {services.map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-gray-200"
            />
          ))}
        </div>

      </div>
    </section>
  );
}

export default FeaturedServices;
