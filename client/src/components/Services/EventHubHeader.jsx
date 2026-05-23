import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

// ─────────────────────────────────────────────────────────────
//  EVENT TYPE CONFIG — full visual identity per event type
// ─────────────────────────────────────────────────────────────
const EVENT_HUB_CONFIG = {
  '': {
    label:       'All Services',
    emoji:       '✨',
    headline:    'Find the perfect service for your event',
    subline:     'Browse 500+ verified vendors across every category in Jordan',
    gradientColors: ['#2C2C2C', '#3a3a3a', '#1a1a1a'],
    accentColor: 'var(--color-gold)',
    image:       'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1600&q=80',
    tags:        ['Venues', 'Catering', 'Photography', 'Entertainment', 'Decoration'],
  },
  wedding: {
    label:       'Wedding',
    emoji:       '💍',
    headline:    'Plan the wedding of your dreams',
    subline:     "Discover Jordan's finest wedding venues, photographers, and luxury caterers",
    gradientColors: ['#2C1810', '#3d2415', '#1a0f09'],
    accentColor: '#E8C97A',
    image:       'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80',
    tags:        ['Wedding Venues', 'Bridal Photography', 'Wedding Catering', 'Floral Design', 'Wedding Entertainment'],
  },
  graduation: {
    label:       'Graduation',
    emoji:       '🎓',
    headline:    'Celebrate your achievement in style',
    subline:     'Make your graduation unforgettable with the right venue and services',
    gradientColors: ['#0f1f2e', '#162840', '#0a1520'],
    accentColor: '#6BA3D6',
    image:       'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=80',
    tags:        ['Graduation Halls', 'Photography', 'Catering', 'Decoration', 'Entertainment'],
  },
  'milestone-birthdays': {
    label:       'Milestone Birthdays',
    emoji:       '🎂',
    headline:    'Make every milestone unforgettable',
    subline:     'From intimate gatherings to grand celebrations — we have everything',
    gradientColors: ['#1f0a2e', '#2d1040', '#150720'],
    accentColor: '#C084FC',
    image:       'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1600&q=80',
    tags:        ['Party Venues', 'Birthday Catering', 'Entertainment', 'Decoration', 'Photography'],
  },
  corporate: {
    label:       'Corporate',
    emoji:       '💼',
    headline:    'Elevate your corporate events',
    subline:     'Professional venues and services for conferences, launches, and team events',
    gradientColors: ['#0a1628', '#0f2040', '#060e1a'],
    accentColor: '#64B5F6',
    image:       'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80',
    tags:        ['Conference Venues', 'AV Equipment', 'Corporate Catering', 'Photography', 'Transport'],
  },
};

// Tab order
const TAB_ORDER = [
  { value: '',                    label: 'All',       emoji: '✨' },
  { value: 'wedding',             label: 'Wedding',   emoji: '💍' },
  { value: 'graduation',          label: 'Graduation',emoji: '🎓' },
  { value: 'milestone-birthdays', label: 'Milestones',emoji: '🎂' },
  { value: 'corporate',           label: 'Corporate', emoji: '💼' },
];

