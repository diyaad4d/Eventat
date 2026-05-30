import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Calendar, ChevronDown, ArrowRight } from 'lucide-react';

import Button from '../../components/ui/Button';
import useAuthStore from '../../store/authStore';
import useCategoriesStore from '../../store/categoriesStore';
import FeaturedServices from '../../components/Home/FeaturedServices';
import HowItWorks from '../../components/shared/HowItWorks';
import EventTypeShowcase from '../../components/Home/EventTypeShowcase';
import PageTransition from '../../components/shared/PageTransition';
import Testimonials from '../../components/Home/Testimonials';

import heroBg from '../../assets/Hero.jpg';

// ─────────────────────────────────────────────────────────────
//  Event type options for the search dropdown
// ─────────────────────────────────────────────────────────────
const EVENT_TYPES = [
  { value: '', label: 'All Events' },
  { value: 'wedding', label: '💍 Wedding' },
  { value: 'graduation', label: '🎓 Graduation' },
  { value: 'milestone-birthdays', label: '🎂 Milestone Birthdays' },
  { value: 'corporate', label: '💼 Corporate' },
  { value: 'general', label: '🎉 General' },
];

// ─────────────────────────────────────────────────────────────
//  Home category styles (images and grid layout mapping)
//  gridCol / gridRow control the asymmetric desktop layout:
//    Venue (col-span-2 row-span-2) + Catering (col-span-2) are featured
// ─────────────────────────────────────────────────────────────
const HOME_CATEGORY_STYLES = {
  'venue': {
    img: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80',
    gridCol: 'lg:col-span-2', gridRow: 'lg:row-span-2',
  },
  'catering': {
    img: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80',
    gridCol: 'lg:col-span-2', gridRow: 'lg:row-span-1',
  },
  'photography-videography': {
    img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80',
    gridCol: 'lg:col-span-1', gridRow: 'lg:row-span-1',
  },
  'music-entertainment': {
    img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
    gridCol: 'lg:col-span-1', gridRow: 'lg:row-span-1',
  },
  'decoration': {
    img: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80',
    gridCol: 'lg:col-span-1', gridRow: 'lg:row-span-1',
  },
  'cakes-desserts': {
    img: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80',
    gridCol: 'lg:col-span-1', gridRow: 'lg:row-span-1',
  },
  'makeup-beauty': {
    img: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&q=80',
    gridCol: 'lg:col-span-1', gridRow: 'lg:row-span-1',
  },
  'event-planning': {
    img: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800&q=80',
    gridCol: 'lg:col-span-1', gridRow: 'lg:row-span-1',
  },
  'transportation': {
    img: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80',
    gridCol: 'lg:col-span-1', gridRow: 'lg:row-span-1',
  },
  'invitations-prints': {
    img: 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=800&q=80',
    gridCol: 'lg:col-span-1', gridRow: 'lg:row-span-1',
  },
};

// ─────────────────────────────────────────────────────────────
//  Home — Step 2.1 + 2.2
//  Sections:
//    1. Hero + Smart Search Bar
//    2. Dynamic Category Grid with skeleton loader
// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
//  CategoryGrid sub-component
// ─────────────────────────────────────────────────────────────
function CategoryCard({ name, slug, icon, servicesCount }) {
  const style = HOME_CATEGORY_STYLES[slug] || {
    img: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80',
    gridCol: 'lg:col-span-1',
    gridRow: 'lg:row-span-1',
  };

  return (
    <Link
      to={`/services?categories=${slug}`}
      className={[
        'group relative rounded-2xl overflow-hidden block min-h-[200px]',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-gold)]/50',
        style.gridCol, style.gridRow,
      ].join(' ')}
      aria-label={`Browse ${name} services`}
    >
      <img
        src={style.img}
        alt={name}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent group-hover:from-black/80 transition-all duration-300"
        aria-hidden="true"
      />
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className="text-white text-lg sm:text-xl font-bold tracking-wide leading-tight flex items-center gap-2">
          {icon && <span className="text-xl">{icon}</span>}
          <span>{name}</span>
        </h3>
        <div className="flex items-center gap-1.5 mt-1.5 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <span className="text-xs font-semibold text-[var(--color-gold-light)]">
            Explore {servicesCount > 0 ? `(${servicesCount})` : ''}
          </span>
          <ArrowRight size={13} className="text-[var(--color-gold-light)] group-hover:translate-x-1 transition-transform duration-200" />
        </div>
      </div>
      <div
        className="absolute top-4 left-4 w-2 h-2 rounded-full bg-[var(--color-gold)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        aria-hidden="true"
      />
    </Link>
  );
}

