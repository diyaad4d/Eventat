import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye, EyeOff, Edit2, Save, Camera, Plus,
  MapPin, Star, BadgeCheck, Phone, Mail, Globe,
  Calendar, Award, Briefcase, Settings,
  ClipboardList, TrendingUp, CheckCircle2,
  LayoutDashboard, CreditCard, Building2,
  User, ArrowRight, Wallet, Receipt, Shield, Info
} from 'lucide-react';
import PageTransition from '../../components/shared/PageTransition';
import { toastSuccess } from '../../utils/toast';

const INITIAL_PROFILE = {
  name:               'Royal Hotels & Resorts',
  tagline:            'Crafting unforgettable moments since 2010',
  avatar:             'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&q=80',
  cover:              'https://images.unsplash.com/photo-1519741497674-611481863552?w=1400&q=80',
  city:               'Amman, Jordan',
  category:           'Venue',
  phone:              '+962 7 8123 4567',
  email:              'events@royalhotels.jo',
  website:            'www.royalhotels.jo',
  instagram:          'royalhotels_jo',
  facebook:           'RoyalHotelsJordan',
  about:              'Royal Hotels & Resorts has been one of Jordan\'s premier event venue providers since 2010. We specialize in grand weddings, prestigious corporate galas, and milestone celebrations.\n\nOur dedicated team works tirelessly to ensure every detail is flawless.',
  isVerified:         true,
  memberSince:        'March 2020',
  responseTime:       'Within 2 hours',
  rating:             4.8,
  reviewCount:        124,
  totalEvents:        231,
  // ── NEW: Business & Banking fields ──
  vendorType:         'company',   // 'company' | 'freelancer'
  signatoryName:      'Khalid Al-Mansour',
  iban:               'JO94CBJO0010000000000131000302',
  ibanMasked:         '•••• •••• •••• 0302',
  commissionRate:     10,            // platform commission %
  // Mock escrow balance (would come from backend)
  escrowBalance:      3200,
  pendingPayouts:     1400,
  totalEarned:        28500,
  
  hasPendingChanges:  false,
  pendingData:        null,
};

const MOCK_MY_SERVICES = [
  {
    id: 's1', title: 'Grand Royal Ballroom',
    category: 'Venue', price: 1500, pricingUnit: 'per_event',
    isActive: true, bookingsCount: 24,
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80',
  },
  {
    id: 's2', title: 'The Pearl Ballroom',
    category: 'Venue', price: 1200, pricingUnit: 'per_event',
    isActive: true, bookingsCount: 18,
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&q=80',
  },
  {
    id: 's3', title: 'Rooftop Garden Terrace',
    category: 'Venue', price: 800, pricingUnit: 'per_event',
    isActive: false, bookingsCount: 5,
    image: 'https://images.unsplash.com/photo-1525258946800-98ccd7a0ea00?w=400&q=80',
  },
];

