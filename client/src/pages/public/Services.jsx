import React, { useState, useEffect, useCallback } from 'react';
import {
  SlidersHorizontal, LayoutGrid, List,
  ChevronDown, SearchX, RefreshCw,
} from 'lucide-react';

import FilterSidebar, { DEFAULT_FILTERS } from '../../components/Services/FilterSidebar';
import ServiceCard from '../../components/Home/ServiceCard';
import { MOCK_FEATURED_SERVICES } from '../../components/Home/FeaturedServices';
import EventHubHeader from '../../components/Services/EventHubHeader';
import EventTypeHub from '../../components/Services/EventTypeHub';
import { useUrlFilters } from '../../hooks/useUrlFilters';

// ─────────────────────────────────────────────────────────────
//  Mock data — 8 services (full set from FeaturedServices)
//  Step 3.4 will replace this with URL-driven + real API data.
// ─────────────────────────────────────────────────────────────
const MOCK_SERVICES = MOCK_FEATURED_SERVICES;

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended'        },
  { value: 'price_asc',   label: 'Price: Low to High' },
  { value: 'price_desc',  label: 'Price: High to Low' },
  { value: 'rating',      label: 'Highest Rated'       },
  { value: 'newest',      label: 'Newest'              },
];

// How many cards to show initially and per "Load More" click
const PAGE_SIZE = 6;

