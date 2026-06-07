import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  SlidersHorizontal, LayoutGrid, List,
  ChevronDown, SearchX, RefreshCw,
} from 'lucide-react';

import FilterSidebar from '../../components/Services/FilterSidebar';
import EmptyState from '../../components/shared/EmptyState';
import PageTransition from '../../components/shared/PageTransition';
import ServiceCard from '../../components/Home/ServiceCard';
import EventHubHeader from '../../components/Services/EventHubHeader';
import EventTypeHub from '../../components/Services/EventTypeHub';
import { useUrlFilters } from '../../hooks/useUrlFilters';
import { useDebounce } from '../../hooks/useDebounce';
import { getServices } from '../../services/services.service';

// ─────────────────────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended'        },
  { value: 'price_asc',   label: 'Price: Low to High' },
  { value: 'price_desc',  label: 'Price: High to Low' },
  { value: 'rating',      label: 'Highest Rated'       },
  { value: 'newest',      label: 'Newest'              },
];

// How many cards per page
const PAGE_LIMIT = 12;

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
//  Pagination component
// ─────────────────────────────────────────────────────────────
function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  const btnBase = [
    'inline-flex items-center justify-center',
    'w-9 h-9 rounded-xl text-sm font-bold',
    'border transition-all duration-200',
  ].join(' ');

  return (
    <div className="flex items-center justify-center gap-1.5 mt-10">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${btnBase} border-gray-200 bg-white text-gray-600 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] disabled:opacity-40 disabled:cursor-not-allowed`}
        aria-label="Previous page"
      >
        ‹
      </button>

      {start > 1 && (
        <>
          <button type="button" onClick={() => onPageChange(1)} className={`${btnBase} border-gray-200 bg-white text-gray-600 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]`}>1</button>
          {start > 2 && <span className="text-gray-400 text-sm font-bold px-1">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          className={[
            btnBase,
            p === currentPage
              ? 'border-[var(--color-gold)] bg-[var(--color-gold)] text-white shadow-[0_4px_14px_rgba(201,162,77,0.3)]'
              : 'border-gray-200 bg-white text-gray-600 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]',
          ].join(' ')}
          aria-current={p === currentPage ? 'page' : undefined}
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="text-gray-400 text-sm font-bold px-1">…</span>}
          <button type="button" onClick={() => onPageChange(totalPages)} className={`${btnBase} border-gray-200 bg-white text-gray-600 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]`}>{totalPages}</button>
        </>
      )}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${btnBase} border-gray-200 bg-white text-gray-600 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] disabled:opacity-40 disabled:cursor-not-allowed`}
        aria-label="Next page"
      >
        ›
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  AllServicesSection — the two-column sidebar + results grid
//  Extracted so the Services root can compose EventTypeHub above it.
// ─────────────────────────────────────────────────────────────
const AllServicesSection = React.memo(function AllServicesSection({
  filters, sortBy, setSortBy,
  handleFilterChange, handleClear,
  viewMode, setViewMode,
  drawerOpen, setDrawerOpen,
  activeCount, sidebarOpen, setSidebarOpen,
}) {
  // Build the query params object that drives fetching
  // sortBy is managed separately and merged here
  const queryFilters = { ...filters, sort: sortBy, limit: PAGE_LIMIT };

  // Debounce text/price inputs to avoid API call per keystroke
  const debouncedKeyword  = useDebounce(queryFilters.keyword,  400);
  const debouncedMinPrice = useDebounce(queryFilters.minPrice, 600);
  const debouncedMaxPrice = useDebounce(queryFilters.maxPrice, 600);

  // Stable query key — only the debounced values trigger a refetch
  const stableFilters = {
    ...queryFilters,
    keyword:  debouncedKeyword,
    minPrice: debouncedMinPrice,
    maxPrice: debouncedMaxPrice,
  };

  // React Query v5 syntax
  const {
    data,
    isLoading,
    isFetching,
    isError,
  } = useQuery({
    queryKey:  ['services', stableFilters],
    queryFn:   () => getServices(stableFilters),
    placeholderData: (prev) => prev,   // v5: smooth pagination (keeps previous data visible)
    staleTime: 1000 * 60 * 2,         // 2 min fresh
  });

  const services   = data?.services   ?? [];
  const pagination = data?.pagination  ?? {};
  const totalCount = pagination.total  ?? 0;

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
                  'md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
                  'inline-flex items-center justify-center gap-2',
                  'min-h-[44px] min-w-[120px] px-6 py-3 rounded-full',
                  'bg-[var(--color-gold)] text-white shadow-[0_4px_14px_rgba(201,162,77,0.4)]',
                  'hover:bg-[var(--color-gold-dark)] transition-all duration-200 text-sm font-bold',
                ].join(' ')}
                aria-label="Open filters"
                aria-expanded={drawerOpen}
                aria-controls="mobile-filter-drawer"
              >
                🔍 Filters
                {activeCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white">
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
                      {services.length}
                    </span>
                    {' '}of{' '}
                    <span className="font-extrabold text-[var(--color-dark)]">
                      {totalCount}
                    </span>{' '}
                    results
                    {isFetching && !isLoading && (
                      <span className="ml-2 inline-block w-3.5 h-3.5 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin align-middle" aria-label="Refreshing" />
                    )}
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
              SKELETON LOADER — while loading
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
              {Array.from({ length: PAGE_LIMIT }).map((_, i) => (
                <SkeletonCard key={i} viewMode={viewMode} />
              ))}
            </div>
          )}

          {/* ══════════════════════════════════════════════
              ERROR STATE
          ══════════════════════════════════════════════ */}
          {!isLoading && isError && (
            <div className="flex flex-col items-center justify-center text-center py-20 px-6">
              <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center mb-6">
                <SearchX size={36} className="text-red-300" />
              </div>
              <h3 className="text-xl font-extrabold text-[var(--color-dark)] mb-2">
                Couldn't load services
              </h3>
              <p className="text-sm text-gray-400 max-w-xs leading-relaxed mb-8">
                There was a problem connecting to the server. Please check your connection and try again.
              </p>
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-[var(--color-gold)] hover:bg-[var(--color-gold-dark)] shadow-[0_4px_14px_rgba(201,162,77,0.28)] transition-all duration-200"
              >
                <RefreshCw size={15} /> Try Again
              </button>
            </div>
          )}

          {/* ══════════════════════════════════════════════
              EMPTY STATE — no results after loading
          ══════════════════════════════════════════════ */}
          {!isLoading && !isError && services.length === 0 && (
            <EmptyState variant="no-results" onAction={handleClear} />
          )}

          {/* ══════════════════════════════════════════════
              RESULTS — grid or list
          ══════════════════════════════════════════════ */}
          {!isLoading && !isError && services.length > 0 && (
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
                {services.map((service, index) => (
                  <div key={service.service_id} role="listitem" className="h-full flex card-stagger" style={{ animationDelay: `${index * 60}ms` }}>
                    <ServiceCard service={service} viewMode={viewMode} className="flex-1" />
                  </div>
                ))}
              </div>

              {/* ── PAGINATION ─────────────────────────────── */}
              <Pagination
                currentPage={filters.page ?? 1}
                totalPages={pagination.totalPages ?? 1}
                onPageChange={(p) => handleFilterChange('page', p)}
              />
            </>
          )}

        </main>
      </div>
    </div>
  );
}); // end React.memo(AllServicesSection)