// ─────────────────────────────────────────────────────────────
//  PaymentBankingTab — Earnings, Banking & Payouts panel
// ─────────────────────────────────────────────────────────────
function PaymentBankingTab({ profile }) {
  const [showIban, setShowIban] = useState(false);

  return (
    <div className="max-w-3xl space-y-6">

      {/* ── Header ── */}
      <div>
        <h2 className="text-lg font-extrabold text-[var(--color-dark)]">
          Earnings & Banking
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          View your escrow balance, IBAN details, and payout history.
        </p>
      </div>

      {/* ── Earnings Stats Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: 'Escrow Balance',
            value: `${profile.escrowBalance.toLocaleString()} JOD`,
            sublabel: 'Held from active bookings',
            color: 'text-amber-600',
            bgColor: 'bg-amber-50 border-amber-100',
            icon: <Shield size={18} className="text-amber-500" />,
          },
          {
            label: 'Pending Payouts',
            value: `${profile.pendingPayouts.toLocaleString()} JOD`,
            sublabel: 'Awaiting event confirmation',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 border-blue-100',
            icon: <CreditCard size={18} className="text-blue-500" />,
          },
          {
            label: 'Total Earned',
            value: `${profile.totalEarned.toLocaleString()} JOD`,
            sublabel: 'All-time net payouts',
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50 border-emerald-100',
            icon: <Award size={18} className="text-emerald-500" />,
          },
        ].map((stat) => (
          <div key={stat.label} className={`flex items-start gap-3 p-5 rounded-2xl border ${stat.bgColor}`}>
            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
              {stat.icon}
            </div>
            <div>
              <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-xs font-bold text-[var(--color-dark)] mt-0.5">{stat.label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{stat.sublabel}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Commission rate info ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
        <h3 className="font-bold text-[var(--color-dark)] pb-3 border-b border-gray-100 flex items-center gap-2">
          <CreditCard size={16} className="text-[var(--color-gold)]" />
          Commission & Payouts
        </h3>
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex-1">
            <p className="text-sm font-bold text-[var(--color-dark)]">Platform Commission Rate</p>
            <p className="text-xs text-gray-500 mt-0.5">Deducted automatically from each confirmed booking</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-[var(--color-gold)]">{profile.commissionRate}%</p>
            <p className="text-xs text-gray-400">You keep <span className="font-bold text-emerald-600">{100 - profile.commissionRate}%</span></p>
          </div>
        </div>
        <div className="flex items-start gap-2.5 p-3 bg-blue-50 border border-blue-100 rounded-xl">
          <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700">
            Customers choose their payment method at booking time. Eventat automatically handles the commission split and releases your payout after event confirmation.
          </p>
        </div>
      </div>

      {/* ── Bank Account (IBAN) ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h3 className="font-bold text-[var(--color-dark)] pb-3 border-b border-gray-100 flex items-center gap-2">
          <Building2 size={16} className="text-[var(--color-gold)]" />
          Bank Account
        </h3>

        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">IBAN</p>
            <button
              type="button"
              onClick={() => setShowIban((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-gold)] hover:underline"
            >
              {showIban ? <><EyeOff size={12} /> Hide</> : <><Eye size={12} /> Reveal</>}
            </button>
          </div>
          <p className="text-base font-bold text-[var(--color-dark)] font-mono tracking-wider break-all">
            {showIban ? profile.iban : profile.ibanMasked}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500 pt-1 border-t border-gray-200">
            <User size={12} />
            Account name: <span className="font-semibold text-[var(--color-dark)]">{profile.signatoryName}</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-100 rounded-xl">
          <Info size={14} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">
            Your IBAN must always match the name on your{' '}
            {profile.vendorType === 'company' ? 'Commercial Register' : 'National ID'}.
            To update your IBAN, please contact Eventat support with a new bank statement.
          </p>
        </div>

        <button
          type="button"
          className="w-full py-2.5 border border-gray-200 text-gray-500 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors"
        >
          Request IBAN Update
        </button>
      </div>

      {/* ── Payout History (placeholder) ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-[var(--color-dark)] mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-[var(--color-gold)]" />
          Recent Payouts
        </h3>
        <div className="flex flex-col gap-3">
          {[
            { date: '2026-05-20', amount: 1350, ref: 'PAY-001', status: 'completed' },
            { date: '2026-05-15', amount: 2700, ref: 'PAY-002', status: 'completed' },
            { date: '2026-05-08', amount: 720,  ref: 'PAY-003', status: 'completed' },
          ].map((payout) => (
            <div key={payout.ref} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div>
                <p className="text-sm font-bold text-[var(--color-dark)]">
                  {payout.amount.toLocaleString()} JOD
                </p>
                <p className="text-[10px] text-gray-400">{payout.date} · Ref: {payout.ref}</p>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                ✓ Completed
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VendorProfile() {
  const [profile,    setProfile]    = useState(INITIAL_PROFILE);
  const [editData,   setEditData]   = useState(INITIAL_PROFILE);
  const [isEditing,  setIsEditing]  = useState(false);
  const [activeTab,  setActiveTab]  = useState('overview');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const coverInputRef = useRef(null);
  const avatarInputRef = useRef(null);

  const handleImageUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setEditData(d => ({ ...d, [field]: URL.createObjectURL(file) }));
    }
  };

  const handleSave = () => {
    setProfile(prev => ({
      ...prev,
      hasPendingChanges: true,
      pendingData: editData
    }));
    setIsEditing(false);
    setSaveSuccess(true);
    toastSuccess("Profile updated successfully! 🎉");
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCancel = () => {
    setEditData(profile);
    setIsEditing(false);
  };

  const TABS = [
    { id: 'overview',  label: 'Overview',         icon: <LayoutDashboard size={15}/> },
    { id: 'services',  label: 'My Services',      icon: <Briefcase size={15}/>       },
    { id: 'payment',   label: 'Payment & Banking', icon: <CreditCard size={15}/>      },
    { id: 'settings',  label: 'Profile Info',     icon: <Settings size={15}/>        },
  ];

  return (
    <PageTransition className="w-full max-w-6xl mx-auto pb-16">

      {/* ══ TOP ACTION BAR ══ */}
      <div className="flex flex-col sm:flex-row sm:items-center 
        justify-between gap-4 mb-6">
        <div>
          <p className="text-[11px] font-bold text-[var(--color-gold)] 
            uppercase tracking-[0.18em] mb-1">Vendor Dashboard</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold 
            text-[var(--color-dark)]">My Store</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage how customers see your business.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 shrink-0">
          {saveSuccess && (
            <span className="flex items-center gap-1.5 text-sm 
              font-bold text-emerald-600 bg-emerald-50 px-3 py-2 
              rounded-xl border border-emerald-200">
              <CheckCircle2 size={15}/> Saved!
            </span>
          )}
          {profile.hasPendingChanges && (
            <span className="flex items-center gap-1.5 text-sm 
              font-bold text-amber-700 bg-amber-50 px-3 py-2 
              rounded-xl border border-amber-200">
              <Info size={15}/> Changes pending review
            </span>
          )}
          <button
            type="button"
            onClick={() => window.open('/vendors/v1', '_blank', 'noopener,noreferrer')}
            className="flex items-center justify-center gap-2 px-6 py-2.5 min-h-[44px] bg-white border border-[var(--color-gold)] text-[var(--color-gold)] text-sm font-bold rounded-full hover:bg-[var(--color-gold)] hover:text-white transition-colors cursor-pointer select-none"
          >
            <Eye size={15}/> Preview Public Page
          </button>
          {!isEditing ? (
            <button
              type="button"
              onClick={() => {setEditData(profile); setIsEditing(true); setActiveTab('settings'); }}
              className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] 
                bg-[var(--color-gold)] text-white text-sm font-bold 
                rounded-xl hover:bg-[var(--color-gold-dark)] 
                shadow-sm transition-colors"
            >
              <Edit2 size={15}/> Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 
                  text-sm font-bold rounded-xl hover:bg-gray-200 
                  transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2.5 
                  bg-[var(--color-gold)] text-white text-sm font-bold 
                  rounded-xl hover:bg-[var(--color-gold-dark)] 
                  transition-colors"
              >
                <Save size={15}/> Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {profile.hasPendingChanges && !isEditing && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800">Your profile changes are under review</p>
            <p className="text-sm text-amber-700 mt-1">An admin is reviewing your recent updates. Your public profile will reflect the changes once approved.</p>
          </div>
        </div>
      )}

      {/* ══ COVER + AVATAR SECTION ══ */}
      <div className="relative mb-6">
        {/* Cover image */}
        <div className="relative w-full h-48 sm:h-64 rounded-2xl 
          overflow-hidden border border-gray-200">
          <img src={profile.cover} alt="Cover"
            className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t 
            from-black/40 to-transparent" />
          {isEditing && (
            <>
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="absolute bottom-3 right-3 flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-sm text-[var(--color-dark)] text-xs font-bold rounded-xl hover:bg-white transition-colors"
              >
                <Camera size={13}/> Change Cover
              </button>
              <input type="file" accept="image/*" className="hidden" ref={coverInputRef} onChange={(e) => handleImageUpload(e, 'cover')} />
            </>
          )}
        </div>

        {/* Avatar — overlaps cover */}
        <div className="absolute bottom-0 left-6 translate-y-1/2">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28">
            <img src={profile.avatar} alt={profile.name}
              className="w-full h-full rounded-2xl object-cover 
                border-4 border-white shadow-lg" />
            {isEditing && (
              <>
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-[var(--color-gold)] text-white rounded-full flex items-center justify-center shadow-md hover:bg-[var(--color-gold-dark)] transition-colors"
                >
                  <Camera size={14}/>
                </button>
                <input type="file" accept="image/*" className="hidden" ref={avatarInputRef} onChange={(e) => handleImageUpload(e, 'avatar')} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Spacer for avatar overlap */}
      <div className="h-14 sm:h-16" />

      {/* ══ NAME + BADGES ROW ══ */}
      <div className="flex flex-col sm:flex-row sm:items-start 
        justify-between gap-4 mb-8">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-[var(--color-dark)]">
              {profile.name}
            </h2>
            {profile.isVerified && (
              <span className="flex items-center gap-1 px-2.5 py-1 
                bg-[var(--color-gold)]/10 text-[var(--color-gold-dark)] 
                text-xs font-bold rounded-full border 
                border-[var(--color-gold)]/30">
                <BadgeCheck size={12}/> Verified
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">{profile.tagline}</p>
          <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <MapPin size={12} className="text-[var(--color-gold)]"/>
              {profile.city}
            </span>
            <span className="flex items-center gap-1">
              <Star size={12} fill="var(--color-gold)" 
                color="var(--color-gold)"/>
              {profile.rating} ({profile.reviewCount} reviews)
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={12} className="text-[var(--color-gold)]"/>
              Since {profile.memberSince}
            </span>
          </div>
        </div>

        {/* Stats mini row */}
        <div className="flex flex-wrap gap-6 shrink-0 mt-4 sm:mt-0">
          {[
            { label: 'Events',   value: profile.totalEvents + '+' },
            { label: 'Services', value: MOCK_MY_SERVICES.filter(s=>s.isActive).length },
            { label: 'Reviews',  value: profile.reviewCount },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <p className="text-xl font-black text-[var(--color-dark)]">
                {stat.value}
              </p>
              <p className="text-xs text-gray-400 font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ══ TABS ══ */}
      <div className="flex gap-1 border-b border-gray-200 mb-8">
        {TABS.map(tab => (
          <button key={tab.id} type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 min-h-[44px] text-sm 
              font-bold transition-all border-b-2 -mb-px
              ${activeTab === tab.id
                ? 'border-[var(--color-gold)] text-[var(--color-gold)]'
                : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ══ TAB: OVERVIEW ══ */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: About + quick stats */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Profile completeness bar */}
            <div className="bg-white rounded-2xl border border-gray-100 
              shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-[var(--color-dark)] text-sm">
                  Profile Completeness
                </h3>
                <span className="text-sm font-black text-[var(--color-gold)]">
                  85%
                </span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full w-[85%] rounded-full 
                  bg-gradient-to-r from-[#E8C97A] to-[#C9A24D]" />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Add a website link to reach 100%
              </p>
            </div>

            {/* About section */}
            <div className="bg-white rounded-2xl border border-gray-100 
              shadow-sm p-6">
              <h3 className="font-bold text-[var(--color-dark)] mb-4">
                About Your Business
              </h3>
              {profile.about.split('\n\n').map((para, i) => (
                <p key={i} className="text-sm text-gray-600 
                  leading-relaxed mb-3 last:mb-0">
                  {para}
                </p>
              ))}
              <button
                type="button"
                onClick={() => { setActiveTab('settings'); setIsEditing(true); }}
                className="mt-4 text-xs font-bold text-[var(--color-gold)] 
                  hover:underline min-h-[44px] inline-flex items-center"
              >
                Edit About →
              </button>
            </div>

            {/* Active services preview */}
            <div className="bg-white rounded-2xl border border-gray-100 
              shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[var(--color-dark)]">
                  Active Services
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('services')}
                  className="text-xs font-bold text-[var(--color-gold)] 
                    hover:underline min-h-[44px] inline-flex items-center"
                >
                  Manage All →
                </button>
              </div>
              <div className="flex flex-col gap-3">
                {MOCK_MY_SERVICES.filter(s => s.isActive).map(srv => (
                  <div key={srv.id}
                    className="flex items-center gap-4 p-3 
                      bg-gray-50 rounded-xl hover:bg-gray-100 
                      transition-colors">
                    <img src={srv.image} alt={srv.title}
                      className="w-14 h-14 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-[var(--color-dark)] 
                        truncate">{srv.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {srv.price} JOD · {srv.pricingUnit.replace('_',' ')}
                        · {srv.bookingsCount} bookings
                      </p>
                    </div>
                    <span className="shrink-0 w-2 h-2 rounded-full 
                      bg-emerald-500" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Contact + quick links */}
          <div className="flex flex-col gap-6">

            {/* Contact card */}
            <div className="bg-white rounded-2xl border border-gray-100 
              shadow-sm p-6">
              <h3 className="font-bold text-[var(--color-dark)] mb-4">
                Contact Info
              </h3>
              <div className="flex flex-col gap-3">
                {[
                  { icon:<Phone size={15}/>, label:'Phone', value: profile.phone, color:'bg-emerald-50 text-emerald-600' },
                  { icon:<Mail size={15}/>, label:'Email', value: profile.email, color:'bg-blue-50 text-blue-600' },
                  { icon:<Globe size={15}/>, label:'Website', value: profile.website, color:'bg-purple-50 text-purple-600' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center 
                      justify-center shrink-0 ${item.color}`}>
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-gray-400 
                        uppercase tracking-wide">{item.label}</p>
                      <p className="text-sm font-semibold text-[var(--color-dark)] 
                        truncate">{item.value || '—'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-2xl border border-gray-100 
              shadow-sm p-6">
              <h3 className="font-bold text-[var(--color-dark)] mb-4">
                Quick Actions
              </h3>
              <div className="flex flex-col gap-3">
                <Link to="/vendor/services/new"
                  className="flex items-center gap-3 p-3 bg-[var(--color-gold)]/8 
                    border border-[var(--color-gold)]/20 rounded-xl 
                    hover:bg-[var(--color-gold)]/15 transition-colors">
                  <Plus size={16} className="text-[var(--color-gold)]"/>
                  <span className="text-sm font-bold text-[var(--color-dark)]">
                    Add New Service
                  </span>
                </Link>
                <Link to="/vendor/bookings"
                  className="flex items-center gap-3 p-3 bg-gray-50 
                    border border-gray-200 rounded-xl hover:bg-gray-100 
                    transition-colors">
                  <ClipboardList size={16} className="text-gray-500"/>
                  <span className="text-sm font-bold text-[var(--color-dark)]">
                    View Bookings
                  </span>
                </Link>
                <Link to="/vendor/analytics"
                  className="flex items-center gap-3 p-3 bg-gray-50 
                    border border-gray-200 rounded-xl hover:bg-gray-100 
                    transition-colors">
                  <TrendingUp size={16} className="text-gray-500"/>
                  <span className="text-sm font-bold text-[var(--color-dark)]">
                    View Analytics
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => window.open('/vendors/v1', '_blank', 'noopener,noreferrer')}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-[var(--color-gold)] text-[var(--color-gold)] text-sm font-bold rounded-full hover:bg-[var(--color-gold)] hover:text-white transition-colors cursor-pointer w-full select-none"
                >
                  <Eye size={15}/> Preview Public Page
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ TAB: MY SERVICES ══ */}
      {activeTab === 'services' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-extrabold text-[var(--color-dark)]">
                My Services
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {MOCK_MY_SERVICES.filter(s=>s.isActive).length} active · 
                {MOCK_MY_SERVICES.filter(s=>!s.isActive).length} inactive
              </p>
            </div>
            <Link to="/vendor/services/new"
              className="flex items-center gap-2 px-4 py-2.5 
                bg-[var(--color-gold)] text-white text-sm font-bold 
                rounded-xl hover:bg-[var(--color-gold-dark)] 
                shadow-sm transition-colors">
              <Plus size={15}/> Add Service
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 
            lg:grid-cols-3 gap-5">
            {MOCK_MY_SERVICES.map(srv => (
              <div key={srv.id}
                className="bg-white rounded-2xl border border-gray-100 
                  shadow-sm overflow-hidden hover:shadow-md 
                  transition-shadow">
                {/* Image */}
                <div className="relative h-40 overflow-hidden">
                  <img src={srv.image} alt={srv.title}
                    className="w-full h-full object-cover" />
                  {/* Status badge */}
                  <span className={`absolute top-3 left-3 text-[10px] 
                    font-bold px-2.5 py-1 rounded-full border
                    ${srv.isActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                    {srv.isActive ? '● Active' : '○ Inactive'}
                  </span>
                </div>

                {/* Body */}
                <div className="p-4">
                  <h3 className="font-bold text-[var(--color-dark)] 
                    text-sm mb-1 truncate">{srv.title}</h3>
                  <p className="text-xs text-gray-500 mb-3">
                    {srv.price} JOD · {srv.pricingUnit.replace('_',' ')}
                  </p>
                  <div className="flex items-center justify-between 
                    text-xs text-gray-400 mb-4">
                    <span>{srv.bookingsCount} bookings</span>
                    <span className="font-bold text-[var(--color-gold-dark)]">
                      {srv.category}
                    </span>
                  </div>
                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link to={`/vendor/services/${srv.id}/edit`}
                      className="flex-1 flex items-center justify-center 
                        gap-1.5 py-2 bg-gray-100 text-gray-700 text-xs 
                        font-bold rounded-lg hover:bg-gray-200 
                        transition-colors">
                      <Edit2 size={13}/> Edit
                    </Link>
                    <Link to={`/services/${srv.id}`} target="_blank"
                      className="flex-1 flex items-center justify-center 
                        gap-1.5 py-2 bg-[var(--color-gold)]/10 
                        text-[var(--color-gold-dark)] text-xs font-bold 
                        rounded-lg hover:bg-[var(--color-gold)]/20 
                        transition-colors">
                      <Eye size={13}/> View
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {/* Add new service card */}
            <Link to="/vendor/services/new"
              className="bg-white rounded-2xl border-2 border-dashed 
                border-gray-200 hover:border-[var(--color-gold)] 
                flex flex-col items-center justify-center p-8 gap-3 
                transition-colors group min-h-[280px]">
              <div className="w-12 h-12 rounded-full bg-gray-100 
                group-hover:bg-[var(--color-gold)]/10 flex items-center 
                justify-center transition-colors">
                <Plus size={22} className="text-gray-400 
                  group-hover:text-[var(--color-gold)] transition-colors"/>
              </div>
              <p className="text-sm font-bold text-gray-400 
                group-hover:text-[var(--color-gold)] transition-colors 
                text-center">
                Add New Service
              </p>
            </Link>
          </div>
        </div>
      )}

      {/* ══ TAB: PAYMENT & BANKING ══ */}
      {activeTab === 'payment' && (
        <PaymentBankingTab profile={profile} />
      )}

      {/* ══ TAB: PROFILE INFO (EDIT) ══ */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left column */}
          <div className="flex flex-col gap-6">

            {/* Basic Info */}
            <div className="bg-white rounded-2xl border border-gray-100 
              shadow-sm p-6">
              <h3 className="font-bold text-[var(--color-dark)] mb-5 
                pb-3 border-b border-gray-100">
                Basic Information
              </h3>
              <div className="flex flex-col gap-4">
                {[
                  { label:'Business Name', key:'name', type:'text', placeholder:'Your business name' },
                  { label:'Tagline', key:'tagline', type:'text', placeholder:'Short description' },
                  { label:'City / Location', key:'city', type:'text', placeholder:'Amman, Jordan' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-xs font-bold text-gray-500 
                      uppercase tracking-wider mb-1.5">
                      {field.label}
                    </label>
                    {isEditing ? (
                      <input
                        type={field.type}
                        value={editData[field.key]}
                        onChange={e => setEditData(d => 
                          ({...d, [field.key]: e.target.value}))}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-2.5 border border-gray-200 
                          rounded-xl outline-none focus:ring-2 
                          focus:ring-[var(--color-gold)] text-sm 
                          transition-all"
                      />
                    ) : (
                      <p className="text-sm font-semibold 
                        text-[var(--color-dark)] px-4 py-2.5 
                        bg-gray-50 rounded-xl">
                        {profile[field.key] || '—'}
                      </p>
                    )}
                  </div>
                ))}

                {/* About textarea */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 
                    uppercase tracking-wider mb-1.5">
                    About Your Business
                  </label>
                  {isEditing ? (
                    <textarea
                      rows={5}
                      value={editData.about}
                      onChange={e => setEditData(d => 
                        ({...d, about: e.target.value}))}
                      placeholder="Describe your business..."
                      className="w-full px-4 py-2.5 border border-gray-200 
                        rounded-xl outline-none focus:ring-2 
                        focus:ring-[var(--color-gold)] text-sm resize-none 
                        transition-all"
                    />
                  ) : (
                    <p className="text-sm text-gray-600 px-4 py-2.5 
                      bg-gray-50 rounded-xl leading-relaxed line-clamp-4">
                      {profile.about}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">

            {/* Contact Info */}
            <div className="bg-white rounded-2xl border border-gray-100 
              shadow-sm p-6">
              <h3 className="font-bold text-[var(--color-dark)] mb-5 
                pb-3 border-b border-gray-100">
                Contact Information
              </h3>
              <div className="flex flex-col gap-4">
                {[
                  { label:'Phone', key:'phone', placeholder:'+962 7 XXXX XXXX', icon:<Phone size={14}/> },
                  { label:'Email', key:'email', placeholder:'you@domain.com', icon:<Mail size={14}/> },
                  { label:'Website', key:'website', placeholder:'www.yoursite.com', icon:<Globe size={14}/> },
                  { label:'Instagram', key:'instagram', placeholder:'@handle', icon:<Globe size={14}/> },
                  { label:'Facebook', key:'facebook', placeholder:'Page name', icon:<Globe size={14}/> },
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-xs font-bold text-gray-500 
                      uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      {field.icon} {field.label}
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData[field.key] ?? 
                          editData.socialLinks?.[field.key] ?? ''}
                        onChange={e => {
                          if (field.key === 'instagram' || 
                              field.key === 'facebook') {
                            setEditData(d => ({
                              ...d,
                              socialLinks: {
                                ...d.socialLinks,
                                [field.key]: e.target.value,
                              }
                            }));
                          } else {
                            setEditData(d => 
                              ({...d, [field.key]: e.target.value}));
                          }
                        }}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-2.5 border border-gray-200 
                          rounded-xl outline-none focus:ring-2 
                          focus:ring-[var(--color-gold)] text-sm 
                          transition-all"
                      />
                    ) : (
                      <p className="text-sm font-semibold 
                        text-[var(--color-dark)] px-4 py-2.5 
                        bg-gray-50 rounded-xl">
                        {profile[field.key] || 
                          profile.socialLinks?.[field.key] || '—'}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Edit actions for settings tab */}
            {isEditing && (
              <div className="flex gap-3">
                <button type="button" onClick={handleCancel}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 
                    font-bold rounded-xl hover:bg-gray-200 
                    transition-colors text-sm">
                  Cancel
                </button>
                <button type="button" onClick={handleSave}
                  className="flex-1 flex items-center justify-center 
                    gap-2 py-3 bg-[var(--color-gold)] text-white 
                    font-bold rounded-xl hover:bg-[var(--color-gold-dark)] 
                    transition-colors shadow-sm text-sm">
                  <Save size={15}/> Save Changes
                </button>
              </div>
            )}

            {!isEditing && (
              <button type="button"
                onClick={() => setIsEditing(true)}
                className="w-full flex items-center justify-center 
                  gap-2 py-3 bg-[var(--color-gold)] text-white 
                  font-bold rounded-xl hover:bg-[var(--color-gold-dark)] 
                  transition-colors shadow-sm text-sm">
                <Edit2 size={15}/> Edit Profile Info
              </button>
            )}
          </div>
        </div>
      )}
    </PageTransition>
  );
}

export default VendorProfile;
