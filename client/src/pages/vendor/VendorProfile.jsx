import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye, EyeOff, Edit2, Save, Camera, Plus,
  MapPin, Star, BadgeCheck, Phone, Mail, Globe,
  Calendar, Award, Briefcase, Settings,
  ClipboardList, TrendingUp, CheckCircle2,
  LayoutDashboard, CreditCard, Building2,
  User, ArrowRight, Wallet, Receipt, Shield, Info
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageTransition from '../../components/shared/PageTransition';
import { toastSuccess, toastError } from '../../utils/toast';
import vendorService from '../../services/vendor.service';

// ── Skeleton helpers ──────────────────────────────────────────────────────────
function CoverSkeleton() {
  return (
    <div className="relative mb-6 animate-pulse">
      <div className="relative w-full h-48 sm:h-64 rounded-2xl bg-gray-200 overflow-hidden border border-gray-100" />
      <div className="absolute bottom-0 left-6 translate-y-1/2">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gray-300 border-4 border-white shadow-lg" />
      </div>
    </div>
  );
}

function NameSkeleton() {
  return (
    <div className="h-14 sm:h-16 mb-8 animate-pulse">
      <div className="flex flex-col gap-2 mt-4">
        <div className="h-6 w-48 rounded bg-gray-200" />
        <div className="h-4 w-64 rounded bg-gray-200" />
      </div>
    </div>
  );
}

