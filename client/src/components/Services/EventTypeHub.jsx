import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EVENT_TYPE_CONFIG, EVENT_TYPE_ORDER } from '../../data/eventTypeConfig';

// ─────────────────────────────────────────────────────────────
//  EventTypeHub
//
//  Staggered 2×2 CSS Grid — all 4 cards use Treatment B
//  (full-bleed image + dark gradient overlay + text at bottom-left).
//  Vertical offsets via marginTop on each wrapper div create a
//  playful magazine stagger without absolute positioning.
//
//  Desktop: height = clamp(480px, 60vw, 650px)  ← ~1:1.35 portrait ratio
//  Mobile  (<640px): height = 360px, offsets zeroed out
// ─────────────────────────────────────────────────────────────

const STAGGER_DELAYS = [0, 100, 200, 300];

// marginTop per card index (Wedding, Graduation, Milestone, Corporate)
const CARD_OFFSETS = ['0px', '30px', '0px', '30px'];

function EventTypeHub() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <section aria-label="Browse by event type" className="w-full px-4 sm:px-6 lg:px-8 py-8">

      {/* Section heading */}
      <div className="mb-6">
        <p className="text-[10px] font-bold text-[var(--color-gold)] uppercase tracking-[0.2em] mb-1">
          Plan by occasion
        </p>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--color-dark)]">
          What are you celebrating?
        </h2>
      </div>

      {/* ── Staggered 2×2 grid ─────────────────────────────── */}
      <div
        role="list"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 items-start justify-center gap-6"
      >
        {EVENT_TYPE_ORDER.map((typeKey, idx) => {
          const cfg = EVENT_TYPE_CONFIG[typeKey];
          return (
            <EventTypeCard
              key={typeKey}
              cfg={cfg}
              offset={CARD_OFFSETS[idx]}
              delay={STAGGER_DELAYS[idx]}
              mounted={mounted}
              onNavigate={() => navigate(`/services/${typeKey}`)}
            />
          );
        })}
      </div>

      {/* ── Keyframes + hover effects + mobile override ──── */}
      <style>{`
        @keyframes eth-shimmer {
          0%   { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(250%)  skewX(-12deg); }
        }
        .eth-card:hover .eth-shimmer {
          animation: eth-shimmer 700ms ease forwards;
        }
        .eth-card .eth-explore-pill {
          opacity:   0;
          transform: translateY(8px);
          transition: opacity 280ms ease, transform 280ms ease;
        }
        .eth-card:hover .eth-explore-pill {
          opacity:   1;
          transform: translateY(0);
        }
        .eth-card .eth-img {
          transition: transform 500ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .eth-card:hover .eth-img {
          transform: scale(1.08);
        }

        @media (max-width: 639px) {
          /* Mobile: 1 column, no stagger */
          .eth-card-wrapper { margin-top: 0 !important; }
          .eth-card-btn { 
            height: 280px !important; 
          }
        }
      `}</style>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
//  EventTypeCard — Treatment B: full-bleed image
// ─────────────────────────────────────────────────────────────
function EventTypeCard({ cfg, offset, delay, mounted, onNavigate }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      role="listitem"
      className="eth-card-wrapper"
      style={{
        position:   'relative',
        zIndex:     hovered ? 50 : 1,
        marginTop:  offset,
        opacity:    mounted ? 1 : 0,
        transform:  mounted ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 500ms cubic-bezier(0.22,1,0.36,1) ${delay}ms,
                     transform 500ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
    >
      <button
        type="button"
        className="eth-card eth-card-btn w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        onClick={onNavigate}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label={`Explore ${cfg.label} services`}
        style={{
          height:       '450px',
          borderRadius: '20px',
          display:      'block',
          position:     'relative',
          width:        '100%',
          overflow:     'hidden',
          cursor:       'pointer',
          border:       'none',
          padding:      0,
          textAlign:    'left',
          background:   cfg.darkBg,
          boxShadow:    hovered
            ? `0 24px 60px 0 ${cfg.color}77, 0 12px 28px 0 rgba(0,0,0,0.4)`
            : '0 2px 16px 0 rgba(0,0,0,0.10)',
          transform:    hovered ? 'scale(1.08) translateY(-4px)' : 'scale(1) translateY(0)',
          transition:   'box-shadow 300ms ease, transform 300ms cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        {/* Full-bleed image */}
        <img
          src={cfg.image}
          alt=""
          aria-hidden="true"
          className="eth-img"
          style={{
            position:       'absolute',
            inset:          0,
            width:          '100%',
            height:         '100%',
            objectFit:      'cover',
            objectPosition: 'center',
          }}
        />

        {/* Dark gradient overlay — bottom-to-top */}
        <div
          aria-hidden="true"
          style={{
            position:   'absolute',
            inset:      0,
            background: `linear-gradient(180deg, transparent 20%, ${cfg.darkBg}bb 65%, ${cfg.darkBg}f0 100%)`,
          }}
        />

        {/* Shimmer sweep on hover */}
        <div
          className="eth-shimmer"
          aria-hidden="true"
          style={{
            position:      'absolute',
            inset:         0,
            width:         '60%',
            background:    'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
            pointerEvents: 'none',
          }}
        />

        {/* Content — bottom-left */}
        <div
          style={{
            position:       'absolute',
            inset:          0,
            display:        'flex',
            flexDirection:  'column',
            justifyContent: 'flex-end',
            padding:        '1.5rem',
            gap:            '0.5rem',
            zIndex:         1,
          }}
        >
          <span style={{ fontSize: '1.75rem', lineHeight: 1 }} aria-hidden="true">
            {cfg.emoji}
          </span>
          <span
            style={{
              fontSize:      '1.125rem',
              fontWeight:    800,
              color:         '#ffffff',
              lineHeight:    1.2,
              letterSpacing: '-0.01em',
              textShadow:    '0 1px 8px rgba(0,0,0,0.4)',
            }}
          >
            {cfg.label}
          </span>
          <span
            style={{
              fontSize:   '0.6875rem',
              color:      'rgba(255,255,255,0.65)',
              lineHeight: 1.4,
              maxWidth:   '200px',
            }}
          >
            {cfg.subline}
          </span>

          {/* Explore pill — slides up on hover */}
          <div className="eth-explore-pill" style={{ marginTop: '0.25rem' }}>
            <span
              style={{
                display:       'inline-flex',
                alignItems:    'center',
                gap:           '0.3rem',
                padding:       '0.3rem 0.875rem',
                borderRadius:  '9999px',
                background:    cfg.color,
                color:         '#fff',
                fontSize:      '0.75rem',
                fontWeight:    700,
                letterSpacing: '0.01em',
                boxShadow:     `0 2px 12px ${cfg.color}66`,
                whiteSpace:    'nowrap',
              }}
            >
              Explore →
            </span>
          </div>
        </div>
      </button>
    </div>
  );
}

export default EventTypeHub;
