import { MapPin, Star, ArrowRight, BadgeCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import Badge from '../ui/Badge';

// ─────────────────────────────────────────────────────────────
//  ServiceCard
//  Supports two view modes:
//    'grid' (default) — vertical card, used in horizontal strips
//                       and grid layouts
//    'list'           — horizontal card, image left / content right
//
//  Props:
//    service  : object (see MOCK_FEATURED_SERVICES for shape)
//    viewMode : 'grid' | 'list'  (default: 'grid')
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

// ─────────────────────────────────────────────────────────────
//  StarDisplay — precise half-star rendering
// ─────────────────────────────────────────────────────────────
function StarDisplay({ rating, size = 13 }) {
  const full    = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  const empty   = 5 - full - (hasHalf ? 1 : 0);

  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`f-${i}`} size={size} fill="var(--color-gold)" stroke="var(--color-gold)" strokeWidth={1.5} />
      ))}
      {hasHalf && (
        <span className="relative inline-flex">
          <Star size={size} fill="none" stroke="#d1d5db" strokeWidth={1.5} />
          <span className="absolute inset-0 overflow-hidden w-1/2">
            <Star size={size} fill="var(--color-gold)" stroke="var(--color-gold)" strokeWidth={1.5} />
          </span>
        </span>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e-${i}`} size={size} fill="none" stroke="#d1d5db" strokeWidth={1.5} />
      ))}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
//  ServiceCard — Grid variant (vertical)
// ─────────────────────────────────────────────────────────────
function GridCard({ service, badgeVariant, unitLabel, className = '' }) {
  const { id, image, category, title, vendorName, location, rating, reviewCount, basePrice } = service;

  return (
    <article
      className={[
        'group w-full bg-white rounded-2xl overflow-hidden h-full flex flex-col',
        className,
        'shadow-[var(--shadow-card)]',
        'transition-all duration-300 ease-out',
        'hover:-translate-y-1.5 hover:shadow-[var(--shadow-card-hover)]',
        'focus-within:ring-2 focus-within:ring-[var(--color-gold)]/40',
      ].join(' ')}
      aria-label={`Service: ${title}`}
    >
      {/* Image */}
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" aria-hidden="true" />

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <Badge variant={badgeVariant} size="sm" className="backdrop-blur-sm font-semibold uppercase tracking-wide">
            {category}
          </Badge>
        </div>

        {/* Rating pill */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
          <Star size={12} fill="var(--color-gold)" stroke="var(--color-gold)" strokeWidth={1.5} />
          <span className="text-[11px] font-bold text-[var(--color-dark)]">{rating.toFixed(1)}</span>
        </div>
      </Link>

      {/* Card body */}
      <div className="p-4 flex flex-col gap-2.5 flex-1">
        <Link
          to={`/services/${id}`}
          className="block text-[15px] font-bold text-[var(--color-dark)] leading-snug line-clamp-2 hover:text-[var(--color-gold)] transition-colors duration-200 focus-visible:outline-none focus-visible:text-[var(--color-gold)]"
        >
          {title}
        </Link>

        <p className="text-xs font-medium text-gray-500 -mt-1 truncate">by {vendorName}</p>

        <div className="flex items-center gap-1 text-gray-400">
          <MapPin size={12} className="shrink-0 text-[var(--color-gold-light)]" aria-hidden="true" />
          <span className="text-xs truncate">{location}</span>
        </div>

        <div className="mt-auto flex flex-col gap-2.5">
          <div className="w-full h-px bg-gray-100" aria-hidden="true" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <StarDisplay rating={rating} />
              <span className="text-[11px] text-gray-400 font-medium">({reviewCount})</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-gray-400 font-medium">From </span>
              <span className="text-base font-extrabold text-[var(--color-dark)]">
                {basePrice.toLocaleString()} JOD
              </span>
              <span className="text-[10px] text-gray-400 block leading-none">{unitLabel}</span>
            </div>
          </div>

          <Link
            to={`/services/${id}`}
            className={[
              'group/btn mt-1 flex items-center justify-center gap-2',
              'w-full rounded-xl py-2.5 px-4',
              'text-sm font-semibold text-white',
              'bg-[var(--color-gold)] hover:bg-[var(--color-gold-dark)]',
              'transition-all duration-200 ease-out',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] focus-visible:ring-offset-1',
            ].join(' ')}
            aria-label={`Book ${title}`}
          >
            Book Now
            <ArrowRight size={15} className="transition-transform duration-200 group-hover/btn:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────
//  ServiceCard — List variant (horizontal)
//  image (left 240px fixed) | content (flex-1 right)
// ─────────────────────────────────────────────────────────────
function ListCard({ service, badgeVariant, unitLabel, className = '' }) {
  const { id, image, category, title, vendorName, location, rating, reviewCount, basePrice } = service;

  return (
    <article
      className={[
        'group flex flex-col sm:flex-row w-full bg-white rounded-2xl overflow-hidden h-full',
        className,
        'border border-gray-100',
        'shadow-[var(--shadow-card)]',
        'transition-all duration-300 ease-out',
        'hover:shadow-[var(--shadow-card-hover)] hover:border-[var(--color-gold)]/20',
        'focus-within:ring-2 focus-within:ring-[var(--color-gold)]/40',
      ].join(' ')}
      aria-label={`Service: ${title}`}
    >
      {/* Left — image (fixed width on desktop) */}
      <Link
        to={`/services/${id}`}
        className="relative block w-full sm:w-[240px] lg:w-[280px] shrink-0 h-48 sm:h-auto overflow-hidden focus:outline-none"
        tabIndex={-1}
        aria-hidden="true"
      >
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" aria-hidden="true" />

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <Badge variant={badgeVariant} size="sm" className="backdrop-blur-sm font-semibold uppercase tracking-wide">
            {category}
          </Badge>
        </div>
      </Link>

      {/* Right — content */}
      <div className="flex flex-col justify-between flex-1 p-5 lg:p-6 min-w-0">

        {/* Top: title + vendor + location */}
        <div className="flex flex-col gap-2 mb-3">

          {/* Title + verified badge row */}
          <div className="flex items-start justify-between gap-3">
            <Link
              to={`/services/${id}`}
              className="text-[17px] font-extrabold text-[var(--color-dark)] leading-snug line-clamp-2 hover:text-[var(--color-gold)] transition-colors duration-200 focus-visible:outline-none focus-visible:text-[var(--color-gold)]"
            >
              {title}
            </Link>

            {/* Rating pill — top right on list view */}
            <div className="flex items-center gap-1.5 shrink-0 bg-[var(--color-gold)]/8 border border-[var(--color-gold)]/20 px-2.5 py-1 rounded-xl">
              <Star size={13} fill="var(--color-gold)" stroke="var(--color-gold)" strokeWidth={1.5} />
              <span className="text-sm font-extrabold text-[var(--color-dark)]">{rating.toFixed(1)}</span>
              <span className="text-xs text-gray-400">({reviewCount})</span>
            </div>
          </div>

          {/* Vendor with verified icon */}
          <div className="flex items-center gap-1.5">
            <BadgeCheck size={13} className="text-[var(--color-gold)] shrink-0" aria-label="Verified vendor" />
            <span className="text-sm font-semibold text-gray-500">{vendorName}</span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5">
            <MapPin size={13} className="shrink-0 text-[var(--color-gold-light)]" aria-hidden="true" />
            <span className="text-sm text-gray-400">{location}</span>
          </div>

          {/* Star row with review count */}
          <div className="flex items-center gap-2 mt-1">
            <StarDisplay rating={rating} size={14} />
            <span className="text-xs text-gray-400">{reviewCount} reviews</span>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-[var(--color-gold)]/15 via-gray-100 to-transparent mb-4" aria-hidden="true" />

        {/* Bottom: price + CTA */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-xs text-gray-400 font-medium">From</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-[var(--color-dark)] leading-none">
                {basePrice.toLocaleString()}
              </span>
              <span className="text-sm font-bold text-[var(--color-dark)]">JOD</span>
              <span className="text-xs text-gray-400">{unitLabel}</span>
            </div>
          </div>

          <Link
            to={`/services/${id}`}
            className={[
              'group/btn inline-flex items-center gap-2 shrink-0',
              'px-6 py-3 rounded-xl',
              'text-sm font-bold text-white',
              'bg-[var(--color-gold)] hover:bg-[var(--color-gold-dark)]',
              'shadow-[0_4px_14px_rgba(201,162,77,0.28)] hover:shadow-[0_6px_20px_rgba(201,162,77,0.42)]',
              'transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] focus-visible:ring-offset-2',
            ].join(' ')}
            aria-label={`Book ${title}`}
          >
            Book Now
            <ArrowRight size={15} className="transition-transform duration-200 group-hover/btn:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────
//  ServiceCard — public export
//  Delegates to GridCard or ListCard based on viewMode prop.
// ─────────────────────────────────────────────────────────────
function ServiceCard({ service, viewMode = 'grid', className = '' }) {
  const badgeVariant = CATEGORY_VARIANT_MAP[service.categorySlug] ?? 'gray';
  const unitLabel = {
    per_event:  '/ event',
    per_hour:   '/ hr',
    per_person: '/ person',
    per_day:    '/ day',
  }[service.pricingUnit] ?? '/ event';

  if (viewMode === 'list') {
    return <ListCard service={service} badgeVariant={badgeVariant} unitLabel={unitLabel} className={className} />;
  }
  return <GridCard service={service} badgeVariant={badgeVariant} unitLabel={unitLabel} className={className} />;
}

export default ServiceCard;
