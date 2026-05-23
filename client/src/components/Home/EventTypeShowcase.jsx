import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Heart, GraduationCap, Gift, Briefcase } from 'lucide-react';

// ─────────────────────────────────────────────────────────────
//  Event type data
//  accentFrom/To: colored tint layered under the dark gradient
//  to give each card its own atmospheric mood.
// ─────────────────────────────────────────────────────────────
const EVENT_TYPES = [
  {
    slug:      'wedding',
    label:     'Wedding',
    index:     '01',
    tagline:   'The day you\'ll never forget',
    detail:    'From grand ballrooms to intimate gardens — every detail, perfectly placed.',
    icon:      Heart,
    image:     'https://images.unsplash.com/photo-1519741497674-611481863552?w=1400&q=90',
    tintClass: 'from-rose-950/80 via-rose-900/40',
  },
  {
    slug:      'graduation',
    label:     'Graduation',
    index:     '02',
    tagline:   'Celebrate your greatest achievement',
    detail:    'Cap-toss moments and celebrations that match the scale of your success.',
    icon:      GraduationCap,
    image:     'https://images.unsplash.com/photo-1627556592933-5b578d905665?w=1000&q=85',
    tintClass: 'from-blue-950/80 via-blue-900/40',
  },
  {
    slug:      'milestone-birthdays',
    label:     'Birthdays',
    index:     '03',
    tagline:   'Celebrate life\'s biggest milestones',
    detail:    'Unforgettable setups for your 18th, 21st, 50th, and beyond.',
    icon:      Gift,
    image:     'https://images.unsplash.com/photo-1530103862676-de3c9de59f9e?w=1000&q=85',
    tintClass: 'from-fuchsia-950/80 via-fuchsia-900/40',
  },
  {
    slug:      'corporate',
    label:     'Corporate',
    index:     '04',
    tagline:   'Impress, inspire, and connect',
    detail:    'Galas, product launches, and conferences that leave a lasting impression.',
    icon:      Briefcase,
    image:     'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1000&q=85',
    tintClass: 'from-slate-950/85 via-slate-800/40',
  },
];

