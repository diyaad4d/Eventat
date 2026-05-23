import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  SlidersHorizontal, LayoutGrid, List,
  ChevronDown, SearchX, RefreshCw, ArrowLeft,
} from 'lucide-react';

import { EVENT_TYPE_CONFIG } from '../../data/eventTypeConfig';
import FilterSidebar from '../../components/Services/FilterSidebar';
import ServiceCard from '../../components/Home/ServiceCard';
import { MOCK_FEATURED_SERVICES } from '../../components/Home/FeaturedServices';
import { useUrlFilters } from '../../hooks/useUrlFilters';

// ─────────────────────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────────────────────
const PAGE_SIZE = 6;

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended'        },
  { value: 'price_asc',   label: 'Price: Low to High' },
  { value: 'price_desc',  label: 'Price: High to Low' },
  { value: 'rating',      label: 'Highest Rated'       },
];

const CATEGORY_ICONS = {
  Venue:         '🏛️',
  Photography:   '📸',
  Catering:      '🍽️',
  Decoration:    '🎀',
  Entertainment: '🎵',
  Transport:     '🚗',
};

// ─────────────────────────────────────────────────────────────
//  SkeletonCard
// ─────────────────────────────────────────────────────────────
function SkeletonCard() {
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
//  EmptyState
// ─────────────────────────────────────────────────────────────
function EmptyState({ onClear }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6">
      <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mb-6">
        <SearchX size={36} className="text-gray-300" />
      </div>
      <h3 className="text-xl font-extrabold text-[var(--color-dark)] mb-2">No services found</h3>
      <p className="text-sm text-gray-400 max-w-xs leading-relaxed mb-8">
        No services match your current filters. Try adjusting your search or clearing all filters.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-[var(--color-gold)] hover:bg-[var(--color-gold-dark)] shadow-[0_4px_14px_rgba(201,162,77,0.28)] transition-all duration-200"
      >
        <RefreshCw size={15} />
        Clear Filters
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  MobileFilterDrawer
// ─────────────────────────────────────────────────────────────
function MobileFilterDrawer({ isOpen, onClose, filters, onChange, onClear, eventType }) {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-[300] flex flex-col justify-end md:hidden"
      aria-modal="true"
      role="dialog"
      aria-label="Filter options"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 bg-white rounded-t-3xl max-h-[88vh] flex flex-col shadow-[0_-8px_40px_rgba(0,0,0,0.15)]">
        <div className="flex justify-center pt-3 pb-1" aria-hidden="true">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          <FilterSidebar
            filters={filters}
            onChange={onChange}
            onClear={onClear}
            onClose={onClose}
            lockedEventType={eventType}
          />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  EventTypePage — /services/:eventType
//
//  Filters state is lifted here so HeroBanner category pills
//  and FilteredServicesSection share the same state.
// ─────────────────────────────────────────────────────────────
function EventTypePage() {
  const { eventType } = useParams();
  const navigate      = useNavigate();

  const cfg = EVENT_TYPE_CONFIG[eventType];

  // Unknown event type → redirect to /services
  useEffect(() => {
    if (!cfg) navigate('/services', { replace: true });
  }, [cfg, navigate]);

  // Lifted filters state — shared by HeroBanner pills + FilteredServicesSection
  const { filters, updateFilter, clearFilters } = useUrlFilters(eventType);

  // FIX 1: sidebarOpen lifted to page level so filter changes never reset it
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!cfg) return null;

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <HeroBanner cfg={cfg} eventType={eventType} updateFilter={updateFilter} />
      <ChecklistSection cfg={cfg} eventType={eventType} />
      <FilteredServicesSection
        cfg={cfg}
        eventType={eventType}
        filters={filters}
        updateFilter={updateFilter}
        clearFilters={clearFilters}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <RecommendationsStrip
        cfg={cfg}
        onCategorySelect={(cat) => {
          updateFilter('categories', [cat.toLowerCase()]);
          setTimeout(() => {
            document.getElementById('filtered-services')?.scrollIntoView({ behavior: 'smooth' });
          }, 50);
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Section A — Hero Banner
//  Category pill clicks apply filter + smooth-scroll to results
// ─────────────────────────────────────────────────────────────
function HeroBanner({ cfg, eventType, updateFilter }) {
  return (
    <>
      {/* Float keyframes */}
      <style>{`
        @keyframes etp-float {
          0%, 100% { transform: translateY(0);    }
          50%       { transform: translateY(-8px); }
        }
        .etp-float { animation: etp-float 3s ease-in-out infinite; }
      `}</style>

      <section
        aria-label={`${cfg.label} hero`}
        style={{
          position:   'relative',
          height:     '380px',
          overflow:   'hidden',
          background: cfg.darkBg,
        }}
      >
        {/* Background image */}
        <img
          src={cfg.image}
          alt=""
          aria-hidden="true"
          style={{
            position:       'absolute',
            inset:          0,
            width:          '100%',
            height:         '100%',
            objectFit:      'cover',
            objectPosition: 'center',
          }}
        />

        {/* Gradient overlay */}
        <div
          aria-hidden="true"
          style={{
            position:   'absolute',
            inset:      0,
            background: `linear-gradient(160deg, ${cfg.darkBg}cc 0%, ${cfg.darkBg}e8 55%, ${cfg.darkBg}f8 100%)`,
          }}
        />

        {/* Content */}
        <div
          style={{
            position:      'relative',
            zIndex:        1,
            height:        '100%',
            display:       'flex',
            flexDirection: 'column',
            padding:       '1.5rem 2rem',
            maxWidth:      '1280px',
            margin:        '0 auto',
          }}
        >
          {/* ← Back link */}
          <Link
            to="/services#all-services"
            style={{
              display:        'inline-flex',
              alignItems:     'center',
              gap:            '0.375rem',
              color:          'rgba(255,255,255,0.75)',
              fontSize:       '0.8125rem',
              fontWeight:     600,
              textDecoration: 'none',
              marginBottom:   '0.5rem',
              width:          'fit-content',
              transition:     'color 200ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; }}
          >
            <ArrowLeft size={14} aria-hidden="true" />
            All Services
          </Link>

          {/* Main content */}
          <div
            style={{
              flex:           1,
              display:        'flex',
              flexDirection:  'column',
              justifyContent: 'center',
              gap:            '0.75rem',
            }}
          >
            {/* Floating emoji */}
            <div className="etp-float" style={{ fontSize: '3.5rem', lineHeight: 1 }} aria-hidden="true">
              {cfg.emoji}
            </div>

            {/* Headline */}
            <h1
              style={{
                margin:        0,
                fontSize:      'clamp(1.75rem, 4.5vw, 2.625rem)',
                fontWeight:    800,
                color:         '#ffffff',
                lineHeight:    1.15,
                letterSpacing: '-0.02em',
                maxWidth:      '640px',
                textShadow:    '0 2px 16px rgba(0,0,0,0.3)',
              }}
            >
              {cfg.headline}
            </h1>

            {/* Subline */}
            <p
              style={{
                margin:     0,
                fontSize:   'clamp(0.875rem, 1.8vw, 1rem)',
                color:      'rgba(255,255,255,0.72)',
                maxWidth:   '520px',
                lineHeight: 1.6,
              }}
            >
              {cfg.subline}
            </p>

            {/* Category pills — click to filter + scroll */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
              {cfg.recommendations.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    updateFilter('categories', [cat.toLowerCase()]);
                    setTimeout(() => {
                      document.getElementById('filtered-services')?.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                  }}
                  style={{
                    display:        'inline-flex',
                    alignItems:     'center',
                    gap:            '0.375rem',
                    padding:        '0.375rem 0.875rem',
                    borderRadius:   '9999px',
                    background:     'rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(8px)',
                    border:         '1px solid rgba(255,255,255,0.22)',
                    color:          '#ffffff',
                    fontSize:       '0.8125rem',
                    fontWeight:     600,
                    cursor:         'pointer',
                    transition:     'background 200ms ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.22)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
                >
                  <span aria-hidden="true">{CATEGORY_ICONS[cat] ?? '✨'}</span>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Accent bottom line */}
        <div
          aria-hidden="true"
          style={{
            position:   'absolute',
            bottom:     0,
            left:       0,
            right:      0,
            height:     '2px',
            background: `linear-gradient(to right, transparent, ${cfg.color}99, transparent)`,
          }}
        />
      </section>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
//  Section B — Checklist
//  FIX 4: Full rebuild — collapsible, add/edit/delete, localStorage
// ─────────────────────────────────────────────────────────────
function ChecklistSection({ cfg, eventType }) {
  const itemsKey   = `eventat-checklist-items-${eventType}`;
  const checkedKey = `eventat-checklist-checked-${eventType}`;

  // ── Editable items list ──────────────────────────────────
  const [items, setItems] = useState(() => {
    try {
      const s = localStorage.getItem(itemsKey);
      return s ? JSON.parse(s) : cfg.checklist;
    } catch { return cfg.checklist; }
  });

  // ── Checked state ────────────────────────────────────────
  const [checked, setChecked] = useState(() => {
    try {
      const s = localStorage.getItem(checkedKey);
      return s ? JSON.parse(s) : {};
    } catch { return {}; }
  });

  // ── Collapse state ───────────────────────────────────────
  const [expanded, setExpanded] = useState(true);

  // ── Editing state ────────────────────────────────────────
  const [editingIdx, setEditingIdx] = useState(null);
  const [hoveredIdx, setHoveredIdx] = useState(null);   // eslint-disable-line no-unused-vars

  // ── Persist items ────────────────────────────────────────
  useEffect(() => {
    try { localStorage.setItem(itemsKey, JSON.stringify(items)); }
    catch {}
  }, [items, itemsKey]);

  // ── Persist checked ──────────────────────────────────────
  useEffect(() => {
    try { localStorage.setItem(checkedKey, JSON.stringify(checked)); }
    catch {}
  }, [checked, checkedKey]);

  const toggleCheck = (idx) =>
    setChecked((prev) => ({ ...prev, [idx]: !prev[idx] }));

  const deleteItem = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
    setChecked((prev) => {
      const next = {};
      Object.entries(prev).forEach(([k, v]) => {
        const ki = Number(k);
        if (ki < idx)      next[ki]     = v;
        else if (ki > idx) next[ki - 1] = v;
      });
      return next;
    });
  };

  const saveEdit = (idx, newText) => {
    if (newText.trim()) {
      setItems((prev) => prev.map((it, i) => i === idx ? { ...it, text: newText.trim() } : it));
    }
    setEditingIdx(null);
  };

  const addItem = () => {
    const newIdx = items.length;
    setItems((prev) => [...prev, { icon: '✨', text: '' }]);
    setTimeout(() => setEditingIdx(newIdx), 60);
  };

  const completedCount = items.filter((_, i) => checked[i]).length;
  const totalCount     = items.length;
  const progressPct    = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <>
      <style>{`
        @keyframes cl-fadein {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cl-item    { animation: cl-fadein 250ms ease both; }
        .cl-actions { opacity: 0; transition: opacity 150ms ease; }
        .cl-row:hover .cl-actions { opacity: 1; }
      `}</style>

      <section
        aria-label="Planning checklist"
        style={{
          background:   'linear-gradient(135deg, #FDF6EC 0%, #FFF9F0 60%, #FEFCF8 100%)',
          borderTop:    '2px solid #E8C97A',
          borderBottom: '2px solid #E8C97A',
          position:     'relative',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 2rem 1rem' }}>

          {/* ── HEADING ── */}
          <div style={{ marginBottom: '1.25rem' }}>
            <p style={{
              fontSize:      '0.6875rem',
              fontWeight:    700,
              color:         'var(--color-gold)',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              marginBottom:  '0.25rem',
            }}>
              Planning guide
            </p>
            <h2 style={{
              margin:     0,
              fontSize:   'clamp(1.25rem, 3vw, 1.625rem)',
              fontWeight: 800,
              color:      'var(--color-dark)',
            }}>
              Your {cfg.label} Checklist
            </h2>
          </div>

          {/* ── PROGRESS BAR ── */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#6b7280' }}>
                {completedCount} of {totalCount} completed
              </span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-gold)' }}>
                {Math.round(progressPct)}%
              </span>
            </div>
            <div style={{ height: '7px', background: '#e5e7eb', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{
                height:       '100%',
                width:        `${progressPct}%`,
                background:   'linear-gradient(90deg, #E8C97A, #C9A24D)',
                borderRadius: '9999px',
                transition:   'width 500ms ease',
              }} />
            </div>
          </div>

          {/* ── ANIMATED BODY ── */}
          <div style={{
            overflow:   'hidden',
            maxHeight:  expanded ? '2000px' : '0px',
            transition: 'max-height 450ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            {/* Checklist grid */}
            <div style={{
              display:             'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap:                 '0.625rem',
              paddingBottom:       '1rem',
            }}>
              {items.map((item, idx) => {
                const isChecked = !!checked[idx];
                const isEditing = editingIdx === idx;
                return (
                  <div
                    key={idx}
                    className="cl-item cl-row"
                    onClick={() => toggleCheck(idx)}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    style={{
                      display:    'flex',
                      alignItems: 'center',
                      gap:        '0.75rem',
                      padding:    '0.875rem 1rem',
                      borderRadius: '14px',
                      background: isChecked ? '#fff8ec' : '#ffffff',
                      border:     isChecked ? '1.5px solid #E8C97A' : '1.5px solid #f3f4f6',
                      transition: 'all 200ms ease',
                      opacity:    isChecked ? 0.75 : 1,
                      position:   'relative',
                      boxShadow:  '0 1px 4px rgba(0,0,0,0.04)',
                      cursor:     'pointer',
                    }}
                  >
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggleCheck(idx); }}
                      aria-pressed={isChecked}
                      aria-label={isChecked ? 'Mark incomplete' : 'Mark complete'}
                      style={{
                        flexShrink:     0,
                        width:          '22px',
                        height:         '22px',
                        borderRadius:   '50%',
                        cursor:         'pointer',
                        display:        'flex',
                        alignItems:     'center',
                        justifyContent: 'center',
                        background:     isChecked ? 'var(--color-gold)' : 'white',
                        border:         isChecked ? '2px solid var(--color-gold)' : '2px solid #d1d5db',
                        color:          '#fff',
                        fontSize:       '0.7rem',
                        fontWeight:     900,
                        transition:     'all 200ms ease',
                      }}
                    >
                      {isChecked && '✓'}
                    </button>

                    {/* Icon */}
                    <span style={{ fontSize: '1.2rem', flexShrink: 0 }} aria-hidden="true">
                      {item.icon}
                    </span>

                    {/* Text or edit input */}
                    {isEditing ? (
                      <input
                        autoFocus
                        type="text"
                        defaultValue={item.text}
                        placeholder="Type item..."
                        onClick={(e) => e.stopPropagation()}
                        onBlur={(e) => saveEdit(idx, e.target.value || item.text)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter')  e.target.blur();
                          if (e.key === 'Escape') setEditingIdx(null);
                        }}
                        style={{
                          flex:         1,
                          fontSize:     '0.875rem',
                          fontWeight:   600,
                          border:       '1.5px solid var(--color-gold)',
                          borderRadius: '8px',
                          padding:      '0.2rem 0.5rem',
                          outline:      'none',
                          background:   'white',
                          color:        'var(--color-dark)',
                        }}
                      />
                    ) : (
                      <span style={{
                        flex:           1,
                        fontSize:       '0.875rem',
                        fontWeight:     600,
                        color:          isChecked ? '#9ca3af' : 'var(--color-dark)',
                        textDecoration: isChecked ? 'line-through' : 'none',
                        transition:     'all 200ms ease',
                      }}>
                        {item.text || <em style={{ color: '#9ca3af' }}>Empty item</em>}
                      </span>
                    )}

                    {/* Edit + Delete — visible on row hover (CSS class) */}
                    {!isEditing && (
                      <div className="cl-actions" style={{ display: 'flex', gap: '0.125rem', flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setEditingIdx(idx); }}
                          title="Edit"
                          aria-label="Edit item"
                          style={{
                            width:          '28px',
                            height:         '28px',
                            borderRadius:   '8px',
                            border:         'none',
                            background:     'rgba(201,162,77,0.1)',
                            cursor:         'pointer',
                            display:        'flex',
                            alignItems:     'center',
                            justifyContent: 'center',
                            fontSize:       '0.8rem',
                            transition:     'background 150ms ease',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(201,162,77,0.2)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(201,162,77,0.1)'; }}
                        >✏️</button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); deleteItem(idx); }}
                          title="Delete"
                          aria-label="Delete item"
                          style={{
                            width:          '28px',
                            height:         '28px',
                            borderRadius:   '8px',
                            border:         'none',
                            background:     'rgba(239,68,68,0.08)',
                            cursor:         'pointer',
                            display:        'flex',
                            alignItems:     'center',
                            justifyContent: 'center',
                            fontSize:       '0.75rem',
                            color:          '#ef4444',
                            transition:     'background 150ms ease',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.18)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                        >✕</button>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add item button */}
              <button
                type="button"
                onClick={addItem}
                style={{
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  gap:            '0.5rem',
                  padding:        '0.875rem 1rem',
                  borderRadius:   '14px',
                  background:     'transparent',
                  border:         '1.5px dashed #E8C97A',
                  cursor:         'pointer',
                  color:          'var(--color-gold)',
                  fontSize:       '0.875rem',
                  fontWeight:     600,
                  transition:     'all 200ms ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(201,162,77,0.06)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ fontSize: '1.1rem' }}>+</span>
                Add item
              </button>
            </div>
          </div>
        </div>

        {/* ── COLLAPSE TOGGLE — centered at section bottom ── */}
        <div style={{
          display:        'flex',
          justifyContent: 'center',
          paddingBottom:  '1.25rem',
          marginTop:      expanded ? '-0.5rem' : '0.5rem',
        }}>
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            aria-label={expanded ? 'Collapse checklist' : 'Expand checklist'}
            style={{
              width:       '44px',
              height:      '44px',
              borderRadius: '50%',
              background:  'white',
              border:      '2px solid #E8C97A',
              cursor:      'pointer',
              display:     'flex',
              alignItems:  'center',
              justifyContent: 'center',
              boxShadow:   '0 4px 20px rgba(201,162,77,0.25)',
              transition:  'all 250ms cubic-bezier(0.4,0,0.2,1)',
              color:       'var(--color-gold)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background  = 'var(--color-gold)';
              e.currentTarget.style.color       = 'white';
              e.currentTarget.style.transform   = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background  = 'white';
              e.currentTarget.style.color       = 'var(--color-gold)';
              e.currentTarget.style.transform   = 'scale(1)';
            }}
          >
            <svg
              width="16" height="16" viewBox="0 0 16 16" fill="none"
              aria-hidden="true"
              style={{
                transform:  expanded ? 'rotate(0deg)' : 'rotate(180deg)',
                transition: 'transform 300ms ease',
              }}
            >
              <path
                d="M3 10L8 5L13 10"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </section>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
//  Section C — Filtered Services
//  FIX 2: floating tab sidebar toggle
// ─────────────────────────────────────────────────────────────
// FIX 2: Wrap in React.memo so filter prop changes don't remount this component
const FilteredServicesSection = React.memo(function FilteredServicesSection(
  { cfg, eventType, filters, updateFilter, clearFilters, sidebarOpen, setSidebarOpen }
) {
  const [isLoading,  setIsLoading]  = useState(true);
  const [services,   setServices]   = useState([]);
  const [viewMode,   setViewMode]   = useState('grid');
  const [sortBy,     setSortBy]     = useState('recommended');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [visibleN,   setVisibleN]   = useState(PAGE_SIZE);

  // FIX 1: sidebarOpen now comes from parent — no local state here

  // Simulate API fetch
  useEffect(() => {
    setIsLoading(true);
    setVisibleN(PAGE_SIZE);
    const t = setTimeout(() => {
      setServices(MOCK_FEATURED_SERVICES);
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(t);
  }, [eventType]);

  const handleFilterChange = useCallback((field, value) => {
    if (field === 'eventType') return; // locked
    updateFilter(field, value);
    setVisibleN(PAGE_SIZE);
  }, [updateFilter]);

  const handleClear = useCallback(() => {
    clearFilters();
    setVisibleN(PAGE_SIZE);
  }, [clearFilters]);

  const activeCount = [
    filters.keyword,
    filters.categories.length > 0,
    filters.subcategory,
    filters.minPrice > 0 || filters.maxPrice < 5000,
    filters.cities.length > 0,
    filters.rating > 0,
    filters.date,
  ].filter(Boolean).length;

  const totalCount   = services.length;
  const visibleCards = services.slice(0, visibleN);
  const hasMore      = visibleN < totalCount;

  return (
    <section
      id="filtered-services"
      aria-label={`${cfg.label} services`}
      style={{ background: 'var(--color-surface)' }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

        {/* Heading */}
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{
            fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-gold)',
            letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.25rem',
          }}>
            Available near you
          </p>
          <h2 style={{
            margin: 0, fontSize: 'clamp(1.25rem, 3vw, 1.625rem)',
            fontWeight: 800, color: 'var(--color-dark)',
          }}>
            Top {cfg.label} Services in Jordan
          </h2>
        </div>

        {/* Two-column layout */}
        <div className="flex gap-6 items-start">

          {/* Desktop sidebar — FIX 2: floating tab */}
          <div
            key="sidebar-wrapper"
            className="hidden md:block relative shrink-0"
            style={{
              width:      sidebarOpen ? '260px' : '0px',
              transition: 'width 300ms cubic-bezier(0.4,0,0.2,1)',
            }}
          >
            {/* Floating toggle tab — sticks out to the right */}
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
              {/* Arrow — left when open, right when closed */}
              <svg
                width="14" height="14" viewBox="0 0 14 14" fill="none"
                aria-hidden="true"
                style={{
                  transform:  sidebarOpen ? 'rotate(0deg)' : 'rotate(180deg)',
                  transition: 'transform 300ms ease',
                }}
              >
                <path
                  d="M9 2L4 7L9 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
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
                lockedEventType={eventType}
              />
            </aside>
          </div>

          {/* Results */}
          <main className="flex-1 min-w-0" aria-label="Services results">

            {/* Sort / control bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 p-4 rounded-2xl bg-white border border-gray-100 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-3">
                {/* Mobile Filters button */}
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  className="md:hidden relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold border-2 border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-white transition-all duration-200"
                  aria-label="Open filters"
                >
                  <SlidersHorizontal size={15} />
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
                      <span className="font-extrabold text-[var(--color-dark)]">{Math.min(visibleN, totalCount)}</span>
                      {' '}of{' '}
                      <span className="font-extrabold text-[var(--color-dark)]">{totalCount}</span>
                      {' '}results
                    </>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* View toggle */}
                <div className="hidden sm:flex items-center bg-gray-100 rounded-xl p-1 gap-0.5" role="group" aria-label="View mode">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all duration-150 ${viewMode === 'grid' ? 'bg-white text-[var(--color-gold)] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    aria-label="Grid view"
                    aria-pressed={viewMode === 'grid'}
                  >
                    <LayoutGrid size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all duration-150 ${viewMode === 'list' ? 'bg-white text-[var(--color-gold)] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    aria-label="List view"
                    aria-pressed={viewMode === 'list'}
                  >
                    <List size={16} aria-hidden="true" />
                  </button>
                </div>

                {/* Sort dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none rounded-xl border border-gray-200 bg-white pl-3.5 pr-8 py-2 text-sm font-semibold text-[var(--color-dark)] outline-none cursor-pointer focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/20 transition-all"
                  >
                    {SORT_OPTIONS.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Skeletons */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" aria-busy="true">
                {Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            )}

            {/* Empty state */}
            {!isLoading && totalCount === 0 && <EmptyState onClear={handleClear} />}

            {/* Results grid */}
            {!isLoading && totalCount > 0 && (
              <>
                <div
                  className={viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
                    : 'flex flex-col gap-4'}
                  role="list"
                >
                  {visibleCards.map((service) => (
                    <div key={service.id} role="listitem">
                      <ServiceCard service={service} viewMode={viewMode} />
                    </div>
                  ))}
                </div>

                {/* Load more */}
                {hasMore ? (
                  <div className="flex justify-center mt-10">
                    <button
                      type="button"
                      onClick={() => setVisibleN((n) => n + PAGE_SIZE)}
                      className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl text-sm font-bold border-2 border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-white transition-all duration-200"
                    >
                      Load More Services
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-gold)]/10 text-xs font-black">
                        +{totalCount - visibleN}
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center mt-10 gap-2">
                    <div className="flex items-center gap-3 text-xs text-gray-300">
                      <div className="h-px w-16 bg-gray-200" />
                      <span className="font-semibold tracking-wide uppercase">All {totalCount} results shown</span>
                      <div className="h-px w-16 bg-gray-200" />
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile drawer */}
      <MobileFilterDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        onChange={handleFilterChange}
        onClear={handleClear}
        eventType={eventType}
      />
    </section>
  );
}); // end React.memo(FilteredServicesSection)

// ─────────────────────────────────────────────────────────────
//  Section D — Recommendations Strip
//  Receives onCategorySelect; applies filter + smooth-scrolls
// ─────────────────────────────────────────────────────────────
function RecommendationsStrip({ cfg, onCategorySelect }) {
  return (
    <section
      aria-label="Recommended categories"
      style={{
        background:    '#ffffff',
        borderTop:     '1px solid #f3f4f6',
        paddingTop:    '2.5rem',
        paddingBottom: '3rem',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem' }}>
        {/* Heading */}
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{
            fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-gold)',
            letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.25rem',
          }}>
            Browse by category
          </p>
          <h2 style={{
            margin: 0, fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)',
            fontWeight: 800, color: 'var(--color-dark)',
          }}>
            Recommended Categories for {cfg.label}
          </h2>
        </div>

        {/* Horizontally scrollable row */}
        <div
          style={{
            display:         'flex',
            gap:             '1rem',
            overflowX:       'auto',
            paddingBottom:   '0.5rem',
            scrollbarWidth:  'none',
            msOverflowStyle: 'none',
          }}
          role="list"
        >
          {cfg.recommendations.map((cat) => (
            <RecommendationCard
              key={cat}
              cat={cat}
              accentColor={cfg.color}
              onClick={() => onCategorySelect(cat)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function RecommendationCard({ cat, accentColor, onClick }) {
  const [hovered, setHovered] = useState(false);
  const icon = CATEGORY_ICONS[cat] ?? '✨';

  return (
    <button
      type="button"
      role="listitem"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={`Browse ${cat} services`}
      style={{
        flexShrink:    0,
        minWidth:      '160px',
        display:       'flex',
        flexDirection: 'column',
        alignItems:    'flex-start',
        gap:           '0.75rem',
        padding:       '1.25rem',
        borderRadius:  '1rem',
        background:    hovered ? '#fdfaf5' : '#ffffff',
        border:        hovered ? `1.5px solid ${accentColor}55` : '1.5px solid #f3f4f6',
        cursor:        'pointer',
        textAlign:     'left',
        transform:     hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow:     hovered
          ? `0 8px 24px rgba(0,0,0,0.08), 0 2px 8px ${accentColor}22`
          : '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'all 250ms ease',
      }}
    >
      {/* Icon circle */}
      <span
        style={{
          width:          '44px',
          height:         '44px',
          borderRadius:   '12px',
          background:     `${accentColor}18`,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          fontSize:       '1.375rem',
        }}
        aria-hidden="true"
      >
        {icon}
      </span>

      {/* Label */}
      <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-dark)', lineHeight: 1.2 }}>
        {cat}
      </span>

      {/* Browse cue */}
      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: accentColor }}>
        Browse →
      </span>
    </button>
  );
}

export default EventTypePage;
