import { MapPin, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Badge from '../ui/Badge';

// ─────────────────────────────────────────────────────────────
//  ServiceCard
//  Displays: image, category badge, title, vendor name,
//            location, star rating + count, base price,
//            "Book Now" CTA button.
//
//  Props:
//    service  : object (see MOCK_FEATURED_SERVICES for shape)
// ─────────────────────────────────────────────────────────────

// Map each category slug to a visual Badge variant
const CATEGORY_VARIANT_MAP = {
  venue:         'blue',
  catering:      'gold',
  photography:   'info',
  entertainment: 'warning',
  decoration:    'success',
  transport:     'gray',
  accommodation: 'dark',
  fireworks:     'error',
};

function StarDisplay({ rating }) {
  const full    = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  const empty   = 5 - full - (hasHalf ? 1 : 0);

  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`f-${i}`} size={13} fill="var(--color-gold)" stroke="var(--color-gold)" strokeWidth={1.5} />
      ))}
      {hasHalf && (
        <span className="relative inline-flex">
          <Star size={13} fill="none" stroke="#d1d5db" strokeWidth={1.5} />
          <span className="absolute inset-0 overflow-hidden w-1/2">
            <Star size={13} fill="var(--color-gold)" stroke="var(--color-gold)" strokeWidth={1.5} />
          </span>
        </span>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e-${i}`} size={13} fill="none" stroke="#d1d5db" strokeWidth={1.5} />
      ))}
    </span>
  );
}

function ServiceCard({ service }) {
  const {
    id,
    image,
    category,
    categorySlug,
    title,
    vendorName,
    location,
    rating,
    reviewCount,
    basePrice,
    pricingUnit,
  } = service;

  const badgeVariant = CATEGORY_VARIANT_MAP[categorySlug] ?? 'gray';

  // Formatted unit label
  const unitLabel = {
    per_event:  '/ event',
    per_hour:   '/ hr',
    per_person: '/ person',
    per_day:    '/ day',
  }[pricingUnit] ?? '/ event';

  return (
    <article
      className={[
        // Fixed card dimensions for consistent horizontal strip
        'relative flex-shrink-0 w-72 sm:w-80',
        'bg-white rounded-2xl overflow-hidden',
        'shadow-[var(--shadow-card)]',
        'group transition-all duration-300 ease-out',
        'hover:-translate-y-1.5 hover:shadow-[var(--shadow-card-hover)]',
        'focus-within:ring-2 focus-within:ring-[var(--color-gold)]/40',
      ].join(' ')}
      aria-label={`Service: ${title}`}
    >
      {/* ── Image ─────────────────────────────────────────── */}
      <Link
        to={`/services/${id}`}
        className="block relative h-48 overflow-hidden focus:outline-none"
        tabIndex={-1}
        aria-hidden="true"
      >
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Subtle gradient at bottom of image for text legibility */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"
          aria-hidden="true"
        />

        {/* Category badge — floated over image top-left */}
        <div className="absolute top-3 left-3">
        <Badge variant={badgeVariant} size="sm" className="backdrop-blur-sm font-semibold uppercase tracking-wide">
            {category}
          </Badge>
        </div>

        {/* Rating pill — floated over image top-right */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
          <Star size={12} fill="var(--color-gold)" stroke="var(--color-gold)" strokeWidth={1.5} />
          <span className="text-[11px] font-bold text-[var(--color-dark)]">{rating.toFixed(1)}</span>
        </div>
      </Link>

      {/* ── Card Body ─────────────────────────────────────── */}
      <div className="p-4 flex flex-col gap-2.5">

        {/* Title */}
        <Link
          to={`/services/${id}`}
          className="block text-[15px] font-bold text-[var(--color-dark)] leading-snug line-clamp-2 hover:text-[var(--color-gold)] transition-colors duration-200 focus-visible:outline-none focus-visible:text-[var(--color-gold)]"
        >
          {title}
        </Link>

        {/* Vendor name */}
        <p className="text-xs font-medium text-gray-500 -mt-1 truncate">
          by {vendorName}
        </p>

        {/* Location */}
        <div className="flex items-center gap-1 text-gray-400">
          <MapPin size={12} className="shrink-0 text-[var(--color-gold-light)]" aria-hidden="true" />
          <span className="text-xs truncate">{location}</span>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gray-100" aria-hidden="true" />

        {/* Bottom row: rating + price */}
        <div className="flex items-center justify-between">
          {/* Star display + review count */}
          <div className="flex items-center gap-1.5">
            <StarDisplay rating={rating} />
            <span className="text-[11px] text-gray-400 font-medium">({reviewCount})</span>
          </div>

          {/* Price */}
          <div className="text-right">
            <span className="text-[11px] text-gray-400 font-medium">From</span>{' '}
            <span className="text-base font-extrabold text-[var(--color-dark)]">
              {basePrice.toLocaleString()} JOD
            </span>
            <span className="text-[10px] text-gray-400 block leading-none">{unitLabel}</span>
          </div>
        </div>

        {/* Book Now button */}
        <Link
          to={`/services/${id}`}
          className={[
            'group/btn mt-1 flex items-center justify-center gap-2',
            'w-full rounded-xl py-2.5 px-4',
            'text-sm font-semibold text-white',
            'bg-[var(--color-gold)] hover:bg-[var(--color-gold-dark)]',
            'transition-all duration-250 ease-out',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] focus-visible:ring-offset-1',
          ].join(' ')}
          aria-label={`Book ${title}`}
        >
          Book Now
          <ArrowRight
            size={15}
            className="transition-transform duration-200 group-hover/btn:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>
    </article>
  );
}

export default ServiceCard;
