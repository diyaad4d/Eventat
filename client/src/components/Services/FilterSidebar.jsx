import { useState } from 'react';
import {
  SlidersHorizontal, X, ChevronDown, Search,
  Building2, UtensilsCrossed, Camera, Music2,
  Flower2, Car, Sparkles, BedDouble,
  Star,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
//  Static filter data
// ─────────────────────────────────────────────────────────────
const EVENT_TYPES = [
  { value: 'wedding',             label: 'Wedding',             emoji: '💍' },
  { value: 'graduation',          label: 'Graduation',          emoji: '🎓' },
  { value: 'milestone-birthdays', label: 'Milestone Birthdays', emoji: '🎂' },
  { value: 'corporate',           label: 'Corporate',           emoji: '💼' },
  { value: 'general',             label: 'General',             emoji: '🎉' },
];

const CATEGORIES = [
  { value: 'venue',         label: 'Venue',         Icon: Building2       },
  { value: 'catering',      label: 'Catering',      Icon: UtensilsCrossed },
  { value: 'photography',   label: 'Photography',   Icon: Camera          },
  { value: 'entertainment', label: 'Entertainment', Icon: Music2          },
  { value: 'decoration',    label: 'Decoration',    Icon: Flower2         },
  { value: 'transport',     label: 'Transport',     Icon: Car             },
  { value: 'fireworks',     label: 'Fireworks',     Icon: Sparkles        },
  { value: 'accommodation', label: 'Accommodation', Icon: BedDouble       },
];

// Subcategories keyed by parent category value
const SUBCATEGORIES = {
  venue:         ['Hotels', 'Halls', 'Farms', 'Indoor', 'Outdoor', 'Pool', 'Parking', 'View'],
  catering:      ['Buffet', 'Plated Dinner', 'Food Trucks', 'Pastry & Desserts'],
  photography:   ['Wedding Photography', 'Portrait', 'Drone / Aerial', 'Videography'],
  entertainment: ['Live Band', 'DJ', 'Comedian', 'Cultural Performers'],
  decoration:    ['Floral', 'Balloons', 'Lighting', 'Table Setup'],
  transport:     ['Luxury Cars', 'Buses', 'Motorcycles', 'Valet'],
  fireworks:     ['Indoor Pyrotechnics', 'Outdoor Shows', 'Cold Sparks'],
  accommodation: ['Hotels', 'Chalets', 'Villas', 'Resorts'],
};

const CITIES = [
  { value: 'amman',    label: 'Amman'    },
  { value: 'zarqa',    label: 'Zarqa'    },
  { value: 'irbid',    label: 'Irbid'    },
  { value: 'aqaba',    label: 'Aqaba'    },
  { value: 'dead-sea', label: 'Dead Sea' },
];

const RATING_OPTIONS = [
  { value: 4, label: '4★ & above' },
  { value: 3, label: '3★ & above' },
  { value: 0, label: 'Any rating'  },
];

const PRICE_MIN = 0;
const PRICE_MAX = 5000;

// ─────────────────────────────────────────────────────────────
//  Default filter state — exported so Services.jsx can reset
// ─────────────────────────────────────────────────────────────
export const DEFAULT_FILTERS = {
  keyword:     '',
  eventType:   '',
  categories:  [],
  subcategory: '',
  minPrice:    PRICE_MIN,
  maxPrice:    PRICE_MAX,
  cities:      [],
  rating:      0,
  date:        '',
};

// ─────────────────────────────────────────────────────────────
//  SectionLabel — small uppercase eyebrow for each filter group
// ─────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <p className="text-[10px] font-semibold text-gray-400 tracking-[0.15em] uppercase mb-3 select-none">
      {children}
    </p>
  );
}

// ─────────────────────────────────────────────────────────────
//  FilterSection — animated collapsible wrapper
// ─────────────────────────────────────────────────────────────
function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 last:border-0 py-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full py-3 cursor-pointer select-none focus-visible:outline-none group"
        aria-expanded={open}
      >
        <span className="text-sm font-bold text-[var(--color-dark)] tracking-wide">
          {title}
        </span>
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {/* Content — animated slide-down via max-height */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="pb-4">{children}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  GoldRadio — styled radio option
// ─────────────────────────────────────────────────────────────
function GoldRadio({ name, value, checked, onChange, children }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group/r py-0.5">
      <span
        className={[
          'relative flex items-center justify-center w-[17px] h-[17px] rounded-full border-2 shrink-0 transition-colors duration-150',
          checked
            ? 'border-[var(--color-gold)] bg-[var(--color-gold)]'
            : 'border-gray-300 bg-white group-hover/r:border-[var(--color-gold-light)]',
        ].join(' ')}
      >
        {checked && (
          <span className="w-2 h-2 rounded-full bg-white block" />
        )}
      </span>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span className="text-sm text-gray-600 group-hover/r:text-[var(--color-dark)] transition-colors">
        {children}
      </span>
    </label>
  );
}