// ─────────────────────────────────────────────────────────────
//  SkeletonCard — matches grid OR list layout
// ─────────────────────────────────────────────────────────────
function SkeletonCard({ viewMode }) {
  if (viewMode === 'list') {
    return (
      <div className="flex flex-col sm:flex-row w-full bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
        {/* Image placeholder */}
        <div className="w-full sm:w-[240px] lg:w-[280px] h-48 sm:h-auto shrink-0 bg-gray-200" />
        {/* Content placeholder */}
        <div className="flex-1 p-5 lg:p-6 flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between gap-4">
              <div className="h-5 bg-gray-200 rounded-lg flex-1" />
              <div className="h-8 w-20 bg-gray-100 rounded-xl shrink-0" />
            </div>
            <div className="h-3.5 bg-gray-100 rounded w-1/3" />
            <div className="h-3.5 bg-gray-100 rounded w-1/4" />
            <div className="h-3 bg-gray-100 rounded w-2/5" />
          </div>
          <div className="h-px bg-gray-100" />
          <div className="flex items-center justify-between">
            <div className="h-7 w-32 bg-gray-200 rounded-lg" />
            <div className="h-10 w-28 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Grid skeleton
  return (
    <div className="w-full bg-white rounded-2xl overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-4 flex flex-col gap-3">
        <div className="h-4 bg-gray-200 rounded-lg w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-1/3" />
        <div className="h-px bg-gray-100" />
        <div className="flex items-center justify-between">
          <div className="h-3 bg-gray-100 rounded w-20" />
          <div className="h-5 bg-gray-200 rounded w-16" />
        </div>
        <div className="h-9 bg-gray-200 rounded-xl mt-1" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  EmptyState — shown when no services match filters
// ─────────────────────────────────────────────────────────────
function EmptyState({ onClear }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6">
      {/* Icon */}
      <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mb-6">
        <SearchX size={36} className="text-gray-300" aria-hidden="true" />
      </div>

      <h3 className="text-xl font-extrabold text-[var(--color-dark)] mb-2">
        No services found
      </h3>
      <p className="text-sm text-gray-400 max-w-xs leading-relaxed mb-8">
        No services match your current filters. Try adjusting your search or clearing all filters to see more results.
      </p>

      <button
        type="button"
        onClick={onClear}
        className={[
          'inline-flex items-center gap-2',
          'px-6 py-3 rounded-xl text-sm font-bold',
          'text-white bg-[var(--color-gold)] hover:bg-[var(--color-gold-dark)]',
          'shadow-[0_4px_14px_rgba(201,162,77,0.28)]',
          'hover:shadow-[0_6px_20px_rgba(201,162,77,0.42)]',
          'transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] focus-visible:ring-offset-2',
        ].join(' ')}
      >
        <RefreshCw size={15} aria-hidden="true" />
        Clear Filters
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  MobileFilterDrawer — slide-up drawer for mobile
// ─────────────────────────────────────────────────────────────
function MobileFilterDrawer({ isOpen, onClose, filters, onChange, onClear }) {
  if (!isOpen) return null;
  return (
    <div
      id="mobile-filter-drawer"
      className="fixed inset-0 z-[300] flex flex-col justify-end md:hidden"
      aria-modal="true"
      role="dialog"
      aria-label="Filter options"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative z-10 bg-white rounded-t-3xl max-h-[88vh] flex flex-col shadow-[0_-8px_40px_rgba(0,0,0,0.15)]">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1" aria-hidden="true">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          <FilterSidebar
            filters={filters}
            onChange={onChange}
            onClear={onClear}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  AllServicesSection — the two-column sidebar + results grid
//  Extracted so the Services root can compose EventTypeHub above it.
// ─────────────────────────────────────────────────────────────
// FIX 2: Wrap in React.memo so filter prop changes don't remount this component
const AllServicesSection = React.memo(function AllServicesSection({
  isLoading, services, viewMode, setViewMode,
  sortBy, setSortBy, filters, handleFilterChange,
  handleClear, drawerOpen, setDrawerOpen,
  visibleN, setVisibleN, activeCount,
  sidebarOpen, setSidebarOpen,
}) {
  // FIX 1: sidebarOpen now comes from parent — no local state here

  const totalCount   = services.length;
  const visibleCards = services.slice(0, visibleN);
  const hasMore      = visibleN < totalCount;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── TWO-COLUMN LAYOUT ────────────────────────────── */}
      <div className="flex gap-6 items-start">

        {/* ── LEFT COLUMN — Desktop sidebar with floating tab ── */}
        <div
          key="sidebar-wrapper"
          className="hidden md:block relative shrink-0"
          style={{
            width:      sidebarOpen ? '260px' : '0px',
            transition: 'width 300ms cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          {/* Floating toggle tab — always visible, sticks to right edge */}
          <button
            type="button"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label={sidebarOpen ? 'Hide filters' : 'Show filters'}
            style={{
              position:       'absolute',
              top:            '12px',
              right:          '-36px',
              zIndex:         20,
              width:          '32px',
              height:         '64px',
              borderRadius:   '0 12px 12px 0',
              background:     'white',
              border:         '1px solid #e5e7eb',
              borderLeft:     'none',
              cursor:         'pointer',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              boxShadow:      '2px 0 8px rgba(0,0,0,0.08)',
              transition:     'background 200ms ease',
              color:          'var(--color-gold)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#fdfaf5'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; }}
          >
            {/* Arrow — points left (open) or right (closed) */}
            <svg
              width="14" height="14" viewBox="0 0 14 14" fill="none"
              aria-hidden="true"
              style={{
                transform:  sidebarOpen ? 'rotate(0deg)' : 'rotate(180deg)',
                transition: 'transform 300ms ease',
              }}
            >
              <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Sidebar panel */}
          <aside
            className={[
              'flex flex-col',
              'sticky top-[72px]',
              'h-[calc(100vh-90px)] overflow-hidden',
              'rounded-2xl border border-gray-100',
              'bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)]',
              'transition-[width,opacity] duration-300',
              sidebarOpen
                ? 'w-full opacity-100'
                : 'w-0 opacity-0 border-0 shadow-none pointer-events-none',
            ].join(' ')}
            aria-label="Filters panel"
            aria-hidden={!sidebarOpen}
          >
            <FilterSidebar
              key="stable-filter-sidebar"
              filters={filters}
              onChange={handleFilterChange}
              onClear={handleClear}
            />
          </aside>
        </div>

        {/* ── RIGHT COLUMN — Sort bar + Results ──────────── */}
        <main className="flex-1 min-w-0" aria-label="Services results">

          {/* ── SORT / CONTROL BAR ─────────────────────── */}
          <div
            className={[
              'flex flex-col sm:flex-row sm:items-center justify-between',
              'gap-3 mb-6',
              'p-4 rounded-2xl bg-white border border-gray-100',
              'shadow-[0_1px_8px_rgba(0,0,0,0.04)]',
            ].join(' ')}
          >
            {/* Left: mobile Filters button + result count */}
            <div className="flex items-center gap-3">
              {/* Mobile Filters button */}
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className={[
                  'md:hidden relative inline-flex items-center gap-2',
                  'px-3.5 py-2 rounded-xl text-sm font-semibold',
                  'border-2 border-[var(--color-gold)] text-[var(--color-gold)]',
                  'hover:bg-[var(--color-gold)] hover:text-white',
                  'transition-all duration-200',
                ].join(' ')}
                aria-label="Open filters"
                aria-expanded={drawerOpen}
                aria-controls="mobile-filter-drawer"
              >
                <SlidersHorizontal size={15} aria-hidden="true" />
                Filters
                {activeCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[var(--color-gold)] text-white text-[9px] font-black flex items-center justify-center">
                    {activeCount}
                  </span>
                )}
              </button>

              {/* Result count */}
              <p className="text-sm font-medium text-gray-500">
                {isLoading ? (
                  <span className="inline-block h-4 w-32 bg-gray-200 rounded animate-pulse" />
                ) : (
                  <>
                    Showing{' '}
                    <span className="font-extrabold text-[var(--color-dark)]">
                      {Math.min(visibleN, totalCount)}
                    </span>
                    {' '}of{' '}
                    <span className="font-extrabold text-[var(--color-dark)]">
                      {totalCount}
                    </span>{' '}
                    results
                  </>
                )}
              </p>
            </div>

            {/* Right: view toggle + sort */}
            <div className="flex items-center gap-3">

              {/* View toggle */}
              <div
                className="hidden sm:flex items-center bg-gray-100 rounded-xl p-1 gap-0.5"
                role="group"
                aria-label="View mode"
              >
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={[
                    'p-2 rounded-lg transition-all duration-150',
                    viewMode === 'grid'
                      ? 'bg-white text-[var(--color-gold)] shadow-sm'
                      : 'text-gray-400 hover:text-gray-600',
                  ].join(' ')}
                  aria-label="Grid view"
                  aria-pressed={viewMode === 'grid'}
                >
                  <LayoutGrid size={16} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={[
                    'p-2 rounded-lg transition-all duration-150',
                    viewMode === 'list'
                      ? 'bg-white text-[var(--color-gold)] shadow-sm'
                      : 'text-gray-400 hover:text-gray-600',
                  ].join(' ')}
                  aria-label="List view"
                  aria-pressed={viewMode === 'list'}
                >
                  <List size={16} aria-hidden="true" />
                </button>
              </div>

              {/* Sort dropdown */}
              <div className="relative">
                <select
                  id="sort-by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort results by"
                  className={[
                    'appearance-none rounded-xl border border-gray-200 bg-white',
                    'pl-3.5 pr-8 py-2 text-sm font-semibold text-[var(--color-dark)]',
                    'outline-none cursor-pointer',
                    'focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/20',
                    'transition-all',
                  ].join(' ')}
                >
                  {SORT_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <ChevronDown
                  size={13}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════
              SKELETON LOADER — 6 ghost cards while loading
          ══════════════════════════════════════════════ */}
          {isLoading && (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
                  : 'flex flex-col gap-4'
              }
              aria-busy="true"
              aria-label="Loading services"
            >
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <SkeletonCard key={i} viewMode={viewMode} />
              ))}
            </div>
          )}

          {/* ══════════════════════════════════════════════
              EMPTY STATE — no results after loading
          ══════════════════════════════════════════════ */}
          {!isLoading && totalCount === 0 && (
            <EmptyState onClear={handleClear} />
          )}

          {/* ══════════════════════════════════════════════
              RESULTS — grid or list
          ══════════════════════════════════════════════ */}
          {!isLoading && totalCount > 0 && (
            <>
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
                    : 'flex flex-col gap-4'
                }
                role="list"
                aria-label="Service results"
              >
                {visibleCards.map((service) => (
                  <div key={service.id} role="listitem" className="h-full flex">
                    <ServiceCard service={service} viewMode={viewMode} className="flex-1" />
                  </div>
                ))}
              </div>

              {/* ── LOAD MORE button ─────────────────────── */}
              {hasMore ? (
                <div className="flex justify-center mt-10">
                  <button
                    type="button"
                    onClick={() => setVisibleN((n) => n + PAGE_SIZE)}
                    className={[
                      'inline-flex items-center gap-2.5',
                      'px-8 py-3.5 rounded-2xl text-sm font-bold',
                      'border-2 border-[var(--color-gold)] text-[var(--color-gold)]',
                      'hover:bg-[var(--color-gold)] hover:text-white',
                      'transition-all duration-200',
                      'shadow-[0_2px_12px_rgba(201,162,77,0.15)]',
                      'hover:shadow-[0_4px_20px_rgba(201,162,77,0.30)]',
                      'focus-visible:outline-none focus-visible:ring-2',
                      'focus-visible:ring-[var(--color-gold)] focus-visible:ring-offset-2',
                    ].join(' ')}
                  >
                    Load More Services
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-gold)]/10 text-xs font-black">
                      +{totalCount - visibleN}
                    </span>
                  </button>
                </div>
              ) : (
                /* All loaded — end of results indicator */
                <div className="flex flex-col items-center mt-10 gap-2">
                  <div className="flex items-center gap-3 text-xs text-gray-300">
                    <div className="h-px w-16 bg-gray-200" aria-hidden="true" />
                    <span className="font-semibold tracking-wide uppercase">
                      All {totalCount} results shown
                    </span>
                    <div className="h-px w-16 bg-gray-200" aria-hidden="true" />
                  </div>
                </div>
              )}
            </>
          )}

        </main>
      </div>
    </div>
  );
}); // end React.memo(AllServicesSection)

