import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  BadgeDollarSign,
  CalendarCheck,
  Star,
  Users,
  Sparkles,
  ArrowRight,
  ChevronDown,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import HowItWorks from '../../components/shared/HowItWorks';
import heroImg from '../../assets/Hero.jpg';

// ─────────────────────────────────────────────────────────────
//  Landing — Step 1.1
//  Sections:
//    1. Full-viewport Hero with animated headline
//    2. Role Selection Cards (Client / Vendor)
//    3. Value Proposition Strip (3 pillars)
//    4. Social Proof Numbers bar
// ─────────────────────────────────────────────────────────────

// ── Value proposition data ────────────────────────────────────
const VALUE_PROPS = [
  {
    icon: ShieldCheck,
    title: 'Verified Vendors',
    desc: 'Every vendor on Eventat is manually reviewed and approved by our team before going live.',
  },
  {
    icon: BadgeDollarSign,
    title: 'Transparent Pricing',
    desc: 'No hidden fees. Browse real prices upfront and compare vendors side-by-side with confidence.',
  },
  {
    icon: CalendarCheck,
    title: 'Easy Booking',
    desc: 'Plan your entire event in one place — select services, set your date, and confirm in minutes.',
  },
];

// ── Social proof data ─────────────────────────────────────────
const STATS = [
  { icon: Users,   value: '500+',   label: 'Verified Vendors' },
  { icon: Sparkles, value: '2,000+', label: 'Events Planned' },
  { icon: Star,    value: '4.8★',   label: 'Average Rating' },
];

