import { Star, Quote } from 'lucide-react';

// ─────────────────────────────────────────────────────────────
//  Mock testimonial data — 3 glowing, realistic reviews
// ─────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    id: 1,
    name: 'Sarah & Ahmad',
    role: 'Wedding Couple',
    avatar: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=120&q=80',
    rating: 5,
    text: "Eventat turned what felt like an impossible task into the most magical experience. We found our venue, caterer, and photographer in a single afternoon. The vendors were professional, responsive, and everything went flawlessly on our big day.",
    event: 'Wedding · Amman',
  },
  {
    id: 2,
    name: 'Rania Khalid',
    role: 'Corporate Event Manager',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&q=80',
    rating: 5,
    text: "I've planned over 30 corporate events and Eventat is genuinely the best platform I've used. The verified vendor system saved me hours of back-and-forth, and the booking dashboard kept everything organized. Our annual gala was a massive success.",
    event: 'Corporate Gala · Aqaba',
  },
  {
    id: 3,
    name: 'Lara Mansour',
    role: 'Milestone Birthday Planner',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&q=80',
    rating: 5,
    text: "Planning my mom's 50th birthday felt overwhelming until I discovered Eventat. The event type showcase led me straight to exactly the right vendors. The whole surprise party came together perfectly — she cried happy tears all night!",
    event: 'Milestone Birthday · Zarqa',
  },
];

// ─────────────────────────────────────────────────────────────
//  StarRow — renders N filled gold stars
// ─────────────────────────────────────────────────────────────
function StarRow({ count = 5 }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }).map((_, i) => (
        <Star
          key={i}
          size={15}
          className="text-[var(--color-gold)] fill-[var(--color-gold)]"
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  TestimonialCard — single review card
// ─────────────────────────────────────────────────────────────
function TestimonialCard({ review, index }) {
  return (
    <article
      className={[
        // Layout — h-full lets the flex-col fill the full grid cell height
        'relative flex flex-col gap-5 h-full p-7 sm:p-8',
        // Shape & surface
        'rounded-3xl bg-white border border-gray-100/80',
        // Shadow
        'shadow-[0_2px_20px_rgba(0,0,0,0.06)]',
        // Hover lift
        'transition-all duration-300 hover:-translate-y-1.5',
        'hover:shadow-[0_8px_32px_rgba(201,162,77,0.12)] hover:border-[var(--color-gold)]/20',
        // Stagger entrance animation via inline delay
      ].join(' ')}
      style={{ animationDelay: `${index * 120}ms` }}
      aria-label={`Review by ${review.name}`}
    >
      {/* ── Decorative background quote mark ────────────────── */}
      <Quote
        size={80}
        className="absolute top-5 right-5 text-[var(--color-gold)]/[0.07] pointer-events-none select-none"
        aria-hidden="true"
      />

      {/* ── Top row: stars + event tag ───────────────────────── */}
      <div className="flex items-center justify-between">
        <StarRow count={review.rating} />
        <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">
          {review.event}
        </span>
      </div>

      {/* ── Review text ──────────────────────────────────────── */}
      <blockquote className="flex-1">
        <p className="text-[15px] text-gray-600 leading-relaxed">
          "{review.text}"
        </p>
      </blockquote>

      {/* ── Divider ──────────────────────────────────────────── */}
      <div className="h-px bg-gradient-to-r from-[var(--color-gold)]/20 via-gray-100 to-transparent" aria-hidden="true" />

      {/* ── Reviewer identity ────────────────────────────────── */}
      <div className="flex items-center gap-3.5">
        {/* Avatar */}
        <div className="relative shrink-0">
          <img
            src={review.avatar}
            alt={review.name}
            loading="lazy"
            className="w-11 h-11 rounded-full object-cover ring-2 ring-[var(--color-gold)]/25"
          />
          {/* Verified dot */}
          <span
            className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[var(--color-gold)] flex items-center justify-center shadow-sm"
            aria-label="Verified reviewer"
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
              <path d="M1.5 4L3.2 5.7L6.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>

        {/* Name + role */}
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-[var(--color-dark)] truncate">{review.name}</p>
          <p className="text-xs text-gray-400 truncate">{review.role}</p>
        </div>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────
//  Testimonials — Step 2.6
//  Premium social proof section with 3-column grid.
// ─────────────────────────────────────────────────────────────
function Testimonials() {
  return (
    <section
      className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface-warm)] relative overflow-hidden"
      aria-labelledby="testimonials-heading"
    >
      {/* ── Decorative background blobs ───────────────────────── */}
      <div
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-[0.035] bg-[var(--color-gold)] blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full opacity-[0.03] bg-[var(--color-dark)] blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto relative">

        {/* ── Section heading ────────────────────────────────────── */}
        <div className="text-center mb-12">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--color-gold-dark)]">
            Real Stories
          </span>
          <h2
            id="testimonials-heading"
            className="mt-2 text-3xl sm:text-4xl font-extrabold text-[var(--color-dark)] leading-tight"
          >
            Loved by Event Planners{' '}
            <span className="text-gradient-gold">Across Jordan</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-500 max-w-md mx-auto leading-relaxed">
            Don't just take our word for it — hear from couples, managers, and planners
            who made their events unforgettable with Eventat.
          </p>

          {/* ── Global rating badge ────────────────────────────── */}
          <div className="mt-6 inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className="text-[var(--color-gold)] fill-[var(--color-gold)]"
                  aria-hidden="true"
                />
              ))}
            </div>
            <span className="text-sm font-bold text-[var(--color-dark)]">4.9</span>
            <div className="w-px h-4 bg-gray-200" aria-hidden="true" />
            <span className="text-xs text-gray-500 font-medium">from 2,000+ events planned</span>
          </div>
        </div>

        {/* ── Testimonial cards grid ─────────────────────────────── */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          role="list"
          aria-label="Customer testimonials"
        >
          {TESTIMONIALS.map((review, i) => (
            <div key={review.id} role="listitem" className="h-full">
              <TestimonialCard review={review} index={i} />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default Testimonials;