// ─────────────────────────────────────────────────────────────
//  Services — Phase 1, Steps 3.1–3.3
//
//  State:
//    isLoading : bool    — 1.5s mock delay on mount
//    services  : array   — mock data (Step 3.4 replaces with API)
//    viewMode  : string  — 'grid' | 'list'
//    sortBy    : string  — selected sort option
//    filters   : object  — sidebar filter state
//    visibleN  : number  — how many cards to show (Load More)
//    drawerOpen: bool    — mobile drawer
// ─────────────────────────────────────────────────────────────
function Services() {
  // ── Core state ────────────────────────────────────────────
  const [isLoading,   setIsLoading]   = useState(true);
  const [services,    setServices]    = useState([]);
  const [viewMode,    setViewMode]    = useState('grid');
  const [sortBy,      setSortBy]      = useState('recommended');
  const [drawerOpen,  setDrawerOpen]  = useState(false);
  const [visibleN,    setVisibleN]    = useState(PAGE_SIZE);

  // FIX 1: sidebarOpen lifted to page level so filter changes never reset it
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ── Filter state — single source of truth for both
  //    desktop sidebar and mobile drawer ──────────────────────
  const { filters, updateFilter, clearFilters } = useUrlFilters();

  // ── Simulate API fetch (1.5s) ────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      setServices(MOCK_SERVICES);
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  // ── Scroll to #all-services on mount if hash is present ──
  useEffect(() => {
    if (window.location.hash === '#all-services') {
      const el = document.getElementById('all-services');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // ── Filter handlers ───────────────────────────────────────
  const handleFilterChange = useCallback((field, value) => {
    updateFilter(field, value);
    setVisibleN(PAGE_SIZE);
  }, [updateFilter]);

  const handleApply = useCallback(() => {
    setVisibleN(PAGE_SIZE);   // reset pagination on new filter
    setDrawerOpen(false);
  }, []);

  const handleClear = useCallback(() => {
    clearFilters();
    setVisibleN(PAGE_SIZE);
  }, [clearFilters]);

  // ── Derived values ────────────────────────────────────────
  const activeCount = [
    filters.keyword,
    filters.eventType,
    filters.categories.length > 0,
    filters.subcategory,
    filters.minPrice > 0 || filters.maxPrice < 5000,
    filters.cities.length > 0,
    filters.rating > 0,
    filters.date,
  ].filter(Boolean).length;

  // ─────────────────────────────────────────────────────────
  //  Render
  // ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[var(--color-surface)]">

      {/* ══════════════════════════════════════════════════════
          PAGE HEADER
      ══════════════════════════════════════════════════════ */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <nav
            className="flex items-center gap-1.5 text-xs text-gray-400 mb-2"
            aria-label="Breadcrumb"
          >
            <a href="/home" className="hover:text-[var(--color-gold)] transition-colors">Home</a>
            <span aria-hidden="true">/</span>
            <span className="text-[var(--color-dark)] font-semibold">Services</span>
          </nav>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-dark)] leading-tight">
            Find Your Perfect{' '}
            <span className="text-gradient-gold">Service</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Browse 500+ verified vendors — venues, catering, photography and more.
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          EVENT HUB HEADER — replaces old tab strip
      ══════════════════════════════════════════════════════ */}
      <EventHubHeader
        activeType={filters.eventType}
        onTypeChange={(val) => handleFilterChange('eventType', val)}
      />

      {/* ══════════════════════════════════════════════════════
          EVENT TYPE HUB — immersive event-type picker
      ══════════════════════════════════════════════════════ */}
      <EventTypeHub />

      {/* ══════════════════════════════════════════════════════
          SEPARATOR — scroll target for back-link from EventTypePage
      ══════════════════════════════════════════════════════ */}
      <div
        id="all-services"
        className="flex items-center gap-4 my-10 px-4 sm:px-6 lg:px-8"
      >
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
          Or browse all services
        </span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      {/* ══════════════════════════════════════════════════════
          ALL SERVICES SECTION — sidebar + results grid
      ══════════════════════════════════════════════════════ */}
      <AllServicesSection
        isLoading={isLoading}
        services={services}
        viewMode={viewMode}
        setViewMode={setViewMode}
        sortBy={sortBy}
        setSortBy={setSortBy}
        filters={filters}
        handleFilterChange={handleFilterChange}
        handleClear={handleClear}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        visibleN={visibleN}
        setVisibleN={setVisibleN}
        activeCount={activeCount}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* ── MOBILE FILTER DRAWER ─────────────────────────────── */}
      <MobileFilterDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        onChange={handleFilterChange}
        onClear={handleClear}
      />
    </div>
  );
}

export default Services;