// ─────────────────────────────────────────────────────────────
//  Single accordion panel
// ─────────────────────────────────────────────────────────────
function AccordionPanel({ event, isActive, onActivate }) {
  const Icon = event.icon;

  return (
    <div
      className="relative overflow-hidden cursor-pointer select-none"
      style={{
        // Main axis flex — controls WIDTH on desktop (flex-row),
        // HEIGHT on mobile (flex-col). One prop, two axes. ✨
        flex:       isActive ? 3.5 : 1,
        minWidth:   '68px',   // collapsed desktop minimum
        minHeight:  '72px',   // collapsed mobile minimum
        transition: 'flex 700ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onMouseEnter={onActivate}
      onClick={onActivate}
      aria-expanded={isActive}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onActivate()}
      aria-label={`Expand ${event.label} event type`}
    >
      {/* ── Background image ──────────────────────────────── */}
      <img
        src={event.image}
        alt={event.label}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          transform:  isActive ? 'scale(1.06)' : 'scale(1)',
          transition: 'transform 900ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />

      {/* ── Atmospheric tint layer (per-event colour mood) ── */}
      <div
        className={[
          'absolute inset-0 bg-gradient-to-t',
          event.tintClass,
          'to-transparent',
          'transition-opacity duration-700',
          isActive ? 'opacity-70' : 'opacity-50',
        ].join(' ')}
        aria-hidden="true"
      />

      {/* ── Deep dark overlay for text legibility ─────────── */}
      <div
        className={[
          'absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent',
          'transition-opacity duration-700',
          isActive ? 'opacity-100' : 'opacity-60',
        ].join(' ')}
        aria-hidden="true"
      />

      {/* ── Right-edge accent line (collapsed) ────────────── */}
      <div
        className={[
          'absolute top-0 right-0 bottom-0 w-px',
          'bg-gradient-to-b from-transparent via-white/20 to-transparent',
          'transition-opacity duration-500',
          isActive ? 'opacity-0' : 'opacity-100',
        ].join(' ')}
        aria-hidden="true"
      />

      {/* ── Gold bottom shimmer (active) ──────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent"
        style={{
          opacity:    isActive ? 1 : 0,
          transition: 'opacity 500ms ease',
        }}
        aria-hidden="true"
      />

      {/* ══════════════════════════════════════════════════════
          COLLAPSED STATE — vertical rotated label (desktop)
          horizontal label (mobile)
      ══════════════════════════════════════════════════════ */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          opacity:    isActive ? 0 : 1,
          transition: 'opacity 300ms ease',
          pointerEvents: isActive ? 'none' : 'auto',
        }}
        aria-hidden={isActive}
      >
        {/* Index number — always visible when collapsed */}
        <div className="absolute top-5 left-0 right-0 flex justify-center">
          <span className="text-[10px] font-black text-white/30 tracking-[0.3em]">
            {event.index}
          </span>
        </div>

        {/* Icon */}
        <Icon
          size={20}
          className="absolute top-14 left-1/2 -translate-x-1/2 text-white/40"
          aria-hidden="true"
        />

        {/* Vertical label — desktop only */}
        <span
          className="hidden md:block text-white font-extrabold text-sm tracking-[0.25em] uppercase whitespace-nowrap"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          {event.label}
        </span>

        {/* Horizontal label — mobile only */}
        <span className="md:hidden text-white font-extrabold text-sm tracking-widest uppercase">
          {event.label}
        </span>
      </div>

      {/* ══════════════════════════════════════════════════════
          EXPANDED STATE — full content
      ══════════════════════════════════════════════════════ */}
      <div
        className="absolute bottom-0 left-0 right-0 p-6 sm:p-8"
        style={{
          opacity:    isActive ? 1 : 0,
          transform:  isActive ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 400ms ease 200ms, transform 400ms ease 200ms',
          pointerEvents: isActive ? 'auto' : 'none',
        }}
        aria-hidden={!isActive}
      >
        {/* Index + icon row */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-black text-[var(--color-gold)] tracking-[0.3em]">
            {event.index}
          </span>
          <div className="h-px flex-1 bg-[var(--color-gold)]/30" aria-hidden="true" />
          <Icon size={16} className="text-[var(--color-gold)]" aria-hidden="true" />
        </div>

        {/* Tagline */}
        <p className="text-[var(--color-gold-light)] text-xs font-semibold tracking-widest uppercase mb-1.5">
          {event.tagline}
        </p>

        {/* Event title */}
        <h3 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight mb-2">
          {event.label}
        </h3>

        {/* Detail line */}
        <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-[260px]">
          {event.detail}
        </p>

        {/* CTA button */}
        <Link
          to={`/services/${event.slug}`}
          onClick={(e) => e.stopPropagation()}
          className={[
            'group/cta inline-flex items-center gap-2.5',
            'px-5 py-2.5 rounded-xl text-sm font-bold text-white',
            'bg-[var(--color-gold)] hover:bg-[var(--color-gold-dark)]',
            'shadow-[0_4px_20px_rgba(201,162,77,0.4)]',
            'hover:shadow-[0_6px_28px_rgba(201,162,77,0.55)]',
            'transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2',
            'focus-visible:ring-[var(--color-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-black',
          ].join(' ')}
          aria-label={`Plan a ${event.label} event`}
        >
          <Sparkles size={14} aria-hidden="true" />
          Plan This Event
          <ArrowRight
            size={14}
            className="transition-transform duration-200 group-hover/cta:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  EventTypeShowcase — Step 2.5 (Horizontal Expanding Accordion)
// ─────────────────────────────────────────────────────────────
function EventTypeShowcase() {
  // Default to Wedding expanded
  const [activeId, setActiveId] = useState('wedding');

  // ── Debounce ref — prevents jarring snap-back on slow mouse-leave ──
  const resetTimerRef = useRef(null);

  const handlePanelActivate = (slug) => {
    // Clear any pending reset when user re-enters a panel
    clearTimeout(resetTimerRef.current);
    setActiveId(slug);
  };

  const handleMouseLeave = () => {
    resetTimerRef.current = setTimeout(() => {
      setActiveId('wedding');
    }, 300);
  };

  return (
    <section
      className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--color-dark)] relative overflow-hidden"
      aria-labelledby="event-types-heading"
    >
      {/* ── Subtle radial glow in the background ──────────── */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-[0.06] bg-[var(--color-gold)] blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto relative">

        {/* ── Section heading ────────────────────────────────── */}
        <div className="text-center mb-12">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--color-gold)]">
            What Are You Celebrating?
          </span>
          <h2
            id="event-types-heading"
            className="mt-2 text-3xl sm:text-4xl font-extrabold text-white leading-tight"
          >
            Every Event,{' '}
            <span className="text-gradient-gold">Perfectly Planned</span>
          </h2>
          {/* <p className="mt-3 text-sm sm:text-base text-white/50 max-w-md mx-auto leading-relaxed">
            Hover to explore. Click to start planning your perfect occasion.
          </p> */}
          <br />
        </div>

        {/* ── Accordion container ───────────────────────────── */}
        {/*
            flex-col on mobile  → panels stack vertically, flex controls height
            flex-row on desktop → panels sit side-by-side, flex controls width
        */}
        <div
          id="event-accordion"
          className="flex flex-col md:flex-row gap-1.5 md:gap-2 rounded-3xl overflow-hidden h-auto md:h-[560px]"
          onMouseLeave={handleMouseLeave}
          role="list"
          aria-label="Event type panels"
        >

          {EVENT_TYPES.map((event) => (
            <AccordionPanel
              key={event.slug}
              event={event}
              isActive={activeId === event.slug}
              onActivate={() => handlePanelActivate(event.slug)}
            />
          ))}
        </div>

        {/* ── Dot indicators ─────────────────────────────────── */}
        <div className="flex justify-center gap-2 mt-6" aria-hidden="true">
          {EVENT_TYPES.map((event) => (
            <button
              key={event.slug}
              onClick={() => setActiveId(event.slug)}
              className={[
                'rounded-full transition-all duration-300',
                activeId === event.slug
                  ? 'w-6 h-2 bg-[var(--color-gold)]'
                  : 'w-2 h-2 bg-white/25 hover:bg-white/50',
              ].join(' ')}
              aria-label={`Select ${event.label}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}

export default EventTypeShowcase;
