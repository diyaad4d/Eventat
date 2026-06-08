import React, { useState } from 'react';
import { 
  Search, Check, X as CloseIcon, ChevronRight, 
  MapPin, Phone, Mail, Calendar, Briefcase, 
  Award, ShieldAlert, ShieldCheck, Building2, User,
  CreditCard, FileText, Globe, AtSign as InstagramIcon,
  Upload, Trash2, Edit3, Save, FileSignature, Eye, EyeOff, IdCard, Link as LinkIcon
} from 'lucide-react';
import PageTransition from '../../components/shared/PageTransition';
import { useOutletContext } from 'react-router-dom';
import { useEffect } from 'react';
import { toastSuccess, toastError } from '../../utils/toast';

// Removed mock data

const TABS = ['All', 'Pending', 'Approved', 'Rejected', 'Updates Pending'];

// ── Helper: vendor type badge ─────────────────────────────────
function VendorTypeBadge({ type }) {
  if (type === 'company') {
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400">
        <Building2 size={10} /> Company
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400">
      <User size={10} /> Freelancer
    </span>
  );
}



// ── Helper: document status badge ────────────────────────────
function DocStatusBadge({ status }) {
  const map = {
    submitted: { bg: 'bg-blue-500/10 text-blue-400', label: 'Submitted' },
    verified:  { bg: 'bg-emerald-500/10 text-emerald-400', label: 'Verified' },
    rejected:  { bg: 'bg-red-500/10 text-red-400', label: 'Rejected' },
  };
  const s = map[status] ?? map.submitted;
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${s.bg}`}>{s.label}</span>
  );
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getVendors, approveVendor, rejectVendor, getPlatformStats, getVendorById } from '../../services/admin.service';

export default function AdminVendors() {
  const queryClient = useQueryClient();
  const outletContext = useOutletContext();
  const isSidebarOpen = outletContext?.isSidebarOpen ?? true;

  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showIban, setShowIban] = useState({});
  const [modalTab, setModalTab] = useState('overview');

  useEffect(() => {
    if (selectedVendor) setModalTab('overview');
  }, [selectedVendor?.id]);

  const mappedStatus = activeTab === 'All' || activeTab === 'Updates Pending' ? undefined : activeTab;

  const { data: vendorsData, isLoading } = useQuery({
    queryKey: ['admin-vendors', mappedStatus, searchTerm],
    queryFn: () => getVendors({ 
      status: mappedStatus ? mappedStatus.toLowerCase() : undefined,
      search: searchTerm || undefined,
      limit: 50 
    })
  });

  const counts = vendorsData?.data?.counts || {};
  const pendingCount = counts.pending || 0;
  const approvedCount = counts.approved || 0;
  const rejectedCount = counts.rejected || 0;
  const updatesPendingCount = 0;

  const rawVendors = vendorsData?.data?.vendors || [];
  
  const filteredVendors = rawVendors.map(v => ({
    id: v.vendor_id,
    vendorType: v.vendor_type || 'company',
    companyName: v.companyname || v.ownername || 'N/A',
    ownerName: v.ownername || 'N/A',
    signatoryName: v.ownername || 'N/A',
    email: v.email,
    phone: v.phone || 'N/A',
    category: v.category || 'General',
    city: v.city || 'Amman',
    registrationDate: v.registrationdate || v.created_at,
    status: v.status ? v.status.charAt(0).toUpperCase() + v.status.slice(1) : 'Pending',
    about: v.about || 'N/A',
    avatar: v.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(v.ownername || 'Vendor')}&background=random`,
    servicesCount: parseInt(v.servicescount) || 0,
    yearsInBusiness: 1,
    iban: v.iban || 'JO0000000000000000000000000000',
    ibanMasked: v.ibanMasked || '•••• •••• •••• 0000',
    hasPendingChanges: v.haspendingchanges || false,
    documents: {},
    portfolioInstagram: null,
    portfolioWebsite: null,
    documentsStatus: v.status === 'approved' ? 'verified' : v.status === 'rejected' ? 'rejected' : 'submitted',
  }));

  const approveMutation = useMutation({
    mutationFn: (id) => approveVendor(id),
    onSuccess: () => {
      toastSuccess("Vendor approved.");
      queryClient.invalidateQueries({ queryKey: ['admin-vendors'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setSelectedVendor(null);
    },
    onError: () => toastError("Failed to approve vendor.")
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => rejectVendor(id, "Rejected by admin"),
    onSuccess: () => {
      toastError("Vendor application rejected.");
      queryClient.invalidateQueries({ queryKey: ['admin-vendors'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setSelectedVendor(null);
    },
    onError: () => toastError("Failed to reject vendor.")
  });

  const handleApprove = (id) => approveMutation.mutate(id);
  const handleReject = (id) => rejectMutation.mutate(id);
  const handleRevoke = (id) => rejectMutation.mutate(id); // Revoking is treated as reject for now
  
  const handleApproveChanges = (id) => {}; // not fully supported in this simplified view yet
  const handleRejectChanges = (id) => {};

  const toggleIban = (id) => setShowIban(prev => ({ ...prev, [id]: !prev[id] }));

  // Fetch detailed vendor data (documents, services, bookings) when a vendor is clicked
  const { data: vendorDetailData, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['admin-vendor-detail', selectedVendor?.id],
    queryFn: () => getVendorById(selectedVendor.id),
    enabled: !!selectedVendor?.id,
  });

  // Calculate experience string
  const getExperienceString = (dateString) => {
    if (!dateString) return '< 1 year';
    const regDate = new Date(dateString);
    const now = new Date();
    const diffMonths = (now.getFullYear() - regDate.getFullYear()) * 12 + (now.getMonth() - regDate.getMonth());
    
    if (diffMonths < 12) {
      return '< 1 year';
    } else {
      const years = Math.floor(diffMonths / 12);
      return `${years} ${years === 1 ? 'Year' : 'Years'}`;
    }
  };

  // Merge the basic list data with the fetched detail data
  const activeVendor = selectedVendor ? {
    ...selectedVendor,
    documents: vendorDetailData?.data?.documents || {},
    experienceString: getExperienceString(selectedVendor.registrationDate)
  } : null;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedVendor) setSelectedVendor(null);
    };
    if (selectedVendor) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [selectedVendor]);

  return (
    <>
      <PageTransition className="min-h-screen bg-[#0F1117] p-6 lg:p-8 font-sans relative">
        <div className="max-w-[1400px] mx-auto space-y-8">
        {/* ══ SECTION 1: PAGE HEADER ══ */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold text-[var(--color-gold)] uppercase tracking-[0.18em] mb-1">
              Admin Panel
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Vendor Management
            </h1>
            <p className="text-sm text-[#8B8FA8] mt-1">
              Review and manage vendor applications and platform access.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center bg-[#1A1D27] border border-[#2A2D3A] rounded-xl px-4 py-2 shadow-sm min-w-[90px]">
              <span className="text-xl font-black text-amber-500">{pendingCount}</span>
              <span className="text-[10px] font-bold text-[#8B8FA8] uppercase tracking-wider">Pending</span>
            </div>
            <div className="flex flex-col items-center bg-[#1A1D27] border border-[#2A2D3A] rounded-xl px-4 py-2 shadow-sm min-w-[90px]">
              <span className="text-xl font-black text-emerald-400">{approvedCount}</span>
              <span className="text-[10px] font-bold text-[#8B8FA8] uppercase tracking-wider">Approved</span>
            </div>
            <div className="flex flex-col items-center bg-[#1A1D27] border border-[#2A2D3A] rounded-xl px-4 py-2 shadow-sm min-w-[90px]">
              <span className="text-xl font-black text-red-400">{rejectedCount}</span>
              <span className="text-[10px] font-bold text-[#8B8FA8] uppercase tracking-wider">Rejected</span>
            </div>
          </div>
        </div>

        {/* ══ SECTION 2: FILTER TAB STRIP + SEARCH ══ */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
          <div className="flex gap-2 p-1 bg-[#1A1D27] border border-[#2A2D3A] rounded-xl overflow-x-auto max-w-full">
            {TABS.map(tab => {
              const count = tab === 'All' ? (pendingCount + approvedCount + rejectedCount) :
                            tab === 'Pending' ? pendingCount :
                            tab === 'Approved' ? approvedCount : 
                            tab === 'Updates Pending' ? updatesPendingCount : rejectedCount;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                    activeTab === tab 
                      ? 'bg-[var(--color-gold)] text-[#0F1117] shadow-sm' 
                      : 'text-[#8B8FA8] hover:text-white hover:bg-[#2A2D3A]/50'
                  }`}
                >
                  {tab}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeTab === tab ? 'bg-[#0F1117]/20 text-[#0F1117]' : 'bg-[#2A2D3A] text-[#8B8FA8]'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B8FA8]" />
            <input
              type="text"
              placeholder="Search by name, company, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 min-h-[44px] bg-[#1A1D27] border border-[#2A2D3A] text-white rounded-xl outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] text-sm transition-all placeholder-[#8B8FA8]"
            />
          </div>
        </div>

        {/* ══ SECTION 3: VENDORS TABLE ══ */}
        <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b border-[#2A2D3A] text-xs font-bold uppercase tracking-wider text-[#8B8FA8] bg-[#0F1117]/50">
                  <th className="p-4 pl-6">Vendor</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">City</th>
                  <th className="p-4">Docs</th>
                  <th className="p-4">IBAN</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2D3A]">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-[#8B8FA8]">
                      Loading vendors...
                    </td>
                  </tr>
                ) : filteredVendors.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-[#8B8FA8]">
                      No vendors found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredVendors.map((vendor) => (
                    <tr 
                      key={vendor.id} 
                      onClick={() => setSelectedVendor(vendor)}
                      className="hover:bg-[#22253A] transition-colors cursor-pointer group"
                    >
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <img src={vendor.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-[#2A2D3A]" />
                          <div>
                            <p className="text-sm font-bold text-white group-hover:text-[var(--color-gold)] transition-colors flex items-center gap-2">
                              {vendor.companyName}
                              {vendor.hasPendingChanges && (
                                <span className="w-2 h-2 rounded-full bg-amber-500" title="Updates pending"></span>
                              )}
                            </p>
                            <p className="text-xs text-[#8B8FA8]">{vendor.ownerName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <VendorTypeBadge type={vendor.vendorType} />
                      </td>
                      <td className="p-4">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-[#C9A24D]/10 text-[var(--color-gold)]">
                          {vendor.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-[#8B8FA8]">{vendor.city}</span>
                      </td>
                      <td className="p-4">
                        <DocStatusBadge status={vendor.documentsStatus} />
                      </td>
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-[#8B8FA8] font-mono">
                            {showIban[vendor.id] ? vendor.iban.slice(-8) : vendor.ibanMasked}
                          </span>
                          <button
                            onClick={() => toggleIban(vendor.id)}
                            className="text-[#8B8FA8] hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                            title={showIban[vendor.id] ? 'Hide IBAN' : 'Show last 8'}
                          >
                            {showIban[vendor.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                          </button>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          vendor.status === 'Pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                          vendor.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {vendor.status}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-3">
                          
                          {vendor.status === 'Pending' && (
                            <>
                              <button onClick={() => handleApprove(vendor.id)} disabled={approveMutation.isPending} className="flex items-center gap-1 px-3 py-1.5 min-h-[44px] bg-emerald-500 hover:bg-emerald-400 text-[#0F1117] text-xs font-bold rounded-lg transition-colors">
                                <Check size={14} /> Approve
                              </button>
                              <button onClick={() => handleReject(vendor.id)} disabled={rejectMutation.isPending} className="flex items-center gap-1 px-3 py-1.5 min-h-[44px] bg-red-500 hover:bg-red-400 text-white text-xs font-bold rounded-lg transition-colors">
                                <CloseIcon size={14} /> Reject
                              </button>
                            </>
                          )}

                          {vendor.status === 'Approved' && (
                            <button onClick={() => handleRevoke(vendor.id)} disabled={rejectMutation.isPending} className="flex items-center gap-1 px-3 py-1.5 border border-red-500/50 hover:bg-red-500/10 text-red-400 text-xs font-bold rounded-lg transition-colors">
                              Revoke
                            </button>
                          )}

                          {vendor.status === 'Rejected' && (
                            <button onClick={() => handleApprove(vendor.id)} disabled={approveMutation.isPending} className="flex items-center gap-1 px-3 py-1.5 border border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-lg transition-colors">
                              Re-approve
                            </button>
                          )}

                          <div className="w-px h-6 bg-[#2A2D3A] mx-1"></div>
                          
                          <button onClick={() => setSelectedVendor(vendor)} className="text-xs font-bold text-[var(--color-gold)] hover:text-white transition-colors flex items-center gap-1 whitespace-nowrap min-h-[44px]">
                            View Details <ChevronRight size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
      </PageTransition>

      {/* ══ SECTION 4: VENDOR DETAIL MODAL ══ */}
      {activeVendor && (
        <>
          {/* ── Animation keyframe injected inline ── */}
          <style>{`
            @keyframes vdm-in {
              from { opacity: 0; transform: scale(0.94) translateY(12px); }
              to   { opacity: 1; transform: scale(1)    translateY(0);    }
            }
            .vdm-modal { animation: vdm-in 280ms cubic-bezier(0.22,1,0.36,1) both; }
          `}</style>

          {/* ── Backdrop ── */}
          <div
            className="fixed inset-0 z-[990] bg-black/75 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* ── Modal wrapper (click-outside to close) ── */}
          <div
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6"
            onClick={() => setSelectedVendor(null)}
          >
            {/* ── Modal card ── */}
            <div
              className="vdm-modal relative w-full max-w-[680px] h-[95vh] flex flex-col bg-[#0F1117] rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.6)] border border-[#2A2D3A]"
              onClick={(e) => e.stopPropagation()}
            >

              {/* ════ PART 1: HERO HEADER (shrink-0) ════ */}
              <div className="shrink-0 bg-gradient-to-br from-[#C9A24D15] to-[#0F1117] border-b border-[#2A2D3A] px-6 pt-6 pb-0 relative">

                {/* Close button */}
                <button
                  onClick={() => setSelectedVendor(null)}
                  aria-label="Close vendor details"
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#1A1D27] hover:bg-[#2A2D3A] border border-[#2A2D3A] flex items-center justify-center text-[#8B8FA8] hover:text-white transition-colors z-10"
                >
                  <CloseIcon size={15} />
                </button>

                {/* Top row: avatar + text stack */}
                <div className="flex items-start gap-5 mb-5">
                  <img
                    src={activeVendor.avatar}
                    alt=""
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-[var(--color-gold)] shadow-[0_0_0_4px_rgba(201,162,77,0.15)] shrink-0"
                  />
                  <div className="flex flex-col gap-1.5 min-w-0 pt-1">
                    <h2 className="text-xl font-extrabold text-white leading-tight truncate pr-10">
                      {activeVendor.companyName}
                    </h2>
                    <p className="text-sm font-semibold text-[var(--color-gold)]">
                      {activeVendor.ownerName}
                    </p>
                    <p className="text-xs text-[#8B8FA8] flex items-center gap-1.5">
                      <Calendar size={12} className="shrink-0" />
                      Since {new Date(activeVendor.registrationDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Badges row */}
                <div className="flex flex-wrap gap-2 mb-5">
                  <VendorTypeBadge type={activeVendor.vendorType} />

                  {activeVendor.status === 'Pending' && (
                    <span className="flex items-center gap-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/25 px-3 py-1 rounded-full text-xs font-bold">
                      <ShieldAlert size={12} /> Pending Approval
                    </span>
                  )}
                  {activeVendor.status === 'Approved' && (
                    <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-3 py-1 rounded-full text-xs font-bold">
                      <ShieldCheck size={12} /> Verified Vendor
                    </span>
                  )}
                  {activeVendor.status === 'Rejected' && (
                    <span className="flex items-center gap-1.5 bg-red-500/10 text-red-400 border border-red-500/25 px-3 py-1 rounded-full text-xs font-bold">
                      <CloseIcon size={12} /> Application Rejected
                    </span>
                  )}

                  <DocStatusBadge status={activeVendor.documentsStatus} />
                </div>

                {/* Tab strip */}
                <div className="flex gap-0 border-b border-[#2A2D3A] -mx-6 px-6">
                  {['overview', 'documents', 'banking', 'portfolio'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setModalTab(tab)}
                      className={`px-5 py-3 text-sm font-bold border-b-2 transition-all -mb-px capitalize ${
                        modalTab === tab
                          ? 'border-[var(--color-gold)] text-[var(--color-gold)]'
                          : 'border-transparent text-[#8B8FA8] hover:text-white hover:border-[#2A2D3A]'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* ════ PART 2: SCROLLABLE BODY ════ */}
              <div
                className="p-6 space-y-4"
                style={{ flex: '1 1 0', overflowY: 'auto', minHeight: 0 }}
              >

                {/* ── TAB: Overview ── */}
                {modalTab === 'overview' && (
                  <>
                    {/* Pending changes alert */}
                    {selectedVendor.hasPendingChanges && (
                      <div className="p-4 rounded-2xl bg-amber-500/[0.08] border border-amber-500/20 flex items-start gap-3">
                        <ShieldAlert size={18} className="text-amber-400 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-amber-400">Profile Updates Pending</p>
                          <p className="text-xs text-amber-400/70 mt-0.5 mb-3">
                            This vendor has requested changes to their profile.
                          </p>
                          <div className="bg-[#0A0C12] rounded-xl p-3 border border-amber-500/10 mb-3">
                            <pre className="text-xs text-amber-300/60 whitespace-pre-wrap font-mono break-all">
                              {JSON.stringify(selectedVendor.pendingData, null, 2)}
                            </pre>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApproveChanges(selectedVendor.id)}
                              className="px-4 py-2 min-h-[44px] bg-amber-500 hover:bg-amber-400 text-[#0F1117] text-xs font-bold rounded-xl transition-colors"
                            >
                              Approve Updates
                            </button>
                            <button
                              onClick={() => handleRejectChanges(selectedVendor.id)}
                              className="px-4 py-2 min-h-[44px] border border-amber-500/40 hover:bg-amber-500/10 text-amber-400 text-xs font-bold rounded-xl transition-colors"
                            >
                              Reject Updates
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Info grid — 2 columns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-[#1A1D27] rounded-2xl p-4 border border-[#2A2D3A]">
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8B8FA8] mb-1.5">Category</p>
                        <p className="text-sm font-semibold text-white">{activeVendor.category}</p>
                      </div>
                      <div className="bg-[#1A1D27] rounded-2xl p-4 border border-[#2A2D3A]">
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8B8FA8] mb-1.5">City</p>
                        <p className="text-sm font-semibold text-white">{activeVendor.city}</p>
                      </div>
                      <div className="bg-[#1A1D27] rounded-2xl p-4 border border-[#2A2D3A]">
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8B8FA8] mb-1.5">Phone</p>
                        <p className="text-sm font-semibold text-white">{activeVendor.phone}</p>
                      </div>
                      <div className="bg-[#1A1D27] rounded-2xl p-4 border border-[#2A2D3A]">
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8B8FA8] mb-1.5">Experience</p>
                        <p className="text-sm font-semibold text-white">{activeVendor.experienceString}</p>
                      </div>
                      <div className="col-span-2 bg-[#1A1D27] rounded-2xl p-4 border border-[#2A2D3A]">
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8B8FA8] mb-1.5">Email</p>
                        <p className="text-sm font-semibold text-white break-all">{activeVendor.email}</p>
                      </div>
                      <div className="bg-[#1A1D27] rounded-2xl p-4 border border-[#2A2D3A]">
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8B8FA8] mb-1.5">Services Listed</p>
                        <p className="text-sm font-semibold text-white">{activeVendor.servicesCount}</p>
                      </div>
                      <div className="bg-[#1A1D27] rounded-2xl p-4 border border-[#2A2D3A]">
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8B8FA8] mb-1.5">Vendor Since</p>
                        <p className="text-sm font-semibold text-white">{new Date(activeVendor.registrationDate).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* About section */}
                    <div className="bg-[#1A1D27] rounded-2xl p-5 border border-[#2A2D3A]">
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8B8FA8] mb-3 flex items-center gap-2">
                        <FileText size={12} className="text-[var(--color-gold)]" /> About
                      </p>
                      <p className="text-sm text-[#C8C9D0] leading-relaxed">{activeVendor.about}</p>
                    </div>
                  </>
                )}

                {/* ── TAB: Documents ── */}
                {modalTab === 'documents' && (
                  <>
                    <div className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <FileText size={15} className="text-[var(--color-gold)]" />
                      Submitted Documents
                      <DocStatusBadge status={activeVendor.documentsStatus} />
                    </div>

                    {isLoadingDetail ? (
                      <div className="text-center py-8 text-[#8B8FA8] text-sm animate-pulse">
                        Loading documents...
                      </div>
                    ) : !activeVendor.documents.commercialRegister && !activeVendor.documents.nationalIdFront ? (
                      <div className="text-center py-8 text-[#8B8FA8] text-sm">
                        No documents submitted yet
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Commercial Register */}
                        {activeVendor.documents.commercialRegister && (
                          <a href={activeVendor.documents.commercialRegister} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-[#1A1D27] border border-[#2A2D3A] hover:border-blue-500/40 transition-colors cursor-pointer group block">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                              <FileText size={18} className="text-blue-400 group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">Commercial Register</p>
                              <p className="text-xs text-[#8B8FA8] mt-0.5 truncate">{activeVendor.documents.commercialRegister}</p>
                            </div>
                            <span className="text-xs font-bold text-[var(--color-gold)] shrink-0 group-hover:translate-x-1 transition-transform">View →</span>
                          </a>
                        )}

                        {/* National ID — side by side */}
                        {activeVendor.documents.nationalIdFront && (
                          <div className="grid grid-cols-2 gap-3">
                            <a href={activeVendor.documents.nationalIdFront} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-2xl bg-[#1A1D27] border border-[#2A2D3A] hover:border-purple-500/40 transition-colors cursor-pointer group block">
                              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                                <IdCard size={18} className="text-purple-400 group-hover:scale-110 transition-transform" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">NID Front</p>
                                <p className="text-xs text-[#8B8FA8] mt-0.5 group-hover:translate-x-1 transition-transform">View →</p>
                              </div>
                            </a>
                            {activeVendor.documents.nationalIdBack && (
                              <a href={activeVendor.documents.nationalIdBack} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-2xl bg-[#1A1D27] border border-[#2A2D3A] hover:border-purple-500/40 transition-colors cursor-pointer group block">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                                  <IdCard size={18} className="text-purple-400 group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">NID Back</p>
                                  <p className="text-xs text-[#8B8FA8] mt-0.5 group-hover:translate-x-1 transition-transform">View →</p>
                                </div>
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* ── TAB: Banking ── */}
                {modalTab === 'banking' && (
                  <div className="bg-[#1A1D27] rounded-2xl p-5 border border-[#2A2D3A] space-y-4">
                    {/* IBAN row */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8B8FA8]">IBAN</p>
                        <button
                          onClick={() => toggleIban(activeVendor.id)}
                          className="text-[10px] text-[var(--color-gold)] hover:underline flex items-center gap-1"
                        >
                          {showIban[activeVendor.id]
                            ? <><EyeOff size={11} /> Hide</>
                            : <><Eye size={11} /> Reveal</>}
                        </button>
                      </div>
                      <p className="text-base font-bold text-white font-mono tracking-wider break-all">
                        {showIban[activeVendor.id] ? activeVendor.iban : activeVendor.ibanMasked}
                      </p>
                      <p className="text-xs text-[#8B8FA8] mt-2">
                        Account holder:{' '}
                        <span className="text-white font-semibold">{activeVendor.signatoryName}</span>
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-[#2A2D3A]" />

                    {/* Info note */}
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
                      <ShieldAlert size={14} className="text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-400/80 leading-relaxed">
                        IBAN details are confidential. Only reveal when processing vendor payments.
                      </p>
                    </div>
                  </div>
                )}

                {/* ── TAB: Portfolio ── */}
                {modalTab === 'portfolio' && (
                  <>
                    {/* Freelancer requirement note */}
                    {selectedVendor.vendorType === 'freelancer' && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/[0.08] border border-red-500/20 mb-4">
                        <ShieldAlert size={14} className="text-red-400 shrink-0" />
                        <p className="text-xs text-red-400 font-semibold">
                          Portfolio links are required for freelancer approval.
                        </p>
                      </div>
                    )}

                    {!selectedVendor.portfolioInstagram && !selectedVendor.portfolioWebsite ? (
                      <div className="text-center py-8">
                        <p className="text-[#8B8FA8] text-sm">No portfolio links provided</p>
                        {selectedVendor.vendorType === 'freelancer' && (
                          <p className="text-xs text-red-400 mt-1">⚠ Required for approval</p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Instagram card */}
                        {selectedVendor.portfolioInstagram && (
                          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#1A1D27] border border-[#2A2D3A] hover:border-pink-500/30 transition-colors">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center shrink-0">
                              <InstagramIcon size={18} className="text-pink-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-white truncate">{selectedVendor.portfolioInstagram}</p>
                              <p className="text-xs text-[#8B8FA8] mt-0.5">Instagram</p>
                            </div>
                          </div>
                        )}

                        {/* Website card */}
                        {activeVendor.portfolioWebsite && (
                          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#1A1D27] border border-[#2A2D3A] hover:border-blue-500/30 transition-colors">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center shrink-0">
                              <Globe size={18} className="text-blue-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-white truncate">{activeVendor.portfolioWebsite}</p>
                              <p className="text-xs text-[#8B8FA8] mt-0.5">Website</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

              </div>

              {/* ════ PART 3: STICKY FOOTER (shrink-0) ════ */}
              <div className="shrink-0 px-6 py-4 border-t border-[#2A2D3A] bg-[#0F1117]">
                {activeVendor.status === 'Pending' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(activeVendor.id)}
                      disabled={approveMutation.isPending}
                      className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#0F1117] font-extrabold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                      <Check size={16} /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(activeVendor.id)}
                      disabled={rejectMutation.isPending}
                      className="flex-1 py-3 rounded-xl border border-red-500/40 hover:bg-red-500/10 text-red-400 font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                      <CloseIcon size={16} /> Reject
                    </button>
                  </div>
                )}
                {activeVendor.status === 'Approved' && (
                  <button
                    onClick={() => handleRevoke(activeVendor.id)}
                    disabled={rejectMutation.isPending}
                    className="w-full py-3 rounded-xl border border-red-500/40 hover:bg-red-500/10 text-red-400 font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <CloseIcon size={16} /> Revoke Approval
                  </button>
                )}
                {activeVendor.status === 'Rejected' && (
                  <button
                    onClick={() => handleApprove(activeVendor.id)}
                    disabled={approveMutation.isPending}
                    className="w-full py-3 rounded-xl border border-emerald-500/40 hover:bg-emerald-500/10 text-emerald-400 font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Check size={16} /> Re-approve Vendor
                  </button>
                )}
                <p className="text-center text-xs text-[#8B8FA8] mt-2">
                  {activeVendor.status === 'Pending' && 'Approving will notify the vendor by email and grant platform access.'}
                  {activeVendor.status === 'Approved' && "Revoking will suspend the vendor's listings immediately."}
                  {activeVendor.status === 'Rejected' && "Re-approving will restore the vendor's full platform access."}
                </p>
              </div>

            </div>
          </div>
        </>
      )}

    </>
  );
}