// ── PaymentBankingTab ─────────────────────────────────────────────────────────
// Receives real payment data from parent query
function PaymentBankingTab({ paymentData, paymentLoading, profile }) {
  const [showIban, setShowIban] = useState(false);
  const [ibanForm, setIbanForm] = useState({ new_iban: '', new_bank_name: '' });
  const [showIbanForm, setShowIbanForm] = useState(false);

  const queryClient = useQueryClient();

  // Mutation: request IBAN / payment change
  const paymentChangeMutation = useMutation({
    mutationFn: (changeData) => vendorService.requestPaymentChange(changeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-payment'] });
      setShowIbanForm(false);
      setIbanForm({ new_iban: '', new_bank_name: '' });
      toastSuccess('Payment change request submitted. Admin will review within 24–48 hours.');
    },
    onError: (err) => {
      if (err.response?.status === 409) {
        toastError('You already have a pending change request. Wait for admin review.');
      } else {
        toastError(err.response?.data?.error ?? 'Failed to submit request.');
      }
    },
  });

  const handleIbanSubmit = (e) => {
    e.preventDefault();
    if (!ibanForm.new_iban.trim()) return toastError('Please enter a valid IBAN.');
    paymentChangeMutation.mutate(ibanForm);
  };

  // Real data from API: escrow_balance, pending_payout, has_pending_iban_change, iban (masked)
  const escrowBalance   = paymentData?.escrow_balance   ?? 0;
  const pendingPayout   = paymentData?.pending_payout   ?? 0;
  const maskedIban      = paymentData?.iban              ?? null;
  const hasPendingIban  = paymentData?.has_pending_iban_change ?? false;
  // commission_rate comes from vendor_profiles — use profile data
  const commissionRate  = 10; // TODO: expose commission_rate from API if available

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

      {paymentLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3].map((i) => <div key={i} className="h-28 rounded-2xl bg-gray-200" />)}
        </div>
      ) : (
        /* ── Earnings Stats Row ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              label: 'Escrow Balance',
              value: `${escrowBalance.toLocaleString()} JOD`,
              sublabel: 'Held from active bookings',
              color: 'text-amber-600',
              bgColor: 'bg-amber-50 border-amber-100',
              icon: <Shield size={18} className="text-amber-500" />,
            },
            {
              label: 'Pending Payouts',
              value: `${pendingPayout.toLocaleString()} JOD`,
              sublabel: 'Awaiting event confirmation',
              color: 'text-blue-600',
              bgColor: 'bg-blue-50 border-blue-100',
              icon: <CreditCard size={18} className="text-blue-500" />,
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
      )}

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
            <p className="text-2xl font-black text-[var(--color-gold)]">{commissionRate}%</p>
            <p className="text-xs text-gray-400">You keep <span className="font-bold text-emerald-600">{100 - commissionRate}%</span></p>
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

        {maskedIban ? (
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">IBAN (masked)</p>
              <button
                type="button"
                onClick={() => setShowIban((v) => !v)}
                className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-gold)] hover:underline"
              >
                {showIban ? <><EyeOff size={12} /> Hide</> : <><Eye size={12} /> Reveal</>}
              </button>
            </div>
            <p className="text-base font-bold text-[var(--color-dark)] font-mono tracking-wider break-all">
              {maskedIban}
            </p>
            {hasPendingIban && (
              <div className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                <Info size={12} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">An IBAN change request is pending admin review.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-500">
            No IBAN on file yet.
          </div>
        )}

        <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-100 rounded-xl">
          <Info size={14} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">
            Your IBAN must always match the name on your registration documents.
            To update your IBAN, submit a change request below.
          </p>
        </div>

        {hasPendingIban ? (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-semibold text-center">
            A change request is already pending. You cannot submit a new one until it's reviewed.
          </div>
        ) : showIbanForm ? (
          <form onSubmit={handleIbanSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">New IBAN</label>
              <input
                type="text"
                value={ibanForm.new_iban}
                onChange={(e) => setIbanForm((f) => ({ ...f, new_iban: e.target.value }))}
                placeholder="JO94CBJO0010000000000131000302"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-gold)] text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Bank Name</label>
              <input
                type="text"
                value={ibanForm.new_bank_name}
                onChange={(e) => setIbanForm((f) => ({ ...f, new_bank_name: e.target.value }))}
                placeholder="e.g., Jordan Ahli Bank"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-gold)] text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowIbanForm(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                disabled={paymentChangeMutation.isPending}
                className="flex-1 py-2.5 bg-[var(--color-gold)] text-white text-sm font-bold rounded-xl hover:bg-[var(--color-gold-dark)] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {paymentChangeMutation.isPending ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setShowIbanForm(true)}
            className="w-full py-2.5 border border-gray-200 text-gray-500 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors"
          >
            Request IBAN Update
          </button>
        )}

        {/* ── Payout History (placeholder — no API endpoint yet) ── */}
        {/* TODO: Add GET /api/vendor/payouts endpoint to populate real data */}
      </div>
    </div>
  );
}

