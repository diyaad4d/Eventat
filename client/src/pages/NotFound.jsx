import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

// ─────────────────────────────────────────────────────────────
//  NotFound — Step 8.1
//  Full-viewport, branded 404 page. No navbar or sidebar.
//
//  Sections:
//    1. Inline <style> — keyframe animations scoped to this page
//    2. Animated SVG compass illustration
//    3. Floating 404 digits (staggered gold gradient)
//    4. Decorative confetti dots (pure CSS)
//    5. Headline + subline
//    6. Primary + Ghost action buttons
//    7. Breadcrumb hint links
// ─────────────────────────────────────────────────────────────

export default function NotFound() {
  const navigate = useNavigate();

  // ── Entrance animation ──────────────────────────────────────
  // Delay by 50 ms so the browser paints the initial invisible
  // state before triggering the transition (avoids flash).
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {/* ── Scoped keyframes (no global pollution) ───────────── */}
      <style>{`
        @keyframes nf-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
        @keyframes nf-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes nf-dot-bob {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.6; }
          50%       { transform: translateY(-8px) scale(1.15); opacity: 0.8; }
        }
        .nf-digit {
          display: inline-block;
          font-size: clamp(6rem, 15vw, 10rem);
          font-weight: 800;
          line-height: 1;
          letter-spacing: -0.04em;
          background: linear-gradient(135deg, var(--color-gold-light), var(--color-gold), var(--color-gold-dark));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .nf-digit-1 { animation: nf-float 3s ease-in-out infinite 0ms; }
        .nf-digit-2 { animation: nf-float 3s ease-in-out infinite 200ms; }
        .nf-digit-3 { animation: nf-float 3s ease-in-out infinite 400ms; }
        .nf-dot {
          position: absolute;
          border-radius: 9999px;
          opacity: 0.6;
        }
        .nf-arrow-spin {
          transform-origin: 50% 50%;
          animation: nf-spin 4s linear infinite;
        }
        .nf-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 2rem;
          border-radius: 9999px;
          background-color: var(--color-gold);
          color: #ffffff;
          font-weight: 700;
          font-size: 0.9375rem;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(201, 162, 77, 0.35);
          transition: all 200ms ease;
          text-decoration: none;
        }
        .nf-btn-primary:hover {
          background-color: var(--color-gold-dark);
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(201, 162, 77, 0.45);
        }
        .nf-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 2rem;
          border-radius: 9999px;
          background-color: #ffffff;
          color: #374151;
          font-weight: 700;
          font-size: 0.9375rem;
          border: 1.5px solid #D1D5DB;
          cursor: pointer;
          transition: all 200ms ease;
          text-decoration: none;
        }
        .nf-btn-ghost:hover {
          border-color: var(--color-gold);
          color: var(--color-gold);
          transform: translateY(-1px);
        }
        .nf-crumb-link {
          color: var(--color-gold);
          text-decoration: none;
          font-weight: 600;
          transition: color 150ms ease;
        }
        .nf-crumb-link:hover {
          color: var(--color-gold-dark);
          text-decoration: underline;
        }
      `}</style>

      {/* ── Page shell ───────────────────────────────────────── */}
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--color-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1rem',
          fontFamily: 'var(--font-sans)',
        }}
      >
        {/* ── Entrance wrapper ─────────────────────────────── */}
        <div
          style={{
            maxWidth: '32rem',
            width: '100%',
            textAlign: 'center',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 600ms cubic-bezier(0.22,1,0.36,1), transform 600ms cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          {/* ════════════════════════════════════════════════
              SECTION 1 — SVG COMPASS ILLUSTRATION
          ════════════════════════════════════════════════ */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <svg
              width="120"
              height="120"
              viewBox="0 0 120 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              role="img"
              aria-label="Broken compass illustration"
            >
              {/* Outer compass circle */}
              <circle cx="60" cy="60" r="42" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round" />
              {/* Inner compass ring */}
              <circle cx="60" cy="60" r="32" stroke="#C9A24D" strokeWidth="1.5" strokeDasharray="5 4" strokeLinecap="round" opacity="0.5" />
              {/* Center pivot dot */}
              <circle cx="60" cy="60" r="4" fill="#C9A24D" />

              {/* Spinning compass needle group */}
              <g className="nf-arrow-spin">
                {/* North needle — gold (points "wrong" direction, tilted) */}
                <path
                  d="M60 60 L60 26"
                  stroke="#C9A24D"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <polygon
                  points="60,18 55,30 65,30"
                  fill="#C9A24D"
                />
                {/* South needle — dark */}
                <path
                  d="M60 60 L60 90"
                  stroke="#2C2C2C"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.35"
                />
              </g>

              {/* N / E / S / W cardinal labels */}
              <text x="60" y="14" textAnchor="middle" fill="#9CA3AF" fontSize="9" fontWeight="700" fontFamily="var(--font-sans)">N</text>
              <text x="107" y="64" textAnchor="middle" fill="#9CA3AF" fontSize="9" fontWeight="700" fontFamily="var(--font-sans)">E</text>
              <text x="60" y="112" textAnchor="middle" fill="#9CA3AF" fontSize="9" fontWeight="700" fontFamily="var(--font-sans)">S</text>
              <text x="13" y="64" textAnchor="middle" fill="#9CA3AF" fontSize="9" fontWeight="700" fontFamily="var(--font-sans)">W</text>

              {/* Sparkle 1 — top-right */}
              <g transform="translate(92, 22)">
                <line x1="0" y1="-6" x2="0" y2="6" stroke="#E8C97A" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="-6" y1="0" x2="6" y2="0" stroke="#E8C97A" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="-4" y1="-4" x2="4" y2="4" stroke="#E8C97A" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
                <line x1="4" y1="-4" x2="-4" y2="4" stroke="#E8C97A" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
              </g>

              {/* Sparkle 2 — bottom-left */}
              <g transform="translate(26, 96)">
                <line x1="0" y1="-5" x2="0" y2="5" stroke="#C9A24D" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="-5" y1="0" x2="5" y2="0" stroke="#C9A24D" strokeWidth="1.5" strokeLinecap="round" />
              </g>

              {/* Sparkle 3 — small, top-left */}
              <g transform="translate(20, 28)">
                <line x1="0" y1="-4" x2="0" y2="4" stroke="#A07830" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
                <line x1="-4" y1="0" x2="4" y2="0" stroke="#A07830" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
              </g>

              {/* Sparkle 4 — bottom-right */}
              <g transform="translate(96, 90)">
                <line x1="0" y1="-4" x2="0" y2="4" stroke="#E8C97A" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                <line x1="-4" y1="0" x2="4" y2="0" stroke="#E8C97A" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
              </g>
            </svg>
          </div>

          {/* ════════════════════════════════════════════════
              SECTION 2 — FLOATING 404 DIGITS + CONFETTI DOTS
          ════════════════════════════════════════════════ */}
          <div style={{ position: 'relative', display: 'inline-block' }}>

            {/* ── Confetti dots ── */}
            {/* Top-left */}
            <span className="nf-dot" style={{
              width: 10, height: 10, background: 'var(--color-gold-light)',
              top: '-8px', left: '6px',
              animation: 'nf-dot-bob 2.8s ease-in-out infinite 0ms',
            }} aria-hidden="true" />
            {/* Top-right */}
            <span className="nf-dot" style={{
              width: 8, height: 8, background: 'var(--color-gold)',
              top: '-4px', right: '10px',
              animation: 'nf-dot-bob 3.2s ease-in-out infinite 300ms',
            }} aria-hidden="true" />
            {/* Middle-left */}
            <span className="nf-dot" style={{
              width: 14, height: 14, background: '#CBD5E1',
              top: '40%', left: '-18px',
              animation: 'nf-dot-bob 2.5s ease-in-out infinite 150ms',
            }} aria-hidden="true" />
            {/* Middle-right */}
            <span className="nf-dot" style={{
              width: 10, height: 10, background: 'var(--color-gold-light)',
              top: '35%', right: '-16px',
              animation: 'nf-dot-bob 3s ease-in-out infinite 500ms',
            }} aria-hidden="true" />
            {/* Bottom-left */}
            <span className="nf-dot" style={{
              width: 8, height: 8, background: 'var(--color-gold-dark)',
              bottom: '4px', left: '20px',
              animation: 'nf-dot-bob 2.9s ease-in-out infinite 200ms',
            }} aria-hidden="true" />
            {/* Bottom-right */}
            <span className="nf-dot" style={{
              width: 12, height: 12, background: '#CBD5E1',
              bottom: '0px', right: '24px',
              animation: 'nf-dot-bob 3.4s ease-in-out infinite 400ms',
            }} aria-hidden="true" />

            {/* ── 404 digits ── */}
            <div aria-label="404 error" role="text">
              <span className="nf-digit nf-digit-1" aria-hidden="true">4</span>
              <span className="nf-digit nf-digit-2" style={{ margin: '0 0.15em' }} aria-hidden="true">0</span>
              <span className="nf-digit nf-digit-3" aria-hidden="true">4</span>
            </div>
          </div>

          {/* ════════════════════════════════════════════════
              SECTION 3 — HEADLINE + SUBLINE
          ════════════════════════════════════════════════ */}
          <h1
            style={{
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              fontWeight: 800,
              color: 'var(--color-dark)',
              marginTop: '2rem',
              marginBottom: '0.75rem',
              lineHeight: 1.2,
            }}
          >
            Page Not Found
          </h1>

          <p
            style={{
              fontSize: '0.9375rem',
              color: '#6B7280',
              maxWidth: '380px',
              margin: '0 auto',
              lineHeight: 1.7,
            }}
          >
            Looks like this page took a wrong turn. Don't&nbsp;worry&nbsp;—
            let's get you back on track.
          </p>

          {/* ════════════════════════════════════════════════
              SECTION 4 — ACTION BUTTONS
          ════════════════════════════════════════════════ */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              justifyContent: 'center',
              marginTop: '2rem',
            }}
          >
            {/* Primary — Go Back Home */}
            <button
              id="nf-btn-home"
              className="nf-btn-primary"
              onClick={() => navigate('/home')}
              aria-label="Go back to the home page"
            >
              <Home size={16} aria-hidden="true" />
              Go Back Home
            </button>

            {/* Ghost — Go Back */}
            <button
              id="nf-btn-back"
              className="nf-btn-ghost"
              onClick={() => navigate(-1)}
              aria-label="Go back to the previous page"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Go Back
            </button>
          </div>

          {/* ════════════════════════════════════════════════
              SECTION 5 — BREADCRUMB HINT
          ════════════════════════════════════════════════ */}
          <p
            style={{
              marginTop: '2.5rem',
              fontSize: '0.8125rem',
              color: '#9CA3AF',
            }}
          >
            Lost? Try:{' '}
            <Link to="/home" className="nf-crumb-link">Home</Link>
            <span style={{ color: '#D1D5DB', margin: '0 0.4rem' }}>·</span>
            <Link to="/services" className="nf-crumb-link">Services</Link>
            <span style={{ color: '#D1D5DB', margin: '0 0.4rem' }}>·</span>
            <Link to="/login" className="nf-crumb-link">Login</Link>
          </p>

        </div>
      </div>
    </>
  );
}
