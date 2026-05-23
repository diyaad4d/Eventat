/**
 * HowItWorks — Phase 1, Step 2.4
 * ─────────────────────────────────────────────────────────────
 * Reusable, auth-aware "How It Works" section.
 *
 * Props
 * ─────
 *   pageType  'landing' | 'home'   (required)
 *
 * Rendering logic
 * ───────────────
 *   pageType === 'landing'
 *   OR  !isAuthenticated            → Toggle tabs (Customer | Vendor)
 *                                     CTAs: Sign Up links
 *
 *   pageType === 'home'
 *   AND role === 'customer'         → Customer flow only
 *                                     CTA: "Start Planning" → /services
 *
 *   pageType === 'home'
 *   AND role === 'vendor'           → Vendor flow only
 *                                     CTA: "Go to Dashboard" → /vendor/dashboard
 * ─────────────────────────────────────────────────────────────
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  CalendarCheck,
  PartyPopper,
  ClipboardEdit,
  BadgeCheck,
  TrendingUp,
  Users,
  Store,
  LayoutDashboard,
  ArrowRight,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

// ─────────────────────────────────────────────────────────────
//  Static step data
// ─────────────────────────────────────────────────────────────
const CUSTOMER_STEPS = [
  {
    id: 'c1',
    icon: Search,
    title: 'Browse Verified Vendors',
    description:
      'Explore hundreds of pre-vetted vendors across every category — venues, catering, photography, entertainment and more. Filter by city, price, and rating.',
    tag: 'Discover',
  },
  {
    id: 'c2',
    icon: CalendarCheck,
    title: 'Book Your Date',
    description:
      'Select your event date, add services to your plan, send booking requests directly to vendors, and track every acceptance in real time.',
    tag: 'Book',
  },
  {
    id: 'c3',
    icon: PartyPopper,
    title: 'Celebrate Perfectly',
    description:
      'Show up and enjoy your event. Everything is coordinated through Eventat — your vendors are confirmed, your timeline is set.',
    tag: 'Celebrate',
  },
];

const VENDOR_STEPS = [
  {
    id: 'v1',
    icon: ClipboardEdit,
    title: 'List Your Services',
    description:
      'Create a stunning service profile — add photos, set pricing, define your capacity, and describe what makes your offering unique.',
    tag: 'List',
  },
  {
    id: 'v2',
    icon: BadgeCheck,
    title: 'Get Approved',
    description:
      'Our admin team reviews your profile to ensure quality standards are met. Once approved, you receive a Verified Vendor badge trusted by customers.',
    tag: 'Verified',
  },
  {
    id: 'v3',
    icon: TrendingUp,
    title: 'Grow Your Business',
    description:
      'Start receiving booking requests, manage them from your dashboard, collect reviews, and track your earnings — all in one place.',
    tag: 'Grow',
  },
];

// ─────────────────────────────────────────────────────────────
//  StepCard — single step in a flow
// ─────────────────────────────────────────────────────────────
function StepCard({ step, index, isCustomerTheme, isLast }) {
  const Icon = step.icon;

  return (
    <div className="relative flex flex-col items-center text-center group">

      {/* Connector line (desktop only, hidden on last card) */}
      {!isLast && (
        <div
          className={[
            'absolute top-[2.4rem] left-[calc(50%+2.85rem)] right-0 h-px hidden lg:block',
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
          'absolute -top-4 left-1/2 -translate-x-1/2 z-10',
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
          'shadow-[var(--shadow-card)] border',
          'transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[var(--shadow-card-hover)]',
          isCustomerTheme
            ? 'bg-[var(--color-gold)]/8 border-[var(--color-gold)]/20'
            : 'bg-[var(--color-dark)]/6 border-[var(--color-dark)]/12',
        ].join(' ')}
      >
        <Icon
          size={28}
          className={isCustomerTheme ? 'text-[var(--color-gold)]' : 'text-[var(--color-dark)]'}
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
//  StepsPanel — renders one complete flow (steps + CTA strip)
// ─────────────────────────────────────────────────────────────
function StepsPanel({ steps, isCustomerTheme, cta, panelId, tabId }) {
  return (
    <div
      className="animate-fade-in"
      id={panelId}
      role="tabpanel"
      aria-labelledby={tabId}
    >
      {/* Step cards */}
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


    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  HowItWorks — main export
//  pageType: 'landing' | 'home'
// ─────────────────────────────────────────────────────────────
function HowItWorks({ pageType = 'landing' }) {
  const { isAuthenticated, user } = useAuthStore();
  const role = user?.role ?? null;
  const firstName = user?.full_name?.split(' ')[0] ?? user?.username ?? null;

  // ── Determine display mode ───────────────────────────────
  // Show toggle when: landing page OR not logged in
  // Show single customer flow when: home + logged-in customer
  // Show single vendor flow when: home + logged-in vendor
  const showToggle = pageType === 'landing' || !isAuthenticated;

  // For single-flow modes (home + authenticated)
  const showCustomerOnly = pageType === 'home' && isAuthenticated && role === 'customer';
  const showVendorOnly   = pageType === 'home' && isAuthenticated && role === 'vendor';

  // Tab state (only relevant when showToggle is true)
  const [activeTab, setActiveTab] = useState('customer');

  // ── CTA config ───────────────────────────────────────────
  const customerCta = showCustomerOnly
    ? {
        headline: `Ready to start planning${firstName ? `, ${firstName}` : ''}?`,
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

  const vendorCta = showVendorOnly
    ? {
        headline: `Welcome back${firstName ? `, ${firstName}` : ''}!`,
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

  // ── Section subtitle adapts to context ──────────────────
  const subtitle =
    showCustomerOnly
      ? "Here's exactly how Eventat helps you plan your perfect event."
      : showVendorOnly
      ? "Here's how the Eventat vendor experience works — step by step."
      : "Whether you're planning a dream event or growing a business, we've made every step effortless.";

  return (
    <section
      className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface)] relative overflow-hidden"
      aria-labelledby="hiw-heading"
    >
      {/* ── Background blobs ──────────────────────────────── */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full opacity-[0.03] bg-[var(--color-gold)] blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-[0.03] bg-[var(--color-dark)] blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-5xl mx-auto relative">

        {/* ── Section heading ───────────────────────────────── */}
        <div className="text-center mb-10">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--color-gold)]">
            Simple Process
          </span>
          <h2
            id="hiw-heading"
            className="mt-2 text-3xl sm:text-4xl font-extrabold text-[var(--color-dark)] leading-tight"
          >
            How{' '}
            <span className="text-gradient-gold">Eventat Works</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-500 max-w-lg mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* ── MODE A: Toggle tabs (landing page OR guest) ──── */}
        {showToggle && (
          <>
            {/* Tab switcher */}
            <div
              className="flex justify-center mb-12"
              role="tablist"
              aria-label="Select user type"
            >
              <div className="relative flex items-center bg-white rounded-2xl p-1.5 shadow-[var(--shadow-card)] border border-gray-100">

                {/* Animated sliding pill */}
                <div
                  className={[
                    'absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-xl',
                    'transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
                    activeTab === 'customer'
                      ? 'left-1.5 bg-[var(--color-gold)]'
                      : 'left-[calc(50%+3px)] bg-[var(--color-dark)]',
                  ].join(' ')}
                  aria-hidden="true"
                />

                {/* Customer tab */}
                <button
                  role="tab"
                  id="hiw-tab-customer"
                  aria-selected={activeTab === 'customer'}
                  aria-controls="hiw-panel-customer"
                  onClick={() => setActiveTab('customer')}
                  className={[
                    'relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-xl',
                    'text-sm font-bold transition-colors duration-200',
                    'focus-visible:outline-none focus-visible:ring-2',
                    'focus-visible:ring-[var(--color-gold)] focus-visible:ring-offset-2',
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
                  id="hiw-tab-vendor"
                  aria-selected={activeTab === 'vendor'}
                  aria-controls="hiw-panel-vendor"
                  onClick={() => setActiveTab('vendor')}
                  className={[
                    'relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-xl',
                    'text-sm font-bold transition-colors duration-200',
                    'focus-visible:outline-none focus-visible:ring-2',
                    'focus-visible:ring-[var(--color-gold)] focus-visible:ring-offset-2',
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

            {/* Active panel (re-mounts on tab switch for fade-in) */}
            {activeTab === 'customer' && (
              <StepsPanel
                key="toggle-customer"
                steps={CUSTOMER_STEPS}
                isCustomerTheme={true}
                cta={customerCta}
                panelId="hiw-panel-customer"
                tabId="hiw-tab-customer"
              />
            )}
            {activeTab === 'vendor' && (
              <StepsPanel
                key="toggle-vendor"
                steps={VENDOR_STEPS}
                isCustomerTheme={false}
                cta={vendorCta}
                panelId="hiw-panel-vendor"
                tabId="hiw-tab-vendor"
              />
            )}
          </>
        )}

        {/* ── MODE B: Customer-only (home + logged-in customer) */}
        {showCustomerOnly && (
          <>
            {/* Journey badge */}
            <div className="flex justify-center mb-10">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/25 text-[var(--color-gold-dark)]">
                <Users size={13} aria-hidden="true" />
                Customer Journey
              </span>
            </div>
            <StepsPanel
              key="home-customer"
              steps={CUSTOMER_STEPS}
              isCustomerTheme={true}
              cta={customerCta}
              panelId="hiw-panel-customer"
              tabId=""
            />
          </>
        )}

        {/* ── MODE C: Vendor-only (home + logged-in vendor) ── */}
        {showVendorOnly && (
          <>
            {/* Journey badge */}
            <div className="flex justify-center mb-10">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-[var(--color-dark)]/8 border border-[var(--color-dark)]/15 text-[var(--color-dark)]">
                <LayoutDashboard size={13} aria-hidden="true" />
                Vendor Journey
              </span>
            </div>
            <StepsPanel
              key="home-vendor"
              steps={VENDOR_STEPS}
              isCustomerTheme={false}
              cta={vendorCta}
              panelId="hiw-panel-vendor"
              tabId=""
            />
          </>
        )}

      </div>
    </section>
  );
}

export default HowItWorks;