// ─────────────────────────────────────────────────────────────
//  Services — Step 2.5.1
//
//  State:
//    filters   : object  — sidebar filter state (from useUrlFilters)
//    viewMode  : string  — 'grid' | 'list'
//    sortBy    : string  — selected sort option (separate from filters
//                          so changing sort doesn't reset page)
//    drawerOpen: bool    — mobile drawer
//    sidebarOpen: bool   — desktop sidebar (lifted so filter changes
//                          don't collapse it)
// ─────────────────────────────────────────────────────────────
function Services() {
  // ── Core state ────────────────────────────────────────────
  const [viewMode,    setViewMode]    = useState('grid');
  const [sortBy,      setSortBy]      = useState('recommended');
  const [drawerOpen,  setDrawerOpen]  = useState(false);

  // FIX: sidebarOpen lifted to page level so filter changes never reset it
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ── Filter state — single source of truth for both
  //    desktop sidebar and mobile drawer ──────────────────────
  const { filters, updateFilter, clearFilters } = useUrlFilters();

  // ── Filter handlers ───────────────────────────────────────
  // Reset page to 1 when any filter other than page changes
  const handleFilterChange = useCallback((field, value) => {
    updateFilter(field, value);
    if (field !== 'page') {
      updateFilter('page', 1);
    }
  }, [updateFilter]);

  const handleClear = useCallback(() => {
    clearFilters();
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
    <PageTransition className="min-h-screen bg-[var(--color-surface)]">

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
        filters={filters}
        sortBy={sortBy}
        setSortBy={setSortBy}
        handleFilterChange={handleFilterChange}
        handleClear={handleClear}
        viewMode={viewMode}
        setViewMode={setViewMode}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
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
    </PageTransition>
  );
}

export default Services;
