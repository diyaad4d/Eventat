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

// FIX 3A — Full Jordan governorates + event/tourism areas
const CITIES = [
  { value: 'amman',        label: 'Amman'              },
  { value: 'zarqa',        label: 'Zarqa'              },
  { value: 'irbid',        label: 'Irbid'              },
  { value: 'aqaba',        label: 'Aqaba'              },
  { value: 'dead-sea',     label: 'Dead Sea'           },
  { value: 'petra',        label: 'Petra'              },
  { value: 'jerash',       label: 'Jerash'             },
  { value: 'madaba',       label: 'Madaba'             },
  { value: 'ajloun',       label: 'Ajloun'             },
  { value: 'salt',         label: 'Al-Salt'            },
  { value: 'karak',        label: 'Karak'              },
  { value: 'tafileh',      label: 'Tafileh'            },
  { value: 'mafraq',       label: 'Mafraq'             },
  { value: 'balqa',        label: 'Al-Balqa'           },
  { value: 'wadi-rum',     label: 'Wadi Rum'           },
  { value: 'sweimeh',      label: 'Sweimeh (Dead Sea)' },
  { value: 'zara',         label: 'Zara (Dead Sea)'    },
];

const CITIES_INITIAL_COUNT = 6;

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
//  SectionLabel
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
//  FIX 2 — DualRangeSlider — overlaid range inputs
// ─────────────────────────────────────────────────────────────
function DualRangeSlider({ minPrice, maxPrice, handleMinPrice, handleMaxPrice }) {
  return (
    <div className="relative h-5 flex items-center my-3">
      {/* Track background */}
      <div className="absolute w-full h-1.5 bg-gray-200 rounded-full" />
      {/* Filled portion */}
      <div
        className="absolute h-1.5 bg-[var(--color-gold)] rounded-full"
        style={{
          left:  `${((minPrice - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100}%`,
          right: `${100 - ((maxPrice - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100}%`,
        }}
      />
      {/* Min handle */}
      <input
        type="range"
        min={PRICE_MIN}
        max={PRICE_MAX}
        step={50}
        value={minPrice}
        onChange={handleMinPrice}
        aria-label="Minimum price"
        className="absolute w-full appearance-none bg-transparent pointer-events-none
                   [&::-webkit-slider-thumb]:pointer-events-auto
                   [&::-webkit-slider-thumb]:appearance-none
                   [&::-webkit-slider-thumb]:w-5
                   [&::-webkit-slider-thumb]:h-5
                   [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:bg-white
                   [&::-webkit-slider-thumb]:border-2
                   [&::-webkit-slider-thumb]:border-[var(--color-gold)]
                   [&::-webkit-slider-thumb]:shadow-md
                   [&::-webkit-slider-thumb]:cursor-grab
                   [&::-webkit-slider-thumb]:active:cursor-grabbing
                   [&::-moz-range-thumb]:pointer-events-auto
                   [&::-moz-range-thumb]:w-5
                   [&::-moz-range-thumb]:h-5
                   [&::-moz-range-thumb]:rounded-full
                   [&::-moz-range-thumb]:bg-white
                   [&::-moz-range-thumb]:border-2
                   [&::-moz-range-thumb]:border-[var(--color-gold)]
                   [&::-moz-range-thumb]:shadow-md
                   [&::-moz-range-thumb]:cursor-grab"
        style={{ zIndex: minPrice > PRICE_MAX - 200 ? 5 : 3 }}
      />
      {/* Max handle */}
      <input
        type="range"
        min={PRICE_MIN}
        max={PRICE_MAX}
        step={50}
        value={maxPrice}
        onChange={handleMaxPrice}
        aria-label="Maximum price"
        className="absolute w-full appearance-none bg-transparent pointer-events-none
                   [&::-webkit-slider-thumb]:pointer-events-auto
                   [&::-webkit-slider-thumb]:appearance-none
                   [&::-webkit-slider-thumb]:w-5
                   [&::-webkit-slider-thumb]:h-5
                   [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:bg-white
                   [&::-webkit-slider-thumb]:border-2
                   [&::-webkit-slider-thumb]:border-[var(--color-gold)]
                   [&::-webkit-slider-thumb]:shadow-md
                   [&::-webkit-slider-thumb]:cursor-grab
                   [&::-webkit-slider-thumb]:active:cursor-grabbing
                   [&::-moz-range-thumb]:pointer-events-auto
                   [&::-moz-range-thumb]:w-5
                   [&::-moz-range-thumb]:h-5
                   [&::-moz-range-thumb]:rounded-full
                   [&::-moz-range-thumb]:bg-white
                   [&::-moz-range-thumb]:border-2
                   [&::-moz-range-thumb]:border-[var(--color-gold)]
                   [&::-moz-range-thumb]:shadow-md
                   [&::-moz-range-thumb]:cursor-grab"
        style={{ zIndex: 4 }}
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
//  FilterSidebar — main component
//
//  Props:
//    filters          : object  — current filter state
//    onChange         : fn      — (field, value) callback
//    onClear          : fn      — resets all filters
//    onClose          : fn|null — mobile drawer close
//    lockedEventType  : string  — if set, renders event type read-only
// ─────────────────────────────────────────────────────────────
function FilterSidebar({ filters, onChange, onClear, onClose, lockedEventType }) {
  // FIX 3A — "Show more" toggle for city list
  const [showAllCities, setShowAllCities] = useState(false);

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

  // ── Fallback defaults ─────────────────────────────────────
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

  // Cities to display
  const visibleCities = showAllCities ? CITIES : CITIES.slice(0, CITIES_INITIAL_COUNT);

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
          {/* FIX 6A — If lockedEventType is set, render read-only display */}
          {lockedEventType ? (
            <div style={{ padding: '0.5rem 0' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.5rem 0.875rem', borderRadius: '9999px',
                background: 'var(--color-gold)', color: '#fff',
                fontSize: '0.8125rem', fontWeight: 700,
              }}>
                {EVENT_TYPES.find(t => t.value === lockedEventType)?.emoji}
                {EVENT_TYPES.find(t => t.value === lockedEventType)?.label}
                <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>✓ Selected</span>
              </span>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                Go back to{' '}
                <a href="/services" style={{ color: 'var(--color-gold)' }}>
                  All Services
                </a>{' '}
                to change event type.
              </p>
            </div>
          ) : (
            <>
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
                <GoldRadio
                  name="event_type"
                  value=""
                  checked={f.eventType === ''}
                  onChange={() => onChange('eventType', '')}
                >
                  All Events
                </GoldRadio>
              </div>
            </>
          )}
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

        {/* ── 4. SUBCATEGORY — dynamic, only when 1 cat selected */}
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

          {/* FIX 2 — Real dual-handle range slider */}
          <DualRangeSlider
            minPrice={f.minPrice}
            maxPrice={f.maxPrice}
            handleMinPrice={handleMinPrice}
            handleMaxPrice={handleMaxPrice}
          />

          {/* Min / Max number inputs */}
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
            {visibleCities.map(({ value, label }) => (
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

          {/* FIX 3A — Show more / Show less toggle */}
          {CITIES.length > CITIES_INITIAL_COUNT && (
            <button
              type="button"
              onClick={() => setShowAllCities((v) => !v)}
              className="mt-2 text-xs font-semibold text-[var(--color-gold)] hover:text-[var(--color-gold-dark)] transition-colors flex items-center gap-1"
            >
              <ChevronDown
                size={12}
                className={`transition-transform duration-200 ${showAllCities ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
              {showAllCities
                ? 'Show less'
                : `Show ${CITIES.length - CITIES_INITIAL_COUNT} more`}
            </button>
          )}
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

      {/* Bottom padding */}
      <div className="shrink-0 h-4" aria-hidden="true" />

    </aside>
  );
}

export default FilterSidebar;
