import { useState } from 'react';
import {
  Search,
  CalendarCheck,
  PartyPopper,
  ClipboardEdit,
  BadgeCheck,
  TrendingUp,
  Users,
  Store,
  ArrowRight,
  LayoutDashboard,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

// ─────────────────────────────────────────────────────────────
//  Step data
// ─────────────────────────────────────────────────────────────
const CUSTOMER_STEPS = [
  {
    id: 1,
    icon: Search,
    title: 'Browse Verified Vendors',
    description:
      'Explore hundreds of pre-vetted vendors across every category — venues, catering, photography, entertainment and more. Filter by city, price, and rating.',
    tag: 'Discover',
  },
  {
    id: 2,
    icon: CalendarCheck,
    title: 'Book Your Date',
    description:
      'Select your event date, add services to your plan, send booking requests directly to vendors, and track every acceptance in real time.',
    tag: 'Book',
  },
  {
    id: 3,
    icon: PartyPopper,
    title: 'Celebrate Perfectly',
    description:
      'Show up and enjoy your event. Everything is coordinated through Eventat — your vendors are confirmed, your timeline is set.',
    tag: 'Celebrate',
  },
];

const VENDOR_STEPS = [
  {
    id: 1,
    icon: ClipboardEdit,
    title: 'List Your Services',
    description:
      'Create a stunning service profile — add photos, set pricing, define your capacity, and describe what makes your offering unique.',
    tag: 'List',
  },
  {
    id: 2,
    icon: BadgeCheck,
    title: 'Get Approved',
    description:
      'Our admin team reviews your profile to ensure quality standards are met. Once approved, you receive a Verified Vendor badge trusted by customers.',
    tag: 'Verified',
  },
  {
    id: 3,
    icon: TrendingUp,
    title: 'Grow Your Business',
    description:
      'Start receiving booking requests, manage them from your dashboard, collect reviews, and track your earnings — all in one place.',
    tag: 'Grow',
  },
];

// ─────────────────────────────────────────────────────────────
//  StepCard
// ─────────────────────────────────────────────────────────────
function StepCard({ step, index, isCustomerTheme, isLast }) {
  const Icon = step.icon;

  return (
    <div className="relative flex flex-col items-center text-center group">

      {/* Connector line — hidden on last card & mobile */}
      {!isLast && (
        <div
          className={[
            'absolute top-[2.5rem] left-[calc(50%+2.75rem)] right-0 h-px hidden lg:block',
            'bg-gradient-to-r',
            isCustomerTheme
              ? 'from-[var(--color-gold)]/50 to-[var(--color-gold)]/5'
              : 'from-[var(--color-dark)]/30 to-[var(--color-dark)]/5',
          ].join(' ')}
          aria-hidden="true"
        />
      )}

      {/* Step number badge */}
      <div
        className={[
          'absolute -top-3.5 left-1/2 -translate-x-1/2 z-10',
          'w-7 h-7 rounded-full flex items-center justify-center',
          'text-[11px] font-black text-white shadow-md ring-2 ring-white',
          isCustomerTheme ? 'bg-[var(--color-gold)]' : 'bg-[var(--color-dark)]',
        ].join(' ')}
        aria-label={`Step ${index + 1}`}
      >
        {index + 1}
      </div>

      {/* Icon box */}
      <div
        className={[
          'relative mt-5 w-[4.5rem] h-[4.5rem] rounded-2xl',
          'flex items-center justify-center',
          'shadow-[var(--shadow-card)] border transition-all duration-300',
          'group-hover:-translate-y-1.5 group-hover:shadow-[var(--shadow-card-hover)]',
          isCustomerTheme
            ? 'bg-[var(--color-gold)]/8 border-[var(--color-gold)]/20'
            : 'bg-[var(--color-dark)]/6 border-[var(--color-dark)]/12',
        ].join(' ')}
      >
        <Icon
          size={28}
          className={[
            'transition-colors duration-200',
            isCustomerTheme ? 'text-[var(--color-gold)]' : 'text-[var(--color-dark)]',
          ].join(' ')}
          aria-hidden="true"
        />
      </div>

      {/* Tag chip */}
      <span
        className={[
          'mt-3 inline-flex items-center px-2.5 py-0.5 rounded-full',
          'text-[10px] font-bold uppercase tracking-[0.15em]',
          isCustomerTheme
            ? 'bg-[var(--color-gold)]/10 text-[var(--color-gold-dark)]'
            : 'bg-[var(--color-dark)]/8 text-[var(--color-dark-soft)]',
        ].join(' ')}
      >
        {step.tag}
      </span>

      <h3 className="mt-2.5 text-[15px] font-extrabold text-[var(--color-dark)] leading-snug px-3">
        {step.title}
      </h3>

      <p className="mt-2 text-sm text-gray-500 leading-relaxed max-w-[215px]">
        {step.description}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  StepsPanel — reusable panel for a given flow
// ─────────────────────────────────────────────────────────────
function StepsPanel({ steps, isCustomerTheme, cta }) {
  return (
    <div className="animate-fade-in">
      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-6 relative">
        {steps.map((step, i) => (
          <StepCard
            key={step.id}
            step={step}
            index={i}
            isCustomerTheme={isCustomerTheme}
            isLast={i === steps.length - 1}
          />
        ))}
      </div>

      {/* CTA strip */}
      <div
        className={[
          'mt-12 flex flex-col sm:flex-row items-center justify-between gap-5',
          'rounded-2xl px-7 py-5 border',
          isCustomerTheme
            ? 'bg-gradient-to-r from-[var(--color-gold)]/8 via-[var(--color-gold)]/4 to-transparent border-[var(--color-gold)]/20'
            : 'bg-gradient-to-r from-[var(--color-dark)]/6 via-[var(--color-dark)]/3 to-transparent border-[var(--color-dark)]/10',
        ].join(' ')}
      >
        <div className="text-center sm:text-left">
          <p className="text-sm font-semibold text-[var(--color-dark)]">{cta.headline}</p>
          <p className="text-xs text-gray-500 mt-0.5">{cta.sub}</p>
        </div>

        <Link
          to={cta.path}
          className={[
            'group inline-flex items-center gap-2 shrink-0',
            'px-6 py-3 rounded-xl text-sm font-bold text-white',
            'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
            isCustomerTheme
              ? 'bg-[var(--color-gold)] hover:bg-[var(--color-gold-dark)] shadow-[0_4px_14px_rgba(201,162,77,0.35)] hover:shadow-[0_6px_20px_rgba(201,162,77,0.45)] focus-visible:ring-[var(--color-gold)]'
              : 'bg-[var(--color-dark)] hover:bg-[var(--color-dark-soft)] shadow-[0_4px_14px_rgba(44,44,44,0.2)] hover:shadow-[0_6px_20px_rgba(44,44,44,0.3)] focus-visible:ring-[var(--color-dark)]',
          ].join(' ')}
          aria-label={cta.label}
        >
          {cta.label}
          <ArrowRight
            size={16}
            className="transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  HowItWorks — Step 2.4
//  Auth-aware rendering:
//    · Guest               → Toggle tabs (Customer | Vendor)
//    · Authenticated customer → Customer-only flow, CTA = /services
//    · Authenticated vendor   → Vendor-only flow, CTA = /vendor/dashboard
// ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const { isAuthenticated, user } = useAuthStore();
  const role = user?.role ?? null;

  // Tabs are only needed for guests
  const [activeTab, setActiveTab] = useState('customer');

  // ── Determine which flow(s) to show ─────────────────────────
  const showToggle   = !isAuthenticated;
  const showCustomer = !isAuthenticated ? activeTab === 'customer' : role === 'customer';
  const showVendor   = !isAuthenticated ? activeTab === 'vendor'   : role === 'vendor';

  // ── CTA config per scenario ─────────────────────────────────
  const customerCta = isAuthenticated
    ? {
        headline: `Ready to start planning, ${user?.full_name?.split(' ')[0] ?? 'there'}?`,
        sub: 'Browse our full catalogue of verified vendors.',
        path: '/services',
        label: 'Start Planning',
      }
    : {
        headline: 'Ready to plan your perfect event?',
        sub: 'Join thousands of happy customers who trusted Eventat.',
        path: '/signup',
        label: 'Sign Up as Customer',
      };

  const vendorCta = isAuthenticated
    ? {
        headline: `Welcome back, ${user?.full_name?.split(' ')[0] ?? 'Vendor'}!`,
        sub: 'Head to your dashboard to manage bookings and services.',
        path: '/vendor/dashboard',
        label: 'Go to Dashboard',
      }
    : {
        headline: 'Ready to grow your event business?',
        sub: "Join 500+ verified vendors on Jordan's leading event marketplace.",
        path: '/signup?role=vendor',
        label: 'Become a Vendor',
      };

  // ── Heading copy adapts to auth state ───────────────────────
  const headingSub = isAuthenticated
    ? role === 'vendor'
      ? "Here's how the Eventat vendor experience works, step by step."
      : "Here's how Eventat helps you plan your perfect event."
    : "Whether you're planning a dream event or growing your event business, we've made every step effortless.";

  return (
    <section
      className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface)] relative overflow-hidden"
      aria-labelledby="how-it-works-heading"
    >
      {/* ── Background decorations ────────────────────────────── */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full opacity-[0.032] bg-[var(--color-gold)] blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-[0.035] bg-[var(--color-dark)] blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-5xl mx-auto relative">

        {/* ── Heading ───────────────────────────────────────────── */}
        <div className="text-center mb-10">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--color-gold)]">
            Simple Process
          </span>
          <h2
            id="how-it-works-heading"
            className="mt-2 text-3xl sm:text-4xl font-extrabold text-[var(--color-dark)] leading-tight"
          >
            How{' '}
            <span className="text-gradient-gold">Eventat Works</span>
          </h2>
          <p className="mt-3 text-gray-500 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            {headingSub}
          </p>
        </div>

        {/* ── Toggle tabs — guests only ─────────────────────────── */}
        {showToggle && (
          <div
            className="flex justify-center mb-12"
            role="tablist"
            aria-label="Select user type"
          >
            <div className="relative flex items-center bg-white rounded-2xl p-1.5 shadow-[var(--shadow-card)] border border-gray-100 gap-0">

              {/* Sliding pill */}
              <div
                className={[
                  'absolute top-1.5 bottom-1.5 rounded-xl transition-all duration-300',
                  'ease-[cubic-bezier(0.34,1.56,0.64,1)]',
                  activeTab === 'customer'
                    ? 'left-1.5 bg-[var(--color-gold)] w-[calc(50%-6px)]'
                    : 'left-[calc(50%+3px)] bg-[var(--color-dark)] w-[calc(50%-6px)]',
                ].join(' ')}
                aria-hidden="true"
              />

              {/* Customer tab */}
              <button
                role="tab"
                id="tab-customer"
                aria-selected={activeTab === 'customer'}
                aria-controls="panel-how-customer"
                onClick={() => setActiveTab('customer')}
                className={[
                  'relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-xl',
                  'text-sm font-bold transition-colors duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] focus-visible:ring-offset-2',
                  activeTab === 'customer'
                    ? 'text-white'
                    : 'text-gray-500 hover:text-[var(--color-dark)]',
                ].join(' ')}
              >
                <Users size={15} aria-hidden="true" />
                For Customers
              </button>

              {/* Vendor tab */}
              <button
                role="tab"
                id="tab-vendor"
                aria-selected={activeTab === 'vendor'}
                aria-controls="panel-how-vendor"
                onClick={() => setActiveTab('vendor')}
                className={[
                  'relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-xl',
                  'text-sm font-bold transition-colors duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] focus-visible:ring-offset-2',
                  activeTab === 'vendor'
                    ? 'text-white'
                    : 'text-gray-500 hover:text-[var(--color-dark)]',
                ].join(' ')}
              >
                <Store size={15} aria-hidden="true" />
                For Vendors
              </button>
            </div>
          </div>
        )}

        {/* ── Authenticated: role label badge ───────────────────── */}
        {isAuthenticated && role && (
          <div className="flex justify-center mb-10">
            <span
              className={[
                'inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold',
                'border backdrop-blur-sm',
                role === 'customer'
                  ? 'bg-[var(--color-gold)]/10 border-[var(--color-gold)]/25 text-[var(--color-gold-dark)]'
                  : 'bg-[var(--color-dark)]/8 border-[var(--color-dark)]/15 text-[var(--color-dark)]',
              ].join(' ')}
            >
              {role === 'customer' ? (
                <><Users size={13} aria-hidden="true" /> Customer Journey</>
              ) : (
                <><LayoutDashboard size={13} aria-hidden="true" /> Vendor Journey</>
              )}
            </span>
          </div>
        )}

        {/* ── Panel: Customer ───────────────────────────────────── */}
        {showCustomer && (
          <div
            key={`customer-${activeTab}`}
            id="panel-how-customer"
            role="tabpanel"
            aria-labelledby="tab-customer"
          >
            <StepsPanel
              steps={CUSTOMER_STEPS}
              isCustomerTheme={true}
              cta={customerCta}
            />
          </div>
        )}

        {/* ── Panel: Vendor ─────────────────────────────────────── */}
        {showVendor && (
          <div
            key={`vendor-${activeTab}`}
            id="panel-how-vendor"
            role="tabpanel"
            aria-labelledby="tab-vendor"
          >
            <StepsPanel
              steps={VENDOR_STEPS}
              isCustomerTheme={false}
              cta={vendorCta}
            />
          </div>
        )}

      </div>
    </section>
  );
}

export default HowItWorks;