// ── VendorProfile ─────────────────────────────────────────────────────────────
function VendorProfile() {
  const queryClient = useQueryClient();

  // ── UI state ──────────────────────────────────────────────────────────────
  const [isEditing,   setIsEditing]   = useState(false);
  const [activeTab,   setActiveTab]   = useState('overview');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // editData mirrors the real profile fields; initialized from API response
  const [editData, setEditData] = useState({
    company_name:        '',
    company_description: '',
    city:                '',
    phone:               '',
    social_links:        {},
  });

  const coverInputRef  = useRef(null);
  const avatarInputRef = useRef(null);

  // ── Query: vendor profile ─────────────────────────────────────────────────
  // API response profile fields:
  //   user_id, email, full_name, phone, member_since
  //   vendor_id, vendor_type, company_name, company_description
  //   address, city, logo_url, social_links (JSONB)
  //   iban (masked ****XXXX), registration_status
  //   pending_changes, pending_changes_at
  //   preferred_category_name, preferred_category_slug
  //   active_services_count, total_services_count
  //   total_confirmed_bookings, pending_bookings_count
  //   overall_rating
  const {
    data: profileData,
    isLoading: profileLoading,
  } = useQuery({
    queryKey: ['vendor-profile'],
    queryFn: () => vendorService.getProfile(),
    staleTime: 1000 * 60 * 5,
  });

  const profile = profileData?.profile ?? null;

  // Populate editData when profile loads (only when not currently editing)
  useEffect(() => {
    if (profile && !isEditing) {
      setEditData({
        company_name:        profile.company_name        ?? '',
        company_description: profile.company_description ?? '',
        city:                profile.city                ?? '',
        phone:               profile.phone               ?? '',
        social_links:        profile.social_links        ?? {},
      });
    }
  }, [profile]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Query: my services for "My Services" tab ──────────────────────────────
  const { data: myServicesData } = useQuery({
    queryKey: ['vendor-profile-services'],
    queryFn: () => vendorService.getMyServices({ limit: 50 }),
    staleTime: 1000 * 60 * 2,
  });
  const myServices = myServicesData?.services ?? [];

  // ── Query: payment info for the payment tab ───────────────────────────────
  const {
    data: paymentData,
    isLoading: paymentLoading,
  } = useQuery({
    queryKey: ['vendor-payment'],
    queryFn: () => vendorService.getPaymentInfo(),
    staleTime: 1000 * 60 * 5,
    enabled: activeTab === 'payment',
  });

  // ── Mutation: update profile ──────────────────────────────────────────────
  // Instant fields: company_description, social_links, city (vendor_profiles) + phone (users)
  // Pending approval: company_name, iban, preferred_category_id
  const updateProfileMutation = useMutation({
    mutationFn: (payload) => vendorService.updateProfile(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-profile'] });
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      const hasPending = data?.pendingChanges && Object.keys(data.pendingChanges).length > 0;
      if (hasPending) {
        toastSuccess('Profile updated. Some changes await admin approval.');
      } else {
        toastSuccess('Profile updated successfully! 🎉');
      }
    },
    onError: (err) => {
      if (err.response?.status === 409) {
        toastError('You already have a pending change request. Wait for admin review.');
      } else {
        toastError(err.response?.data?.error ?? 'Failed to update profile.');
      }
    },
  });

  // ── Mutation: upload logo ─────────────────────────────────────────────────
  const uploadLogoMutation = useMutation({
    mutationFn: (fd) => vendorService.uploadLogo(fd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-profile'] });
      toastSuccess('Logo updated.');
    },
    onError: (err) => {
      toastError(err.response?.data?.error ?? 'Failed to upload logo.');
    },
  });

  // ── handleSave ────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!profile) return;

    const payload = {};

    // Instant fields
    if (editData.company_description !== (profile.company_description ?? ''))
      payload.company_description = editData.company_description;
    if (editData.city !== (profile.city ?? ''))
      payload.city = editData.city;
    if (editData.phone !== (profile.phone ?? ''))
      payload.phone = editData.phone;
    // social_links is a JSONB object — always include if in editData
    if (JSON.stringify(editData.social_links) !== JSON.stringify(profile.social_links ?? {}))
      payload.social_links = editData.social_links;

    // Pending approval fields
    if (editData.company_name !== (profile.company_name ?? ''))
      payload.company_name = editData.company_name;

    if (Object.keys(payload).length === 0) {
      setIsEditing(false);
      return;
    }

    updateProfileMutation.mutate(payload);
  };

  const handleCancel = () => {
    // Restore editData from current profile
    if (profile) {
      setEditData({
        company_name:        profile.company_name        ?? '',
        company_description: profile.company_description ?? '',
        city:                profile.city                ?? '',
        phone:               profile.phone               ?? '',
        social_links:        profile.social_links        ?? {},
      });
    }
    setIsEditing(false);
  };

  // ── handleLogoUpload ──────────────────────────────────────────────────────
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('logo', file);
    uploadLogoMutation.mutate(fd);
  };

  // Cover upload — NOTE: no cover image endpoint exists (only logo_url).
  // We allow local preview only; the logo field IS the logo_url.
  const handleCoverUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Treat cover upload as logo upload (same field in backend)
    const fd = new FormData();
    fd.append('logo', file);
    uploadLogoMutation.mutate(fd);
  };

  // ── Derived display values ────────────────────────────────────────────────
  const displayName      = profile?.company_name        ?? profile?.full_name     ?? '—';
  const displayAbout     = profile?.company_description ?? '—';
  const displayCity      = profile?.city                ?? '—';
  const displayPhone     = profile?.phone               ?? '—';
  const displayEmail     = profile?.email               ?? '—';
  const displayRating    = Number(profile?.overall_rating ?? 0);
  const displayMemberSince = profile?.member_since
    ? new Date(profile.member_since).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—';
  const hasPendingChanges = profile?.pending_changes !== null && profile?.pending_changes !== undefined;
  const isVerified = profile?.registration_status === 'approved';
  const socialLinks = profile?.social_links ?? {};
  const logoUrl = profile?.logo_url ?? null;

  const TABS = [
    { id: 'overview',  label: 'Overview',         icon: <LayoutDashboard size={15} /> },
    { id: 'services',  label: 'My Services',      icon: <Briefcase size={15} />       },
    { id: 'payment',   label: 'Payment & Banking', icon: <CreditCard size={15} />     },
    { id: 'settings',  label: 'Profile Info',     icon: <Settings size={15} />        },
  ];

  return (
    <PageTransition className="w-full max-w-6xl mx-auto pb-16">

      {/* ══ TOP ACTION BAR ══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-[11px] font-bold text-[var(--color-gold)] uppercase tracking-[0.18em] mb-1">Vendor Dashboard</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-dark)]">My Store</h1>
          <p className="text-sm text-gray-500 mt-1">Manage how customers see your business.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 shrink-0">
          {saveSuccess && (
            <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
              <CheckCircle2 size={15} /> Saved!
            </span>
          )}
          {hasPendingChanges && (
            <span className="flex items-center gap-1.5 text-sm font-bold text-amber-700 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200">
              <Info size={15} /> Changes pending review
            </span>
          )}
          <button
            type="button"
            onClick={() => window.open('/vendors/v1', '_blank', 'noopener,noreferrer')}
            className="flex items-center justify-center gap-2 px-6 py-2.5 min-h-[44px] bg-white border border-[var(--color-gold)] text-[var(--color-gold)] text-sm font-bold rounded-full hover:bg-[var(--color-gold)] hover:text-white transition-colors cursor-pointer select-none"
          >
            <Eye size={15} /> Preview Public Page
          </button>
          {!isEditing ? (
            <button
              type="button"
              onClick={() => { setIsEditing(true); setActiveTab('settings'); }}
              className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] bg-[var(--color-gold)] text-white text-sm font-bold rounded-xl hover:bg-[var(--color-gold-dark)] shadow-sm transition-colors"
            >
              <Edit2 size={15} /> Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={updateProfileMutation.isPending}
                className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-gold)] text-white text-sm font-bold rounded-xl hover:bg-[var(--color-gold-dark)] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {updateProfileMutation.isPending ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                ) : (
                  <><Save size={15} /> Save Changes</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Pending changes banner ── */}
      {hasPendingChanges && !isEditing && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800">Your profile changes are under review</p>
            <p className="text-sm text-amber-700 mt-1">An admin is reviewing your recent updates. Your public profile will reflect the changes once approved.</p>
          </div>
        </div>
      )}

      {/* ══ COVER + AVATAR SECTION ══ */}
      {profileLoading ? (
        <CoverSkeleton />
      ) : (
        <div className="relative mb-6">
          {/* Cover image — uses logo_url as cover; no dedicated cover field in API */}
          <div className="relative w-full h-48 sm:h-64 rounded-2xl overflow-hidden border border-gray-200">
            {logoUrl ? (
              <img src={logoUrl} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[var(--color-gold)]/20 to-[var(--color-dark)]/10 flex items-center justify-center">
                <p className="text-gray-400 text-sm font-semibold">No cover image</p>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            {isEditing && (
              <>
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="absolute bottom-3 right-3 flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-sm text-[var(--color-dark)] text-xs font-bold rounded-xl hover:bg-white transition-colors"
                >
                  {uploadLogoMutation.isPending ? (
                    <><div className="w-3 h-3 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" /> Uploading...</>
                  ) : (
                    <><Camera size={13} /> Change Cover</>
                  )}
                </button>
                <input type="file" accept="image/*" className="hidden" ref={coverInputRef} onChange={handleCoverUpload} />
              </>
            )}
          </div>

          {/* Avatar — uses same logo_url */}
          <div className="absolute bottom-0 left-6 translate-y-1/2">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28">
              {logoUrl ? (
                <img src={logoUrl} alt={displayName}
                  className="w-full h-full rounded-2xl object-cover border-4 border-white shadow-lg" />
              ) : (
                <div className="w-full h-full rounded-2xl bg-[var(--color-gold)]/10 border-4 border-white shadow-lg flex items-center justify-center">
                  <span className="text-2xl font-black text-[var(--color-gold-dark)]">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {isEditing && (
                <>
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-[var(--color-gold)] text-white rounded-full flex items-center justify-center shadow-md hover:bg-[var(--color-gold-dark)] transition-colors"
                  >
                    <Camera size={14} />
                  </button>
                  <input type="file" accept="image/*" className="hidden" ref={avatarInputRef} onChange={handleLogoUpload} />
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Spacer for avatar overlap */}
      <div className="h-14 sm:h-16" />

      {/* ══ NAME + BADGES ROW ══ */}
      {profileLoading ? (
        <NameSkeleton />
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-xl font-extrabold text-[var(--color-dark)]">
                {displayName}
              </h2>
              {isVerified && (
                <span className="flex items-center gap-1 px-2.5 py-1 bg-[var(--color-gold)]/10 text-[var(--color-gold-dark)] text-xs font-bold rounded-full border border-[var(--color-gold)]/30">
                  <BadgeCheck size={12} /> Verified
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">{profile?.preferred_category_name ?? profile?.vendor_type ?? '—'}</p>
            <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <MapPin size={12} className="text-[var(--color-gold)]" />
                {displayCity}
              </span>
              <span className="flex items-center gap-1">
                <Star size={12} fill="var(--color-gold)" color="var(--color-gold)" />
                {displayRating.toFixed(1)}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={12} className="text-[var(--color-gold)]" />
                Since {displayMemberSince}
              </span>
            </div>
          </div>

          {/* Stats mini row */}
          <div className="flex flex-wrap gap-6 shrink-0 mt-4 sm:mt-0">
            {[
              { label: 'Active Services', value: profile?.active_services_count ?? 0 },
              { label: 'Confirmed',       value: profile?.total_confirmed_bookings ?? 0 },
              { label: 'Pending',         value: profile?.pending_bookings_count ?? 0 },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-xl font-black text-[var(--color-dark)]">{stat.value}</p>
                <p className="text-xs text-gray-400 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ TABS ══ */}
      <div className="flex gap-1 border-b border-gray-200 mb-8">
        {TABS.map((tab) => (
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
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-[var(--color-dark)] text-sm">Profile Completeness</h3>
                <span className="text-sm font-black text-[var(--color-gold)]">
                  {[
                    displayName !== '—',
                    displayAbout !== '—',
                    displayCity !== '—',
                    displayPhone !== '—',
                    logoUrl !== null,
                  ].filter(Boolean).length * 20}%
                </span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[#E8C97A] to-[#C9A24D]"
                  style={{ width: `${[displayName !== '—', displayAbout !== '—', displayCity !== '—', displayPhone !== '—', logoUrl !== null].filter(Boolean).length * 20}%` }} />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {logoUrl ? 'Add social links to improve discoverability' : 'Add a logo to complete your profile'}
              </p>
            </div>

            {/* About section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-[var(--color-dark)] mb-4">About Your Business</h3>
              {profileLoading ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-3 w-full rounded bg-gray-200" />
                  <div className="h-3 w-5/6 rounded bg-gray-200" />
                  <div className="h-3 w-4/6 rounded bg-gray-200" />
                </div>
              ) : (
                (displayAbout || '').split('\n\n').map((para, i) => (
                  <p key={i} className="text-sm text-gray-600 leading-relaxed mb-3 last:mb-0">{para}</p>
                ))
              )}
              <button
                type="button"
                onClick={() => { setActiveTab('settings'); setIsEditing(true); }}
                className="mt-4 text-xs font-bold text-[var(--color-gold)] hover:underline min-h-[44px] inline-flex items-center"
              >
                Edit About →
              </button>
            </div>

            {/* Active services preview */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[var(--color-dark)]">Active Services</h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('services')}
                  className="text-xs font-bold text-[var(--color-gold)] hover:underline min-h-[44px] inline-flex items-center"
                >
                  Manage All →
                </button>
              </div>
              <div className="flex flex-col gap-3">
                {myServices.filter((s) => s.is_active).slice(0, 3).map((srv) => (
                  <div key={srv.service_id}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    {srv.primary_image_url ? (
                      <img src={srv.primary_image_url} alt={srv.title}
                        className="w-14 h-14 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gray-200 shrink-0 flex items-center justify-center text-gray-400 text-xl font-bold">
                        {srv.title?.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-[var(--color-dark)] truncate">{srv.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {Number(srv.base_price).toLocaleString()} JOD · {
                          srv.pricing_unit === 'per_item' ? 'per piece' : 
                          srv.pricing_unit === 'per_person' ? 'per guest' : 
                          (srv.pricing_unit ?? '').replace('_', ' ')
                        }
                        · {srv.total_bookings ?? 0} bookings
                      </p>
                    </div>
                    <span className="shrink-0 w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                ))}
                {myServices.filter((s) => s.is_active).length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">No active services yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right: Contact + quick links */}
          <div className="flex flex-col gap-6">

            {/* Contact card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-[var(--color-dark)] mb-4">Contact Info</h3>
              <div className="flex flex-col gap-3">
                {[
                  { icon: <Phone size={15} />, label: 'Phone',   value: displayPhone, color: 'bg-emerald-50 text-emerald-600' },
                  { icon: <Mail size={15} />,  label: 'Email',   value: displayEmail, color: 'bg-blue-50 text-blue-600' },
                  { icon: <Globe size={15} />, label: 'Instagram', value: socialLinks?.instagram ?? '—', color: 'bg-purple-50 text-purple-600' },
                  { icon: <Globe size={15} />, label: 'Facebook',  value: socialLinks?.facebook  ?? '—', color: 'bg-indigo-50 text-indigo-600' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{item.label}</p>
                      <p className="text-sm font-semibold text-[var(--color-dark)] truncate">{item.value || '—'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-[var(--color-dark)] mb-4">Quick Actions</h3>
              <div className="flex flex-col gap-3">
                <Link to="/vendor/services/new"
                  className="flex items-center gap-3 p-3 bg-[var(--color-gold)]/8 border border-[var(--color-gold)]/20 rounded-xl hover:bg-[var(--color-gold)]/15 transition-colors">
                  <Plus size={16} className="text-[var(--color-gold)]" />
                  <span className="text-sm font-bold text-[var(--color-dark)]">Add New Service</span>
                </Link>
                <Link to="/vendor/bookings"
                  className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
                  <ClipboardList size={16} className="text-gray-500" />
                  <span className="text-sm font-bold text-[var(--color-dark)]">View Bookings</span>
                </Link>
                <Link to="/vendor/analytics"
                  className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
                  <TrendingUp size={16} className="text-gray-500" />
                  <span className="text-sm font-bold text-[var(--color-dark)]">View Analytics</span>
                </Link>
                <button
                  type="button"
                  onClick={() => window.open('/vendors/v1', '_blank', 'noopener,noreferrer')}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-[var(--color-gold)] text-[var(--color-gold)] text-sm font-bold rounded-full hover:bg-[var(--color-gold)] hover:text-white transition-colors cursor-pointer w-full select-none"
                >
                  <Eye size={15} /> Preview Public Page
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
              <h2 className="text-lg font-extrabold text-[var(--color-dark)]">My Services</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {myServices.filter((s) => s.is_active).length} active · {myServices.filter((s) => !s.is_active).length} inactive
              </p>
            </div>
            <Link to="/vendor/services/new"
              className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-gold)] text-white text-sm font-bold rounded-xl hover:bg-[var(--color-gold-dark)] shadow-sm transition-colors">
              <Plus size={15} /> Add Service
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {myServices.map((srv) => (
              <div key={srv.service_id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Image */}
                <div className="relative h-40 overflow-hidden bg-gray-100">
                  {srv.primary_image_url ? (
                    <img src={srv.primary_image_url} alt={srv.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl font-black">
                      {srv.title?.charAt(0)}
                    </div>
                  )}
                  {/* Status badge */}
                  <span className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full border
                    ${srv.is_active
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                    {srv.is_active ? '● Active' : '○ Inactive'}
                  </span>
                </div>

                {/* Body */}
                <div className="p-4">
                  <h3 className="font-bold text-[var(--color-dark)] text-sm mb-1 truncate">{srv.title}</h3>
                  <p className="text-xs text-gray-500 mb-3">
                    {Number(srv.base_price).toLocaleString()} JOD · {
                      srv.pricing_unit === 'per_item' ? 'per piece' : 
                      srv.pricing_unit === 'per_person' ? 'per guest' : 
                      (srv.pricing_unit ?? '').replace('_', ' ')
                    }
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                    <span>{srv.total_bookings ?? 0} bookings</span>
                    <span className="font-bold text-[var(--color-gold-dark)]">{srv.category_name ?? '—'}</span>
                  </div>
                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link to={`/vendor/services/${srv.service_id}/edit`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors">
                      <Edit2 size={13} /> Edit
                    </Link>
                    <Link to={`/service/${srv.service_id}`} target="_blank"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[var(--color-gold)]/10 text-[var(--color-gold-dark)] text-xs font-bold rounded-lg hover:bg-[var(--color-gold)]/20 transition-colors">
                      <Eye size={13} /> View
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {/* Add new service card */}
            <Link to="/vendor/services/new"
              className="bg-white rounded-2xl border-2 border-dashed border-gray-200 hover:border-[var(--color-gold)] flex flex-col items-center justify-center p-8 gap-3 transition-colors group min-h-[280px]">
              <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-[var(--color-gold)]/10 flex items-center justify-center transition-colors">
                <Plus size={22} className="text-gray-400 group-hover:text-[var(--color-gold)] transition-colors" />
              </div>
              <p className="text-sm font-bold text-gray-400 group-hover:text-[var(--color-gold)] transition-colors text-center">
                Add New Service
              </p>
            </Link>
          </div>
        </div>
      )}

      {/* ══ TAB: PAYMENT & BANKING ══ */}
      {activeTab === 'payment' && (
        <PaymentBankingTab
          paymentData={paymentData}
          paymentLoading={paymentLoading}
          profile={profile}
        />
      )}

      {/* ══ TAB: PROFILE INFO (EDIT) ══ */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left column */}
          <div className="flex flex-col gap-6">

            {/* Basic Info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-[var(--color-dark)] mb-5 pb-3 border-b border-gray-100">
                Basic Information
              </h3>
              <div className="flex flex-col gap-4">
                {[
                  {
                    label: 'Business Name',
                    key: 'company_name',
                    type: 'text',
                    placeholder: 'Your business name',
                    note: 'Requires admin approval',
                  },
                  {
                    label: 'City / Location',
                    key: 'city',
                    type: 'text',
                    placeholder: 'Amman, Jordan',
                    note: null,
                  },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      {field.label}
                      {field.note && (
                        <span className="ml-2 text-[10px] text-amber-500 font-normal normal-case">{field.note}</span>
                      )}
                    </label>
                    {isEditing ? (
                      <input
                        type={field.type}
                        value={editData[field.key] ?? ''}
                        onChange={(e) => setEditData((d) => ({ ...d, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-gold)] text-sm transition-all"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-[var(--color-dark)] px-4 py-2.5 bg-gray-50 rounded-xl">
                        {profile?.[field.key] || '—'}
                      </p>
                    )}
                  </div>
                ))}

                {/* About textarea */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    About Your Business
                  </label>
                  {isEditing ? (
                    <textarea
                      rows={5}
                      value={editData.company_description ?? ''}
                      onChange={(e) => setEditData((d) => ({ ...d, company_description: e.target.value }))}
                      placeholder="Describe your business..."
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-gold)] text-sm resize-none transition-all"
                    />
                  ) : (
                    <p className="text-sm text-gray-600 px-4 py-2.5 bg-gray-50 rounded-xl leading-relaxed line-clamp-4">
                      {profile?.company_description || '—'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">

            {/* Contact Info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-[var(--color-dark)] mb-5 pb-3 border-b border-gray-100">
                Contact Information
              </h3>
              <div className="flex flex-col gap-4">
                {[
                  { label: 'Phone', key: 'phone', placeholder: '+962 7 XXXX XXXX', icon: <Phone size={14} />, type: 'direct' },
                  { label: 'Email', key: 'email', placeholder: 'you@domain.com', icon: <Mail size={14} />, type: 'readonly' },
                  { label: 'Instagram', key: 'instagram', placeholder: '@handle', icon: <Globe size={14} />, type: 'social' },
                  { label: 'Facebook',  key: 'facebook',  placeholder: 'Page name', icon: <Globe size={14} />, type: 'social' },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      {field.icon} {field.label}
                      {field.type === 'readonly' && (
                        <span className="text-[10px] text-gray-400 font-normal normal-case">(not editable)</span>
                      )}
                    </label>
                    {isEditing && field.type !== 'readonly' ? (
                      <input
                        type="text"
                        value={
                          field.type === 'social'
                            ? (editData.social_links?.[field.key] ?? '')
                            : (editData[field.key] ?? '')
                        }
                        onChange={(e) => {
                          if (field.type === 'social') {
                            setEditData((d) => ({
                              ...d,
                              social_links: { ...d.social_links, [field.key]: e.target.value },
                            }));
                          } else {
                            setEditData((d) => ({ ...d, [field.key]: e.target.value }));
                          }
                        }}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-gold)] text-sm transition-all"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-[var(--color-dark)] px-4 py-2.5 bg-gray-50 rounded-xl">
                        {field.type === 'social'
                          ? (socialLinks?.[field.key] || '—')
                          : (profile?.[field.key] || '—')}
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
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={updateProfileMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-[var(--color-gold)] text-white font-bold rounded-xl hover:bg-[var(--color-gold-dark)] transition-colors shadow-sm text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {updateProfileMutation.isPending ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                  ) : (
                    <><Save size={15} /> Save Changes</>
                  )}
                </button>
              </div>
            )}

            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--color-gold)] text-white font-bold rounded-xl hover:bg-[var(--color-gold-dark)] transition-colors shadow-sm text-sm"
              >
                <Edit2 size={15} /> Edit Profile Info
              </button>
            )}
          </div>
        </div>
      )}
    </PageTransition>
  );
}

export default VendorProfile;