// ─────────────────────────────────────────────────────────────
//  EventHubHeader
//
//  Props:
//    activeType  : string  — current filters.eventType value
//    onTypeChange: fn(val) — calls handleFilterChange('eventType', val)
// ─────────────────────────────────────────────────────────────
function EventHubHeader({ activeType = '', onTypeChange }) {
  const config = EVENT_HUB_CONFIG[activeType] ?? EVENT_HUB_CONFIG[''];

  // ── Collapsed / expanded state ───────────────────────────
  const [collapsed,    setCollapsed]    = useState(false);

  // ── Text content fade state (for type changes) ───────────
  const [contentVisible, setContentVisible] = useState(true);

  // ── Entrance animation ───────────────────────────────────
  const [mounted, setMounted] = useState(false);

  // ── Refs for timers ──────────────────────────────────────
  const autoCollapseTimerRef = useRef(null);

  // ── Entrance animation: opacity 0 → 1 after 10ms ────────
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(t);
  }, []);

  // ── Scroll-driven auto-collapse ──────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 120) setCollapsed(true);
      // Do NOT auto-expand on scroll-up — only manual click
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Clean up auto-collapse timer on unmount ──────────────
  useEffect(() => () => {
    if (autoCollapseTimerRef.current) clearTimeout(autoCollapseTimerRef.current);
  }, []);

  // ── Tab click handler ────────────────────────────────────
  const handleTabClick = useCallback((value) => {
    if (value === activeType) return;

    // Clear any pending auto-collapse
    if (autoCollapseTimerRef.current) clearTimeout(autoCollapseTimerRef.current);

    // 1. Call parent immediately (sidebar stays in sync)
    onTypeChange(value);

    // 2. Trigger text fade-out → fade-in
    setContentVisible(false);
    setTimeout(() => setContentVisible(true), 50);

    // 3. Always expand first to show the new visual identity
    setCollapsed(false);

    // 4. Auto-collapse after 2500ms
    autoCollapseTimerRef.current = setTimeout(() => setCollapsed(true), 2500);
  }, [activeType, onTypeChange]);

  // ── Tag click — navigate to /services?category=<tag> ────
  const handleTagClick = (tag) => {
    const url = new URL(window.location.href);
    url.searchParams.set('category', tag.toLowerCase().replace(/\s+/g, '-'));
    window.history.pushState({}, '', url.toString());
  };

  // ── Expand button click ──────────────────────────────────
  const handleExpand = () => {
    setCollapsed(false);
    if (autoCollapseTimerRef.current) clearTimeout(autoCollapseTimerRef.current);
  };

  // ── Collapse button click ────────────────────────────────
  const handleCollapse = () => {
    setCollapsed(true);
    if (autoCollapseTimerRef.current) clearTimeout(autoCollapseTimerRef.current);
  };

  // ── Build inline gradient string from config ─────────────
  const [c0, c1, c2] = config.gradientColors;
  const gradientStyle = `linear-gradient(135deg, ${c0}f0 0%, ${c1}e0 50%, ${c2}f8 100%)`;

  // ─────────────────────────────────────────────────────────
  //  Render
  // ─────────────────────────────────────────────────────────
  return (
    <div
      style={{
        /* Entrance animation */
        opacity:    mounted ? 1 : 0,
        transform:  mounted ? 'translateY(0)' : 'translateY(-16px)',
        transition: 'opacity 600ms cubic-bezier(0.22, 1, 0.36, 1), transform 600ms cubic-bezier(0.22, 1, 0.36, 1)',
        /* Collapsed strip: sticky just below navbar */
        position: collapsed ? 'sticky' : 'relative',
        top:      collapsed ? '64px' : 'auto',
        zIndex:   50,
        width:    '100%',
      }}
      aria-label="Event type context banner"
    >
      {/* ══════════════════════════════════════════════════════
          OUTER CONTAINER — max-height transition drives
          the expand/collapse animation
      ══════════════════════════════════════════════════════ */}
      <div
        style={{
          overflow:   'hidden',
          maxHeight:  collapsed ? '48px' : '380px',
          transition: 'max-height 400ms cubic-bezier(0.4, 0, 0.2, 1)',
          position:   'relative',
        }}
      >
        {/* ── BACKGROUND LAYER ─────────────────────────────── */}
        <div
          style={{
            position:   'absolute',
            inset:      0,
            transition: 'all 500ms ease',
            overflow:   'hidden',
          }}
          aria-hidden="true"
        >
          {/* Background image */}
          <img
            src={config.image}
            alt=""
            aria-hidden="true"
            style={{
              position:   'absolute',
              inset:      0,
              width:      '100%',
              height:     '100%',
              objectFit:  'cover',
              objectPosition: 'center',
              transition: 'all 500ms ease',
            }}
          />
          {/* Gradient overlay at 90% opacity */}
          <div
            style={{
              position:   'absolute',
              inset:      0,
              background: gradientStyle,
              opacity:    0.92,
              transition: 'background 500ms ease',
            }}
          />
        </div>

        {/* ════════════════════════════════════════════════════
            COLLAPSED STATE — 48px slim strip
        ════════════════════════════════════════════════════ */}
        <div
          style={{
            display:        'flex',
            alignItems:     'center',
            height:         '48px',
            padding:        '0 1.25rem',
            gap:            '0.75rem',
            position:       'relative',
            zIndex:         1,
            opacity:        collapsed ? 1 : 0,
            pointerEvents:  collapsed ? 'auto' : 'none',
            transition:     'opacity 300ms ease',
            backdropFilter: collapsed ? 'blur(12px)' : 'none',
          }}
          aria-hidden={!collapsed}
        >
          {/* Left: emoji + label */}
          <div
            style={{
              display:     'flex',
              alignItems:  'center',
              gap:         '0.5rem',
              flexShrink:  0,
              color:       config.accentColor,
              fontWeight:  700,
              fontSize:    '0.8125rem',
              whiteSpace:  'nowrap',
            }}
          >
            <span style={{ fontSize: '1rem' }}>{config.emoji}</span>
            <span>{config.label}</span>
          </div>

          {/* Center: headline (truncated) */}
          <p
            style={{
              flex:         1,
              color:        'rgba(255,255,255,0.75)',
              fontSize:     '0.8125rem',
              fontWeight:   500,
              overflow:     'hidden',
              textOverflow: 'ellipsis',
              whiteSpace:   'nowrap',
              minWidth:     0,
            }}
          >
            {config.headline}
          </p>

          {/* Right: expand button */}
          <button
            type="button"
            onClick={handleExpand}
            aria-label="Expand event banner"
            style={{
              flexShrink:     0,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              width:          '28px',
              height:         '28px',
              borderRadius:   '50%',
              border:         '1px solid rgba(255,255,255,0.2)',
              background:     'rgba(255,255,255,0.1)',
              color:          'rgba(255,255,255,0.8)',
              cursor:         'pointer',
              backdropFilter: 'blur(8px)',
              transition:     'background 200ms ease, transform 200ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
          >
            <ChevronDown size={14} aria-hidden="true" />
          </button>
        </div>

        {/* ════════════════════════════════════════════════════
            EXPANDED STATE — full banner
        ════════════════════════════════════════════════════ */}
        <div
          style={{
            position:      'relative',
            zIndex:        1,
            padding:       '1.25rem 1.5rem 1rem',
            minHeight:     'clamp(200px, 25vw, 320px)',
            display:       'flex',
            flexDirection: 'column',
            gap:           '1rem',
            opacity:       collapsed ? 0 : 1,
            pointerEvents: collapsed ? 'none' : 'auto',
            transition:    'opacity 300ms ease',
          }}
          aria-hidden={collapsed}
        >
          {/* ── TAB ROW ──────────────────────────────────── */}
          <div
            style={{
              display:        'flex',
              alignItems:     'center',
              gap:            '0.375rem',
              overflowX:      'auto',
              paddingBottom:  '0.25rem',
              /* scrollbar hidden */
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
            role="tablist"
            aria-label="Event type selector"
          >
            {TAB_ORDER.map(({ value, label, emoji }) => {
              const isActive = activeType === value;
              return (
                <button
                  key={value || 'all'}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleTabClick(value)}
                  style={{
                    display:        'inline-flex',
                    alignItems:     'center',
                    gap:            '0.375rem',
                    padding:        '0.375rem 1rem',
                    borderRadius:   '9999px',
                    fontSize:       '0.8125rem',
                    fontWeight:     600,
                    whiteSpace:     'nowrap',
                    cursor:         'pointer',
                    flexShrink:     0,
                    transition:     'all 200ms ease',
                    border:         isActive ? 'none' : '1px solid rgba(255,255,255,0.15)',
                    background:     isActive ? '#ffffff' : 'rgba(255,255,255,0.1)',
                    color:          isActive ? 'var(--color-dark)' : 'rgba(255,255,255,0.7)',
                    boxShadow:      isActive ? '0 2px 12px rgba(0,0,0,0.15)' : 'none',
                    transform:      isActive ? 'scale(1.05)' : 'scale(1)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                      e.currentTarget.style.color = '#ffffff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                      e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                    }
                  }}
                >
                  <span aria-hidden="true">{emoji}</span>
                  {label}
                </button>
              );
            })}
          </div>

          {/* ── MAIN CONTENT AREA ────────────────────────── */}
          <div
            style={{
              flex:       1,
              display:    'flex',
              flexDirection: 'column',
              gap:        '0.75rem',
              opacity:    contentVisible ? 1 : 0,
              transition: 'opacity 300ms ease',
            }}
          >
            {/* Emoji + Label pill */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span
                style={{
                  display:        'inline-flex',
                  alignItems:     'center',
                  gap:            '0.375rem',
                  padding:        '0.375rem 0.875rem',
                  borderRadius:   '9999px',
                  background:     'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(8px)',
                  border:         '1px solid rgba(255,255,255,0.25)',
                  color:          '#ffffff',
                  fontSize:       '0.75rem',
                  fontWeight:     700,
                  letterSpacing:  '0.02em',
                }}
              >
                <span style={{ fontSize: '0.875rem' }}>{config.emoji}</span>
                {config.label}
              </span>
            </div>

            {/* Headline */}
            <h2
              style={{
                margin:     0,
                fontSize:   'clamp(1.5rem, 4vw, 2.25rem)',
                fontWeight: 800,
                color:      '#ffffff',
                lineHeight: 1.15,
                letterSpacing: '-0.01em',
                maxWidth:   '640px',
              }}
            >
              {config.headline}
            </h2>

            {/* Subline */}
            <p
              style={{
                margin:    0,
                fontSize:  'clamp(0.8125rem, 1.5vw, 0.9375rem)',
                color:     'rgba(255,255,255,0.7)',
                maxWidth:  '560px',
                lineHeight: 1.55,
              }}
            >
              {config.subline}
            </p>

            {/* Tag pills */}
            <div
              style={{
                display:   'flex',
                flexWrap:  'wrap',
                gap:       '0.5rem',
                marginTop: '0.25rem',
              }}
            >
              {config.tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagClick(tag)}
                  style={{
                    padding:      '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    background:   'rgba(255,255,255,0.1)',
                    border:       '1px solid rgba(255,255,255,0.2)',
                    color:        'rgba(255,255,255,0.8)',
                    fontSize:     '0.75rem',
                    fontWeight:   500,
                    cursor:       'pointer',
                    transition:   'all 200ms ease',
                    whiteSpace:   'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                  }}
                  aria-label={`Browse ${tag}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* ── COLLAPSE BUTTON — centered at bottom ─────── */}
          <div
            style={{
              display:        'flex',
              justifyContent: 'center',
              paddingTop:     '0.25rem',
              paddingBottom:  '0.25rem',
            }}
          >
            <button
              type="button"
              onClick={handleCollapse}
              aria-label="Collapse event banner"
              style={{
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                width:          '32px',
                height:         '32px',
                borderRadius:   '50%',
                background:     'rgba(255,255,255,0.1)',
                border:         '1px solid rgba(255,255,255,0.2)',
                color:          'rgba(255,255,255,0.7)',
                cursor:         'pointer',
                backdropFilter: 'blur(8px)',
                transition:     'background 200ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            >
              <ChevronUp size={14} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Accent bottom border line (visible in both states) ── */}
      <div
        style={{
          height:     '2px',
          background: `linear-gradient(to right, transparent, ${config.accentColor}80, transparent)`,
          transition: 'background 500ms ease',
        }}
        aria-hidden="true"
      />
    </div>
  );
}

export default EventHubHeader;