// ─────────────────────────────────────────────────────────────
//  RoleCard sub-component
// ─────────────────────────────────────────────────────────────
function RoleCard({ role, selectedRole, onSelect, icon: Icon, title, description, accentColor }) {
  const isSelected = selectedRole === role;

  return (
    <button
      type="button"
      onClick={() => onSelect(role)}
      aria-pressed={isSelected}
      className={[
        'relative w-full max-w-xs text-left rounded-2xl p-8 border-2 cursor-pointer',
        'transition-all duration-300 ease-out group outline-none',
        'focus-visible:ring-4 focus-visible:ring-[var(--color-gold)]/40',
        isSelected
          ? 'border-[var(--color-gold)] bg-[#fffdf5] shadow-[0_8px_32px_rgba(201,162,77,0.25)] scale-[1.03]'
          : 'border-white/25 bg-white/10 hover:border-white/60 hover:bg-white/18 hover:scale-[1.015] hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)]',
      ].join(' ')}
    >
      {/* Selection radio indicator */}
      <span
        className={[
          'absolute top-5 right-5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200',
          isSelected
            ? 'border-[var(--color-gold)] bg-[var(--color-gold)]'
            : 'border-white/50 bg-transparent',
        ].join(' ')}
        aria-hidden="true"
      >
        {isSelected && (
          <span className="w-2 h-2 rounded-full bg-white block" />
        )}
      </span>

      {/* Icon container */}
      <div
        className={[
          'w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300',
          isSelected
            ? 'bg-[var(--color-gold)] text-white shadow-[0_4px_16px_rgba(201,162,77,0.4)]'
            : 'bg-white/20 text-white group-hover:bg-white/30',
        ].join(' ')}
      >
        <Icon size={28} strokeWidth={1.75} />
      </div>

      <h3
        className={[
          'text-xl font-bold mb-2 transition-colors duration-200',
          isSelected ? 'text-[var(--color-dark)]' : 'text-white',
        ].join(' ')}
      >
        {title}
      </h3>
      <p
        className={[
          'text-sm leading-relaxed transition-colors duration-200',
          isSelected ? 'text-[var(--color-dark-soft)]/80' : 'text-white/70',
        ].join(' ')}
      >
        {description}
      </p>

      {/* Gold glow bottom accent when selected */}
      {isSelected && (
        <span
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1 rounded-full bg-[var(--color-gold)] blur-sm opacity-60"
          aria-hidden="true"
        />
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
//  Main Landing component
// ─────────────────────────────────────────────────────────────
function Landing() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);

  const handleContinue = () => {
    if (selectedRole) {
      navigate('/signup', { state: { role: selectedRole } });
    }
  };

  const ctaLabel =
    selectedRole === 'customer'
      ? 'Join as a Client'
      : selectedRole === 'vendor'
      ? 'Join as a Vendor'
      : 'Create Account';

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-dark)]">

      {/* ══════════════════════════════════════════════════════
          SECTION 1 — HERO
          Full-viewport image with dark overlay + animated text
      ══════════════════════════════════════════════════════ */}
      <section className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden">

        {/* Background image */}
        <img
          src={heroImg}
          alt="Elegant event venue"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Gradient overlay — dark bottom to semi-dark top */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(28,28,28,0.55) 0%, rgba(28,28,28,0.72) 50%, rgba(28,28,28,0.92) 100%)',
          }}
          aria-hidden="true"
        />

        {/* Subtle grain texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundSize: '200px 200px',
          }}
          aria-hidden="true"
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-4 w-full max-w-5xl mx-auto">

          {/* Eyebrow tag */}
          <span className="animate-fade-in inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-xs font-semibold tracking-widest uppercase mb-6 select-none">
            <Sparkles size={13} className="text-[var(--color-gold-light)]" />
            Jordan's Premier Event Marketplace
          </span>

          {/* Main headline */}
          <h1 className="animate-slide-up text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08] mb-6">
            Plan Your{' '}
            <span className="text-gradient-gold">Perfect</span>
            <br className="hidden sm:block" />
            {' '}Event
          </h1>

          {/* Sub-headline */}
          <p
            className="text-white/70 text-lg sm:text-xl max-w-2xl leading-relaxed mb-10"
            style={{ animation: 'fadeIn 0.4s 0.15s ease both' }}
          >
            Connect with 500+ verified vendors — photographers, caterers, venues
            and more — all in one beautifully simple platform.
          </p>

          {/* ── ROLE SELECTION CARDS ──────────────────────────── */}
          <div
            className="flex flex-col sm:flex-row gap-5 justify-center items-stretch w-full max-w-xl mb-10"
            style={{ animation: 'fadeIn 0.5s 0.25s ease both' }}
          >
            <RoleCard
              role="customer"
              selectedRole={selectedRole}
              onSelect={setSelectedRole}
              icon={Users}
              title="I'm a Client"
              description="Browse verified vendors, plan your event, and book services — all in one place."
            />
            <RoleCard
              role="vendor"
              selectedRole={selectedRole}
              onSelect={setSelectedRole}
              icon={Sparkles}
              title="I'm a Vendor"
              description="List your services, reach thousands of event planners, and grow your business."
            />
          </div>

          {/* CTA buttons */}
          <div
            className="flex flex-col sm:flex-row gap-3 items-center"
            style={{ animation: 'fadeIn 0.5s 0.35s ease both' }}
          >
            <Button
              size="lg"
              variant="primary"
              disabled={!selectedRole}
              onClick={handleContinue}
              rightIcon={<ArrowRight size={17} />}
              className="rounded-full px-8 min-w-[200px] text-base disabled:opacity-40"
            >
              {ctaLabel}
            </Button>

            <Link
              to="/login"
              className="text-sm text-white/60 hover:text-[var(--color-gold-light)] transition-colors duration-200 underline underline-offset-4"
            >
              Already have an account? Log in
            </Link>
          </div>
        </div>

        {/* Scroll-down chevron */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce opacity-60" aria-hidden="true">
          <ChevronDown size={28} className="text-white" />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 2 — SOCIAL PROOF NUMBERS
      ══════════════════════════════════════════════════════ */}
      <section
        aria-label="Platform statistics"
        className="relative bg-[var(--color-dark)] border-y border-white/8"
      >
        {/* Subtle gold line accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)]/40 to-transparent" aria-hidden="true" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-0 sm:divide-x sm:divide-white/10">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex flex-col items-center gap-2 sm:px-8 text-center">
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={18} className="text-[var(--color-gold)]" aria-hidden="true" />
                </div>
                <dt className="text-3xl sm:text-4xl font-extrabold text-gradient-gold tracking-tight leading-none">
                  {value}
                </dt>
                <dd className="text-sm font-medium text-white/50 uppercase tracking-widest">
                  {label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)]/40 to-transparent" aria-hidden="true" />
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 3 — VALUE PROPOSITION STRIP
      ══════════════════════════════════════════════════════ */}
      <section
        aria-label="Why choose Eventat"
        className="bg-[var(--color-surface)] py-20 px-4 sm:px-6"
      >
        <div className="max-w-5xl mx-auto">

          {/* Section heading */}
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-[var(--color-gold)] mb-3">
              Why Eventat
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-dark)] leading-tight">
              Everything you need,{' '}
              <span className="text-gradient-gold">in one place</span>
            </h2>
          </div>

          {/* Value prop cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {VALUE_PROPS.map(({ icon: Icon, title, desc }) => (
              <article
                key={title}
                className="group flex flex-col items-start gap-4 rounded-2xl bg-white p-8 border border-gray-100 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1.5 transition-all duration-300"
              >
                {/* Icon badge */}
                <div className="w-14 h-14 rounded-xl bg-[var(--color-gold)]/10 flex items-center justify-center group-hover:bg-[var(--color-gold)] transition-colors duration-300">
                  <Icon
                    size={26}
                    strokeWidth={1.75}
                    className="text-[var(--color-gold)] group-hover:text-white transition-colors duration-300"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[var(--color-dark)] mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>

                {/* Subtle bottom accent bar */}
                <div className="mt-auto pt-4 w-full">
                  <div className="h-0.5 w-8 rounded-full bg-[var(--color-gold)]/30 group-hover:w-full group-hover:bg-[var(--color-gold)]/60 transition-all duration-500 ease-out" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 4 — HOW IT WORKS (Step 2.4)
          Marketing pitch for guests visiting the landing page.
      ══════════════════════════════════════════════════════ */}
      <HowItWorks pageType="landing" />

      {/* ══════════════════════════════════════════════════════
          FOOTER CTA STRIP
      ══════════════════════════════════════════════════════ */}
      <section
        className="bg-[var(--color-dark)] py-16 px-4 sm:px-6 text-center"
        aria-label="Call to action"
      >
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
            Ready to plan something{' '}
            <span className="text-gradient-gold">unforgettable?</span>
          </h2>
          <p className="text-white/60 mb-8 text-base leading-relaxed">
            Join thousands of clients and vendors who trust Eventat to make their events extraordinary.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              variant="primary"
              onClick={() => navigate('/signup', { state: { role: 'customer' } })}
              rightIcon={<ArrowRight size={17} />}
              className="rounded-full px-8"
            >
              Join as a Client
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/signup', { state: { role: 'vendor' } })}
              className="rounded-full px-8 border-white/30 text-white hover:bg-white hover:text-[var(--color-dark)]"
            >
              Join as a Vendor
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Landing;