function CategoryGrid() {
  // ⚠️  IMPORTANT: Do NOT call .filter() inside the Zustand selector.
  // Zustand v5 uses React's useSyncExternalStore internally. If the selector
  // returns a new array reference on every call (as .filter() does), React
  // can never cache the snapshot → infinite re-render loop.
  // Fix: read the stable `categories` reference, then filter in the component body.
  const categories = useCategoriesStore(state => state.categories);
  const activeCategories = Array.isArray(categories)
    ? categories.filter(c => c.isActive)
    : [];

  return (
    <section
      className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface-warm)]"
      aria-label="Event categories"
    >
      <div className="max-w-6xl mx-auto">

        {/* Heading */}
        <div className="text-center mb-12">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--color-gold-dark)]">
            Explore by Category
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-[var(--color-dark)] leading-tight">
            What are you{' '}
            <span className="text-gradient-gold">planning?</span>
          </h2>
        </div>

        {/* ── Live grid ──────────────────────────────────── */}
        <div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px]"
        >
            {activeCategories?.map((category) => (
              <CategoryCard
                key={category.id || category.slug}
                name={category.name}
                slug={category.slug}
                icon={category.icon}
                servicesCount={category.servicesCount}
              />
            ))}
          </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
function Home() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [eventType, setEventType] = useState('');
  const [keyword, setKeyword] = useState('');
  const [date, setDate] = useState('');

  // First name for personalized greeting
  const firstName = user?.full_name?.split(' ')[0] ?? user?.username ?? null;

  // ── Search submit ────────────────────────────────────────
  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (eventType) params.set('type', eventType);
    if (keyword) params.set('q', keyword.trim());
    if (date) params.set('date', date);
    navigate(`/services${params.toString() ? `?${params}` : ''}`);
  };

  return (
    <PageTransition className="min-h-screen bg-[var(--color-surface)]">

      {/* ══════════════════════════════════════════════════════
          SECTION 1 — HERO + SMART SEARCH BAR
      ══════════════════════════════════════════════════════ */}
      <section
        className="relative min-h-[60vh] lg:min-h-[70vh] flex flex-col items-center justify-center overflow-hidden"
        aria-label="Hero search"
      >
        {/* Background image */}
        <img
          src={heroBg}
          alt="Elegant event venue"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Dark overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(20,20,20,0.50) 0%, rgba(20,20,20,0.70) 60%, rgba(20,20,20,0.88) 100%)',
          }}
          aria-hidden="true"
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center w-full max-w-4xl mx-auto px-4 sm:px-6">

          {/* Eyebrow */}
          {/* <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-xs font-semibold tracking-widest uppercase mb-5 select-none">
            <Sparkles size={13} className="text-[var(--color-gold-light)]" />
            Jordan's Premier Event Marketplace
          </span> */}

          {/* Personalized greeting */}
          {firstName ? (
            <p className="text-[var(--color-gold-light)] text-sm font-semibold tracking-wide mb-2">
              Welcome back, {firstName}!
            </p>
          ) : null}

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] mb-4">
            Let's plan your{' '}
            <span className="text-gradient-gold">perfect event</span>
          </h1>

          {/* <p className="text-white/65 text-base sm:text-lg max-w-xl leading-relaxed mb-10">
            Search 500+ verified vendors — venues, catering, photography and more.
          </p> */}
          <br />
          <br />
          <br />
        

          {/* ── Smart Search Bar ─────────────────────────── */}
          <form
            onSubmit={handleSearch}
            aria-label="Search events and services"
            className="w-full max-w-3xl"
          >
            {/*
              Desktop: single pill row  flex-row
              Mobile:  stacked card     flex-col
            */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0 bg-white rounded-2xl sm:rounded-full shadow-[0_8px_40px_rgba(0,0,0,0.35)] overflow-hidden p-2 sm:p-1.5">

              {/* ── Event Type select ─────────────────── */}
              <div className="relative flex-shrink-0 sm:w-48 group">
                {/* CalendarHeart-style icon (using Calendar + a dot) */}
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-gold)] flex items-center" aria-hidden="true">
                  <Calendar size={16} />
                </span>
                <select
                  id="search-event-type"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  aria-label="Event type"
                  className="w-full appearance-none rounded-xl sm:rounded-full min-h-[44px] bg-gray-50 sm:bg-transparent border border-gray-200 sm:border-0 text-sm font-medium text-[var(--color-dark)] pl-9 pr-8 py-3 outline-none cursor-pointer focus:ring-2 focus:ring-[var(--color-gold)]/30 sm:focus:ring-0 transition-colors"
                >
                  {EVENT_TYPES.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
                  <ChevronDown size={14} />
                </span>
              </div>

              {/* Divider — desktop only */}
              <div className="hidden sm:block w-px h-8 bg-gray-200 mx-1 shrink-0" aria-hidden="true" />

              {/* ── Keyword input ─────────────────────── */}
              <div className="relative flex-1 group">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
                  <Search size={16} />
                </span>
                <input
                  id="search-keyword"
                  type="search"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="What are you looking for?"
                  aria-label="Search services or vendors"
                  className="w-full bg-gray-50 sm:bg-transparent border border-gray-200 sm:border-0 rounded-xl min-h-[44px] sm:rounded-none text-sm text-[var(--color-dark)] placeholder:text-gray-400 pl-9 pr-4 py-3 outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30 sm:focus:ring-0 transition-colors"
                />
              </div>

              {/* Divider — desktop only */}
              <div className="hidden sm:block w-px h-8 bg-gray-200 mx-1 shrink-0" aria-hidden="true" />

              {/* ── Date picker ───────────────────────── */}
              <div className="relative flex-shrink-0 sm:w-44 group">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
                  <Calendar size={16} />
                </span>
                <input
                  id="search-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  aria-label="Event date"
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full appearance-none bg-gray-50 sm:bg-transparent border border-gray-200 sm:border-0 min-h-[44px] rounded-xl sm:rounded-none text-sm text-[var(--color-dark)] pl-9 pr-3 py-3 outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30 sm:focus:ring-0 transition-colors cursor-pointer"
                />
              </div>

              {/* ── Search button ─────────────────────── */}
              <Button
                type="submit"
                variant="primary"
                size="md"
                leftIcon={<Search size={16} />}
                className="rounded-xl sm:rounded-full px-6 py-3 shrink-0 w-full sm:w-auto"
              >
                Search
              </Button>
            </div>

            {/* Quick-filter chips below search bar */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4" aria-label="Quick filters">
              {EVENT_TYPES.slice(1).map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => { setEventType(value); }}
                  className={[
                    'px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200',
                    eventType === value
                      ? 'bg-[var(--color-gold)] text-white border-[var(--color-gold)]'
                      : 'bg-white/15 backdrop-blur-sm text-white/80 border-white/25 hover:bg-white/25',
                  ].join(' ')}
                >
                  {label}
                </button>
              ))}
            </div>
          </form>
        </div>

        {/* Decorative bottom wave */}
        <div className="absolute bottom-0 left-0 right-0" aria-hidden="true">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L1440 60L1440 30C1200 60 720 0 0 30L0 60Z" fill="var(--color-surface)" />
          </svg>
        </div>
      </section>

     
      <CategoryGrid />

     
      <FeaturedServices />

      
      <EventTypeShowcase />

     
      <Testimonials />

    </PageTransition>
  );
}

export default Home;