// ─────────────────────────────────────────────────────────────
//  GoldCheckbox — styled checkbox option
// ─────────────────────────────────────────────────────────────
function GoldCheckbox({ value, checked, onChange, children }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group/c py-0.5">
      <span
        className={[
          'relative flex items-center justify-center w-[17px] h-[17px] rounded-[5px] border-2 shrink-0 transition-colors duration-150',
          checked
            ? 'border-[var(--color-gold)] bg-[var(--color-gold)]'
            : 'border-gray-300 bg-white group-hover/c:border-[var(--color-gold-light)]',
        ].join(' ')}
      >
        {checked && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none" aria-hidden="true">
            <path d="M1 3.5L3.2 5.7L8 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </span>
      <input
        type="checkbox"
        value={value}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span className="text-sm text-gray-600 group-hover/c:text-[var(--color-dark)] transition-colors">
        {children}
      </span>
    </label>
  );
}

// ─────────────────────────────────────────────────────────────
//  PriceRangeTrack — visual min/max slider track
//  Renders a filled gold track between the two thumb positions
// ─────────────────────────────────────────────────────────────
function PriceRangeTrack({ min, max }) {
  const leftPct  = ((min - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  const rightPct = ((max - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

  return (
    <div className="relative h-1.5 w-full bg-gray-200 rounded-full my-2" aria-hidden="true">
      {/* Filled portion */}
      <div
        className="absolute top-0 bottom-0 bg-[var(--color-gold)] rounded-full"
        style={{ left: `${leftPct}%`, right: `${100 - rightPct}%` }}
      />
      {/* Left thumb dot */}
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-[var(--color-gold)] shadow-sm"
        style={{ left: `${leftPct}%` }}
      />
      {/* Right thumb dot */}
      <div
        className="absolute top-1/2 -translate-y-1/2 translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-[var(--color-gold)] shadow-sm"
        style={{ right: `${100 - rightPct}%` }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  StarRatingFilter — inline star selector
// ─────────────────────────────────────────────────────────────
function StarRatingFilter({ value, onChange }) {
  return (
    <div className="flex flex-col gap-2.5" role="radiogroup" aria-label="Minimum rating">
      {RATING_OPTIONS.map(({ value: v, label }) => (
        <GoldRadio
          key={v}
          name="rating"
          value={String(v)}
          checked={value === v}
          onChange={() => onChange(v)}
        >
          <span className="flex items-center gap-1.5">
            {v > 0 ? (
              <>
                {Array.from({ length: v }).map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    className="text-[var(--color-gold)] fill-[var(--color-gold)]"
                    aria-hidden="true"
                  />
                ))}
                {Array.from({ length: 5 - v }).map((_, i) => (
                  <Star key={i} size={12} className="text-gray-300" aria-hidden="true" />
                ))}
                <span className="text-sm text-gray-600 ml-0.5">{label}</span>
              </>
            ) : (
              <span className="text-sm text-gray-600">{label}</span>
            )}
          </span>
        </GoldRadio>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  FilterSidebar — Step 3.2 (Full implementation)
//
//  Props:
//    filters  : object  — current filter state (from Services.jsx)
//    onChange : fn      — called with (field, value) on every change
//    onApply  : fn      — called when "Apply Filters" is clicked
//    onClear  : fn      — called when "Clear All" is clicked
//    onClose  : fn|null — mobile drawer close button (optional)
// ─────────────────────────────────────────────────────────────
function FilterSidebar({ filters, onChange, onClear, onClose }) {

  // ── Derived: which subcategories to show ──────────────────
  const activeSubcats = filters?.categories?.length === 1
    ? SUBCATEGORIES[filters.categories[0]] ?? []
    : [];

  // ── Helpers ───────────────────────────────────────────────
  const handleCategoryToggle = (val) => {
    const current = filters?.categories ?? [];
    const next = current.includes(val)
      ? current.filter((c) => c !== val)
      : [...current, val];
    onChange('categories', next);
    // Clear subcategory whenever categories change
    onChange('subcategory', '');
  };

  const handleCityToggle = (val) => {
    const current = filters?.cities ?? [];
    const next = current.includes(val)
      ? current.filter((c) => c !== val)
      : [...current, val];
    onChange('cities', next);
  };

  const handleMinPrice = (e) => {
    const v = Math.max(PRICE_MIN, Math.min(Number(e.target.value), filters?.maxPrice ?? PRICE_MAX));
    onChange('minPrice', v);
  };

  const handleMaxPrice = (e) => {
    const v = Math.min(PRICE_MAX, Math.max(Number(e.target.value), filters?.minPrice ?? PRICE_MIN));
    onChange('maxPrice', v);
  };

  // ── Fallback defaults (when used without parent state) ────
  const f = {
    keyword:     '',
    eventType:   '',
    categories:  [],
    subcategory: '',
    minPrice:    PRICE_MIN,
    maxPrice:    PRICE_MAX,
    cities:      [],
    rating:      0,
    date:        '',
    ...(filters ?? {}),
  };

  // Active filter count for the badge
  const activeCount = [
    f.keyword,
    f.eventType,
    f.categories.length > 0,
    f.subcategory,
    f.minPrice > PRICE_MIN || f.maxPrice < PRICE_MAX,
    f.cities.length > 0,
    f.rating > 0,
    f.date,
  ].filter(Boolean).length;

  return (
    <aside
      className="flex flex-col h-full bg-white"
      aria-label="Service filters"
    >

      {/* ══════════════════════════════════════════════════════
          HEADER
      ══════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2">
          <SlidersHorizontal
            size={15}
            className="text-[var(--color-gold)]"
            aria-hidden="true"
          />
          <h2 className="text-sm font-extrabold text-[var(--color-dark)] tracking-wide">
            Filters
          </h2>
          {/* Active count badge */}
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--color-gold)] text-[10px] font-black text-white">
              {activeCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-semibold text-[var(--color-gold-dark)] hover:text-[var(--color-gold)] transition-colors"
            aria-label="Clear all filters"
          >
            Clear All
          </button>

          {/* Close button — mobile drawer only */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors md:hidden"
              aria-label="Close filters"
            >
              <X size={15} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          SCROLLABLE FILTER BODY
      ══════════════════════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto px-5 py-1 space-y-0.5">

        {/* ── 1. SEARCH ─────────────────────────────────────── */}
        <FilterSection title="Search" defaultOpen={true}>
          <SectionLabel>Keyword or vendor name</SectionLabel>
          <div className="relative">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="filter-search"
              type="search"
              value={f.keyword}
              onChange={(e) => onChange('keyword', e.target.value)}
              placeholder="e.g. Four Seasons, florist…"
              className={[
                'w-full rounded-xl border border-gray-200 bg-gray-50',
                'pl-9 pr-3 py-2.5 text-sm text-[var(--color-dark)]',
                'placeholder:text-gray-400 outline-none',
                'focus:border-[var(--color-gold)] focus:bg-white',
                'focus:ring-2 focus:ring-[var(--color-gold)]/20',
                'transition-all duration-150',
              ].join(' ')}
              aria-label="Search vendors or keywords"
            />
          </div>
        </FilterSection>

        {/* ── 2. EVENT TYPE ─────────────────────────────────── */}
        <FilterSection title="Event Type" defaultOpen={true}>
          <SectionLabel>Select one event type</SectionLabel>
          <div className="flex flex-col gap-1.5" role="radiogroup" aria-label="Event type">
            {EVENT_TYPES.map(({ value, label, emoji }) => (
              <GoldRadio
                key={value}
                name="event_type"
                value={value}
                checked={f.eventType === value}
                onChange={() => onChange('eventType', value)}
              >
                <span className="flex items-center gap-1.5">
                  <span aria-hidden="true">{emoji}</span>
                  {label}
                </span>
              </GoldRadio>
            ))}
            {/* "Any" option — clears selection */}
            <GoldRadio
              name="event_type"
              value=""
              checked={f.eventType === ''}
              onChange={() => onChange('eventType', '')}
            >
              All Events
            </GoldRadio>
          </div>
        </FilterSection>

        {/* ── 3. CATEGORY ───────────────────────────────────── */}
        <FilterSection title="Category" defaultOpen={true}>
          <SectionLabel>Select one or more</SectionLabel>
          <div className="flex flex-col gap-1.5" role="group" aria-label="Category">
            {CATEGORIES.map(({ value, label, Icon }) => (
              <GoldCheckbox
                key={value}
                value={value}
                checked={f.categories.includes(value)}
                onChange={() => handleCategoryToggle(value)}
              >
                <span className="flex items-center gap-1.5">
                  <Icon
                    size={13}
                    className={
                      f.categories.includes(value)
                        ? 'text-[var(--color-gold)]'
                        : 'text-gray-400'
                    }
                    aria-hidden="true"
                  />
                  {label}
                </span>
              </GoldCheckbox>
            ))}
          </div>
        </FilterSection>

        {/* ── 4. SUBCATEGORY — dynamic, only when 1 cat is selected */}
        {activeSubcats.length > 0 && (
          <FilterSection title="Subcategory" defaultOpen={true}>
            <SectionLabel>
              Under {CATEGORIES.find((c) => c.value === f.categories[0])?.label}
            </SectionLabel>
            <div className="flex flex-col gap-1.5" role="radiogroup" aria-label="Subcategory">
              {activeSubcats.map((sub) => (
                <GoldRadio
                  key={sub}
                  name="subcategory"
                  value={sub}
                  checked={f.subcategory === sub}
                  onChange={() => onChange('subcategory', sub)}
                >
                  {sub}
                </GoldRadio>
              ))}
              <GoldRadio
                name="subcategory"
                value=""
                checked={f.subcategory === ''}
                onChange={() => onChange('subcategory', '')}
              >
                All subcategories
              </GoldRadio>
            </div>
          </FilterSection>
        )}

        {/* ── 5. PRICE RANGE ────────────────────────────────── */}
        <FilterSection title="Price Range (JOD)" defaultOpen={true}>
          <SectionLabel>0 — 5,000 JOD</SectionLabel>

          {/* Visual track */}
          <PriceRangeTrack min={f.minPrice} max={f.maxPrice} />

          {/* Min / Max inputs */}
          <div className="flex items-end gap-2 mt-3">
            <div className="flex-1">
              <label
                htmlFor="filter-min-price"
                className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider"
              >
                Min JOD
              </label>
              <input
                id="filter-min-price"
                type="number"
                value={f.minPrice}
                onChange={handleMinPrice}
                min={PRICE_MIN}
                max={f.maxPrice}
                step={50}
                className={[
                  'w-full mt-1 rounded-lg border border-gray-200 bg-gray-50',
                  'px-3 py-2 text-sm font-semibold text-[var(--color-dark)]',
                  'outline-none focus:border-[var(--color-gold)]',
                  'focus:ring-2 focus:ring-[var(--color-gold)]/20 transition-all',
                ].join(' ')}
              />
            </div>
            <div className="pb-2 text-gray-300 font-bold text-lg leading-none">—</div>
            <div className="flex-1">
              <label
                htmlFor="filter-max-price"
                className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider"
              >
                Max JOD
              </label>
              <input
                id="filter-max-price"
                type="number"
                value={f.maxPrice}
                onChange={handleMaxPrice}
                min={f.minPrice}
                max={PRICE_MAX}
                step={50}
                className={[
                  'w-full mt-1 rounded-lg border border-gray-200 bg-gray-50',
                  'px-3 py-2 text-sm font-semibold text-[var(--color-dark)]',
                  'outline-none focus:border-[var(--color-gold)]',
                  'focus:ring-2 focus:ring-[var(--color-gold)]/20 transition-all',
                ].join(' ')}
              />
            </div>
          </div>

          {/* Live label */}
          <p className="mt-2 text-xs text-center text-[var(--color-gold-dark)] font-semibold">
            {f.minPrice.toLocaleString()} — {f.maxPrice.toLocaleString()} JOD
          </p>
        </FilterSection>

        {/* ── 6. LOCATION / CITY ────────────────────────────── */}
        <FilterSection title="Location / City" defaultOpen={false}>
          <SectionLabel>Select one or more cities</SectionLabel>
          <div className="flex flex-col gap-1.5" role="group" aria-label="City">
            {CITIES.map(({ value, label }) => (
              <GoldCheckbox
                key={value}
                value={value}
                checked={f.cities.includes(value)}
                onChange={() => handleCityToggle(value)}
              >
                {label}
              </GoldCheckbox>
            ))}
          </div>
        </FilterSection>

        {/* ── 7. RATING ─────────────────────────────────────── */}
        <FilterSection title="Rating" defaultOpen={false}>
          <SectionLabel>Minimum star rating</SectionLabel>
          <StarRatingFilter
            value={f.rating}
            onChange={(v) => onChange('rating', v)}
          />
        </FilterSection>

        {/* ── 8. AVAILABILITY DATE ──────────────────────────── */}
        <FilterSection title="Availability Date" defaultOpen={false}>
          <SectionLabel>Find vendors available on</SectionLabel>
          <input
            id="filter-date"
            type="date"
            value={f.date}
            onChange={(e) => onChange('date', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className={[
              'w-full rounded-xl border border-gray-200 bg-gray-50',
              'px-4 py-2.5 text-sm text-[var(--color-dark)]',
              'outline-none cursor-pointer',
              'focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/20',
              'transition-all',
            ].join(' ')}
            aria-label="Select availability date"
          />
          {f.date && (
            <button
              type="button"
              onClick={() => onChange('date', '')}
              className="mt-2 text-xs text-gray-400 hover:text-red-400 transition-colors"
            >
              Clear date
            </button>
          )}
        </FilterSection>

      </div>

      {/* Bottom padding so last filter section isn't flush against the edge */}
      <div className="shrink-0 h-4" aria-hidden="true" />

    </aside>
  );
}

export default FilterSidebar;
