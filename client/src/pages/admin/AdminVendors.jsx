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

// ─────────────────────────────────────────────────────────────
//  MOCK DATA — updated with vendor_type, documents, IBAN, payment
// ─────────────────────────────────────────────────────────────

const MOCK_VENDORS = [
  {
    id: 'v001',
    vendorType: 'company',
    companyName: 'Royal Gardens Venue',
    ownerName: 'Khalid Al-Mansour',
    signatoryName: 'Khalid Al-Mansour',
    email: 'khalid@royalgardens.jo',
    phone: '+962 79 123 4567',
    category: 'Venue',
    city: 'Amman',
    registrationDate: '2026-05-10',
    status: 'Pending',
    about: 'We specialize in luxury wedding venues with outdoor and indoor seating up to 500 guests.',
    avatar: 'https://i.pravatar.cc/150?img=11',
    servicesCount: 3,
    yearsInBusiness: 5,
    // New fields
    iban: 'JO94CBJO0010000000000131000302',
    ibanMasked: '•••• •••• •••• 0302',

    documents: {
      commercialRegister: 'commercial_register_v001.pdf',
      nationalIdFront: 'nid_front_v001.jpg',
      nationalIdBack: 'nid_back_v001.jpg',
    },
    portfolioInstagram: null,
    portfolioWebsite: 'www.royalgardens.jo',
    documentsStatus: 'submitted',
  },
  {
    id: 'v002',
    vendorType: 'company',
    companyName: 'Elite Catering',
    ownerName: 'Sarah Qasim',
    signatoryName: 'Sarah Qasim',
    email: 'sarah.q@elitecatering.com',
    phone: '+962 78 987 6543',
    category: 'Catering',
    city: 'Amman',
    registrationDate: '2026-05-12',
    status: 'Approved',
    about: 'Premium catering services offering local and international cuisines for large events.',
    avatar: 'https://i.pravatar.cc/150?img=47',
    servicesCount: 8,
    yearsInBusiness: 12,
    iban: 'JO94CBJO0010000000000241000418',
    ibanMasked: '•••• •••• •••• 0418',
    hasPendingChanges: true,
    pendingData: { about: 'Premium catering services offering local and international cuisines. Now serving up to 1000 guests.' },

    documents: {
      commercialRegister: 'commercial_register_v002.pdf',
      nationalIdFront: 'nid_front_v002.jpg',
      nationalIdBack: 'nid_back_v002.jpg',
    },
    portfolioInstagram: null,
    portfolioWebsite: 'www.elitecatering.com',
    documentsStatus: 'verified',
  },
  {
    id: 'v003',
    vendorType: 'freelancer',
    companyName: 'Golden Moments Photography',
    ownerName: 'Tariq Haddad',
    signatoryName: 'Tariq Haddad',
    email: 'tariq@goldenmoments.jo',
    phone: '+962 77 456 7890',
    category: 'Photography & Videography',
    city: 'Irbid',
    registrationDate: '2026-05-15',
    status: 'Pending',
    about: 'Capturing your best moments with cinematic videography and high-res photography.',
    avatar: 'https://i.pravatar.cc/150?img=33',
    servicesCount: 4,
    yearsInBusiness: 3,
    iban: 'JO94CBJO0010000000000352000527',
    ibanMasked: '•••• •••• •••• 0527',

    documents: {
      nationalIdFront: 'nid_front_v003.jpg',
      nationalIdBack: 'nid_back_v003.jpg',
    },
    portfolioInstagram: '@tariq.moments',
    portfolioWebsite: 'www.goldenmoments.jo',
    documentsStatus: 'submitted',
  },
  {
    id: 'v004',
    vendorType: 'freelancer',
    companyName: 'Amman DJ Stars',
    ownerName: 'Omar Ziad',
    signatoryName: 'Omar Ziad',
    email: 'omar.dj@ammanstars.com',
    phone: '+962 79 111 2222',
    category: 'Music & Entertainment',
    city: 'Amman',
    registrationDate: '2026-05-18',
    status: 'Rejected',
    about: 'Providing top-tier DJ services and sound systems for weddings and corporate events.',
    avatar: 'https://i.pravatar.cc/150?img=15',
    servicesCount: 2,
    yearsInBusiness: 2,
    iban: 'JO94CBJO0010000000000463000639',
    ibanMasked: '•••• •••• •••• 0639',

    documents: {
      nationalIdFront: 'nid_front_v004.jpg',
      nationalIdBack: 'nid_back_v004.jpg',
    },
    portfolioInstagram: '@omar.dj',
    portfolioWebsite: null,
    documentsStatus: 'rejected',
  },
  {
    id: 'v005',
    vendorType: 'company',
    companyName: 'Diamond Events Decor',
    ownerName: 'Lina Yassin',
    signatoryName: 'Lina Yassin',
    email: 'lina@diamondevents.jo',
    phone: '+962 78 333 4444',
    category: 'Decoration',
    city: 'Zarqa',
    registrationDate: '2026-05-19',
    status: 'Pending',
    about: 'Luxury floral arrangements and full hall decoration services.',
    avatar: 'https://i.pravatar.cc/150?img=5',
    servicesCount: 5,
    yearsInBusiness: 7,
    iban: 'JO94CBJO0010000000000574000741',
    ibanMasked: '•••• •••• •••• 0741',

    documents: {
      commercialRegister: 'commercial_register_v005.pdf',
      nationalIdFront: 'nid_front_v005.jpg',
      nationalIdBack: 'nid_back_v005.jpg',
    },
    portfolioInstagram: '@diamond.decor.jo',
    portfolioWebsite: null,
    documentsStatus: 'submitted',
  },
  {
    id: 'v006',
    vendorType: 'company',
    companyName: 'The Grand Hall',
    ownerName: 'Ahmad Nasser',
    signatoryName: 'Ahmad Nasser',
    email: 'ahmad@grandhall.com',
    phone: '+962 79 555 6666',
    category: 'Venue',
    city: 'Amman',
    registrationDate: '2026-05-20',
    status: 'Approved',
    about: 'A prestigious hall located in the heart of Amman.',
    avatar: 'https://i.pravatar.cc/150?img=8',
    servicesCount: 1,
    yearsInBusiness: 10,
    iban: 'JO94CBJO0010000000000685000852',
    ibanMasked: '•••• •••• •••• 0852',

    documents: {
      commercialRegister: 'commercial_register_v006.pdf',
      nationalIdFront: 'nid_front_v006.jpg',
      nationalIdBack: 'nid_back_v006.jpg',
    },
    portfolioInstagram: null,
    portfolioWebsite: 'www.grandhall.jo',
    documentsStatus: 'verified',
  },
  {
    id: 'v007',
    vendorType: 'freelancer',
    companyName: 'Zaffa Masters',
    ownerName: 'Hassan Ali',
    signatoryName: 'Hassan Ali',
    email: 'hassan@zaffamasters.jo',
    phone: '+962 77 777 8888',
    category: 'Music & Entertainment',
    city: 'Amman',
    registrationDate: '2026-05-21',
    status: 'Pending',
    about: 'Traditional Zaffa group with a modern twist.',
    avatar: 'https://i.pravatar.cc/150?img=12',
    servicesCount: 3,
    yearsInBusiness: 4,
    iban: 'JO94CBJO0010000000000796000963',
    ibanMasked: '•••• •••• •••• 0963',

    documents: {
      nationalIdFront: 'nid_front_v007.jpg',
      nationalIdBack: 'nid_back_v007.jpg',
    },
    portfolioInstagram: '@zaffa.masters',
    portfolioWebsite: null,
    documentsStatus: 'submitted',
  },
  {
    id: 'v008',
    vendorType: 'company',
    companyName: 'Petra Lights & Sound',
    ownerName: 'Majed Othman',
    signatoryName: 'Majed Othman',
    email: 'info@petralights.com',
    phone: '+962 78 999 0000',
    category: 'Music & Entertainment',
    city: 'Aqaba',
    registrationDate: '2026-05-22',
    status: 'Approved',
    about: 'Stage lighting and professional sound engineering.',
    avatar: 'https://i.pravatar.cc/150?img=60',
    servicesCount: 6,
    yearsInBusiness: 8,
    iban: 'JO94CBJO0010000000000907001074',
    ibanMasked: '•••• •••• •••• 1074',

    documents: {
      commercialRegister: 'commercial_register_v008.pdf',
      nationalIdFront: 'nid_front_v008.jpg',
      nationalIdBack: 'nid_back_v008.jpg',
    },
    portfolioInstagram: null,
    portfolioWebsite: 'www.petralights.com',
    documentsStatus: 'verified',
  },
  {
    id: 'v009',
    vendorType: 'freelancer',
    companyName: 'Sweet Tooth Bakery',
    ownerName: 'Nour Kareem',
    signatoryName: 'Nour Kareem',
    email: 'nour@sweettooth.jo',
    phone: '+962 79 222 3333',
    category: 'Cakes & Desserts',
    city: 'Amman',
    registrationDate: '2026-05-22',
    status: 'Approved',
    about: 'Custom wedding cakes and dessert buffets.',
    avatar: 'https://i.pravatar.cc/150?img=44',
    servicesCount: 4,
    yearsInBusiness: 6,
    iban: 'JO94CBJO0010000000001018001185',
    ibanMasked: '•••• •••• •••• 1185',

    documents: {
      nationalIdFront: 'nid_front_v009.jpg',
      nationalIdBack: 'nid_back_v009.jpg',
    },
    portfolioInstagram: '@sweettooth.jo',
    portfolioWebsite: null,
    documentsStatus: 'verified',
  },
  {
    id: 'v010',
    vendorType: 'freelancer',
    companyName: 'Flash Studios',
    ownerName: 'Rami Suleiman',
    signatoryName: 'Rami Suleiman',
    email: 'rami@flashstudios.com',
    phone: '+962 77 444 5555',
    category: 'Photography & Videography',
    city: 'Amman',
    registrationDate: '2026-05-23',
    status: 'Pending',
    about: 'Modern photography studio with drone capabilities.',
    avatar: 'https://i.pravatar.cc/150?img=59',
    servicesCount: 2,
    yearsInBusiness: 1,
    iban: 'JO94CBJO0010000000001129001296',
    ibanMasked: '•••• •••• •••• 1296',

    documents: {
      nationalIdFront: 'nid_front_v010.jpg',
      nationalIdBack: 'nid_back_v010.jpg',
    },
    portfolioInstagram: '@flash.studios.jo',
    portfolioWebsite: 'www.flashstudios.com',
    documentsStatus: 'submitted',
  },
  {
    id: 'v011',
    vendorType: 'company',
    companyName: 'Magic Planners',
    ownerName: 'Zeina Mahmoud',
    signatoryName: 'Zeina Mahmoud',
    email: 'zeina@magicplanners.jo',
    phone: '+962 78 666 7777',
    category: 'Decoration',
    city: 'Amman',
    registrationDate: '2026-05-24',
    status: 'Approved',
    about: 'Full-service event planning and decoration.',
    avatar: 'https://i.pravatar.cc/150?img=32',
    servicesCount: 10,
    yearsInBusiness: 9,
    iban: 'JO94CBJO0010000000001240001407',
    ibanMasked: '•••• •••• •••• 1407',

    documents: {
      commercialRegister: 'commercial_register_v011.pdf',
      nationalIdFront: 'nid_front_v011.jpg',
      nationalIdBack: 'nid_back_v011.jpg',
    },
    portfolioInstagram: '@magic.planners',
    portfolioWebsite: 'www.magicplanners.jo',
    documentsStatus: 'verified',
  },
  {
    id: 'v012',
    vendorType: 'freelancer',
    companyName: 'Classic Rides',
    ownerName: 'Yousef Nabeel',
    signatoryName: 'Yousef Nabeel',
    email: 'yousef@classicrides.com',
    phone: '+962 79 888 9999',
    category: 'Transportation',
    city: 'Amman',
    registrationDate: '2026-05-24',
    status: 'Rejected',
    about: 'Vintage car rentals for weddings.',
    avatar: 'https://i.pravatar.cc/150?img=53',
    servicesCount: 1,
    yearsInBusiness: 2,
    iban: 'JO94CBJO0010000000001351001518',
    ibanMasked: '•••• •••• •••• 1518',

    documents: {
      nationalIdFront: 'nid_front_v012.jpg',
      nationalIdBack: 'nid_back_v012.jpg',
    },
    portfolioInstagram: null,
    portfolioWebsite: null,
    documentsStatus: 'rejected',
  },
  {
    id: 'v013',
    vendorType: 'company',
    companyName: 'Al-Bustan Resort',
    ownerName: 'Firas Jaber',
    signatoryName: 'Firas Jaber',
    email: 'firas@albustan.jo',
    phone: '+962 77 111 2222',
    category: 'Venue',
    city: 'Jerash',
    registrationDate: '2026-05-25',
    status: 'Approved',
    about: 'Beautiful outdoor resort venue surrounded by nature.',
    avatar: 'https://i.pravatar.cc/150?img=13',
    servicesCount: 2,
    yearsInBusiness: 15,
    iban: 'JO94CBJO0010000000001462001629',
    ibanMasked: '•••• •••• •••• 1629',

    documents: {
      commercialRegister: 'commercial_register_v013.pdf',
      nationalIdFront: 'nid_front_v013.jpg',
      nationalIdBack: 'nid_back_v013.jpg',
    },
    portfolioInstagram: null,
    portfolioWebsite: 'www.albustan.jo',
    documentsStatus: 'verified',
  },
  {
    id: 'v014',
    vendorType: 'freelancer',
    companyName: 'Taste of Home',
    ownerName: 'Amal Saqer',
    signatoryName: 'Amal Saqer',
    email: 'amal@tasteofhome.com',
    phone: '+962 78 333 4444',
    category: 'Catering',
    city: 'Amman',
    registrationDate: '2026-05-25',
    status: 'Pending',
    about: 'Authentic homemade Jordanian dishes for events.',
    avatar: 'https://i.pravatar.cc/150?img=49',
    servicesCount: 3,
    yearsInBusiness: 4,
    iban: 'JO94CBJO0010000000001573001740',
    ibanMasked: '•••• •••• •••• 1740',

    documents: {
      nationalIdFront: 'nid_front_v014.jpg',
      nationalIdBack: 'nid_back_v014.jpg',
    },
    portfolioInstagram: '@tasteofhome.jo',
    portfolioWebsite: null,
    documentsStatus: 'submitted',
  },
  {
    id: 'v015',
    vendorType: 'freelancer',
    companyName: 'Star Lens',
    ownerName: 'Ibrahim Khawaja',
    signatoryName: 'Ibrahim Khawaja',
    email: 'ibrahim@starlens.jo',
    phone: '+962 79 555 6666',
    category: 'Photography & Videography',
    city: 'Salt',
    registrationDate: '2026-05-25',
    status: 'Approved',
    about: 'Professional wedding photography and albums.',
    avatar: 'https://i.pravatar.cc/150?img=68',
    servicesCount: 5,
    yearsInBusiness: 6,
    iban: 'JO94CBJO0010000000001684001851',
    ibanMasked: '•••• •••• •••• 1851',

    documents: {
      nationalIdFront: 'nid_front_v015.jpg',
      nationalIdBack: 'nid_back_v015.jpg',
    },
    portfolioInstagram: '@star.lens.jo',
    portfolioWebsite: 'www.starlens.jo',
    documentsStatus: 'verified',
  },
];

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

export default function AdminVendors() {
  const outletContext = useOutletContext();
  const isSidebarOpen = outletContext?.isSidebarOpen ?? true;

  const [vendors, setVendors] = useState(MOCK_VENDORS);
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showIban, setShowIban] = useState({});
  const [modalTab, setModalTab] = useState('overview');

  useEffect(() => {
    if (selectedVendor) setModalTab('overview');
  }, [selectedVendor?.id]);

  const pendingCount  = vendors.filter(v => v.status === 'Pending').length;
  const approvedCount = vendors.filter(v => v.status === 'Approved').length;
  const rejectedCount = vendors.filter(v => v.status === 'Rejected').length;
  const updatesPendingCount = vendors.filter(v => v.hasPendingChanges).length;

  const filteredVendors = vendors.filter(v => {
    const matchesTab = activeTab === 'All' 
      || (activeTab === 'Updates Pending' ? v.hasPendingChanges : v.status === activeTab);
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      v.companyName.toLowerCase().includes(searchLower) ||
      v.ownerName.toLowerCase().includes(searchLower) ||
      v.email.toLowerCase().includes(searchLower);
    return matchesTab && matchesSearch;
  });

  const handleApprove = (id) => {
    setVendors(prev => prev.map(v => v.id === id ? { ...v, status: 'Approved', documentsStatus: 'verified' } : v));
    if (selectedVendor?.id === id) setSelectedVendor(prev => ({ ...prev, status: 'Approved', documentsStatus: 'verified' }));
    toastSuccess("Vendor approved and notified.");
  };

  const handleReject = (id) => {
    setVendors(prev => prev.map(v => v.id === id ? { ...v, status: 'Rejected', documentsStatus: 'rejected' } : v));
    if (selectedVendor?.id === id) setSelectedVendor(prev => ({ ...prev, status: 'Rejected', documentsStatus: 'rejected' }));
    toastError("Vendor application rejected.");
  };

  const handleRevoke = (id) => {
    setVendors(prev => prev.map(v => v.id === id ? { ...v, status: 'Pending', documentsStatus: 'submitted' } : v));
    if (selectedVendor?.id === id) setSelectedVendor(prev => ({ ...prev, status: 'Pending', documentsStatus: 'submitted' }));
  };

  const handleApproveChanges = (id) => {
    setVendors(prev => prev.map(v => {
      if (v.id === id) {
        return { ...v, ...v.pendingData, hasPendingChanges: false, pendingData: null };
      }
      return v;
    }));
    if (selectedVendor?.id === id) {
      setSelectedVendor(prev => ({ ...prev, ...prev.pendingData, hasPendingChanges: false, pendingData: null }));
    }
  };

  const handleRejectChanges = (id) => {
    setVendors(prev => prev.map(v => v.id === id ? { ...v, hasPendingChanges: false, pendingData: null } : v));
    if (selectedVendor?.id === id) setSelectedVendor(prev => ({ ...prev, hasPendingChanges: false, pendingData: null }));
  };

  const toggleIban = (id) => setShowIban(prev => ({ ...prev, [id]: !prev[id] }));

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
              const count = tab === 'All' ? vendors.length :
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
                {filteredVendors.length === 0 ? (
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
                              <button onClick={() => handleApprove(vendor.id)} className="flex items-center gap-1 px-3 py-1.5 min-h-[44px] bg-emerald-500 hover:bg-emerald-400 text-[#0F1117] text-xs font-bold rounded-lg transition-colors">
                                <Check size={14} /> Approve
                              </button>
                              <button onClick={() => handleReject(vendor.id)} className="flex items-center gap-1 px-3 py-1.5 min-h-[44px] bg-red-500 hover:bg-red-400 text-white text-xs font-bold rounded-lg transition-colors">
                                <CloseIcon size={14} /> Reject
                              </button>
                            </>
                          )}

                          {vendor.status === 'Approved' && (
                            <button onClick={() => handleRevoke(vendor.id)} className="flex items-center gap-1 px-3 py-1.5 border border-red-500/50 hover:bg-red-500/10 text-red-400 text-xs font-bold rounded-lg transition-colors">
                              Revoke
                            </button>
                          )}

                          {vendor.status === 'Rejected' && (
                            <button onClick={() => handleRevoke(vendor.id)} className="flex items-center gap-1 px-3 py-1.5 border border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-lg transition-colors">
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
      {selectedVendor && (
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
                    src={selectedVendor.avatar}
                    alt=""
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-[var(--color-gold)] shadow-[0_0_0_4px_rgba(201,162,77,0.15)] shrink-0"
                  />
                  <div className="flex flex-col gap-1.5 min-w-0 pt-1">
                    <h2 className="text-xl font-extrabold text-white leading-tight truncate pr-10">
                      {selectedVendor.companyName}
                    </h2>
                    <p className="text-sm font-semibold text-[var(--color-gold)]">
                      {selectedVendor.ownerName}
                    </p>
                    <p className="text-xs text-[#8B8FA8] flex items-center gap-1.5">
                      <Calendar size={12} className="shrink-0" />
                      Since {selectedVendor.registrationDate}
                    </p>
                  </div>
                </div>

                {/* Badges row */}
                <div className="flex flex-wrap gap-2 mb-5">
                  <VendorTypeBadge type={selectedVendor.vendorType} />

                  {selectedVendor.status === 'Pending' && (
                    <span className="flex items-center gap-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/25 px-3 py-1 rounded-full text-xs font-bold">
                      <ShieldAlert size={12} /> Pending Approval
                    </span>
                  )}
                  {selectedVendor.status === 'Approved' && (
                    <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-3 py-1 rounded-full text-xs font-bold">
                      <ShieldCheck size={12} /> Verified Vendor
                    </span>
                  )}
                  {selectedVendor.status === 'Rejected' && (
                    <span className="flex items-center gap-1.5 bg-red-500/10 text-red-400 border border-red-500/25 px-3 py-1 rounded-full text-xs font-bold">
                      <CloseIcon size={12} /> Application Rejected
                    </span>
                  )}

                  <DocStatusBadge status={selectedVendor.documentsStatus} />
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
                        <p className="text-sm font-semibold text-white">{selectedVendor.category}</p>
                      </div>
                      <div className="bg-[#1A1D27] rounded-2xl p-4 border border-[#2A2D3A]">
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8B8FA8] mb-1.5">City</p>
                        <p className="text-sm font-semibold text-white">{selectedVendor.city}</p>
                      </div>
                      <div className="bg-[#1A1D27] rounded-2xl p-4 border border-[#2A2D3A]">
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8B8FA8] mb-1.5">Phone</p>
                        <p className="text-sm font-semibold text-white">{selectedVendor.phone}</p>
                      </div>
                      <div className="bg-[#1A1D27] rounded-2xl p-4 border border-[#2A2D3A]">
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8B8FA8] mb-1.5">Experience</p>
                        <p className="text-sm font-semibold text-white">{selectedVendor.yearsInBusiness} Years</p>
                      </div>
                      <div className="col-span-2 bg-[#1A1D27] rounded-2xl p-4 border border-[#2A2D3A]">
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8B8FA8] mb-1.5">Email</p>
                        <p className="text-sm font-semibold text-white break-all">{selectedVendor.email}</p>
                      </div>
                      <div className="bg-[#1A1D27] rounded-2xl p-4 border border-[#2A2D3A]">
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8B8FA8] mb-1.5">Services Listed</p>
                        <p className="text-sm font-semibold text-white">{selectedVendor.servicesCount}</p>
                      </div>
                      <div className="bg-[#1A1D27] rounded-2xl p-4 border border-[#2A2D3A]">
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8B8FA8] mb-1.5">Vendor Since</p>
                        <p className="text-sm font-semibold text-white">{selectedVendor.registrationDate}</p>
                      </div>
                    </div>

                    {/* About section */}
                    <div className="bg-[#1A1D27] rounded-2xl p-5 border border-[#2A2D3A]">
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8B8FA8] mb-3 flex items-center gap-2">
                        <FileText size={12} className="text-[var(--color-gold)]" /> About
                      </p>
                      <p className="text-sm text-[#C8C9D0] leading-relaxed">{selectedVendor.about}</p>
                    </div>
                  </>
                )}

                {/* ── TAB: Documents ── */}
                {modalTab === 'documents' && (
                  <>
                    <div className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <FileText size={15} className="text-[var(--color-gold)]" />
                      Submitted Documents
                      <DocStatusBadge status={selectedVendor.documentsStatus} />
                    </div>

                    {!selectedVendor.documents.commercialRegister && !selectedVendor.documents.nationalIdFront ? (
                      <div className="text-center py-8 text-[#8B8FA8] text-sm">
                        No documents submitted yet
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Commercial Register */}
                        {selectedVendor.documents.commercialRegister && (
                          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#1A1D27] border border-[#2A2D3A] hover:border-blue-500/40 transition-colors cursor-pointer">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                              <FileText size={18} className="text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-white">Commercial Register</p>
                              <p className="text-xs text-[#8B8FA8] mt-0.5 truncate">{selectedVendor.documents.commercialRegister}</p>
                            </div>
                            <span className="text-xs font-bold text-[var(--color-gold)] shrink-0">View →</span>
                          </div>
                        )}

                        {/* National ID — side by side */}
                        {selectedVendor.documents.nationalIdFront && (
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#1A1D27] border border-[#2A2D3A] hover:border-purple-500/40 transition-colors cursor-pointer">
                              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                                <IdCard size={18} className="text-purple-400" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-white">NID Front</p>
                                <p className="text-xs text-[#8B8FA8] mt-0.5">View →</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#1A1D27] border border-[#2A2D3A] hover:border-purple-500/40 transition-colors cursor-pointer">
                              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                                <IdCard size={18} className="text-purple-400" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-white">NID Back</p>
                                <p className="text-xs text-[#8B8FA8] mt-0.5">View →</p>
                              </div>
                            </div>
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
                          onClick={() => toggleIban(selectedVendor.id)}
                          className="text-[10px] text-[var(--color-gold)] hover:underline flex items-center gap-1"
                        >
                          {showIban[selectedVendor.id]
                            ? <><EyeOff size={11} /> Hide</>
                            : <><Eye size={11} /> Reveal</>}
                        </button>
                      </div>
                      <p className="text-base font-bold text-white font-mono tracking-wider break-all">
                        {showIban[selectedVendor.id] ? selectedVendor.iban : selectedVendor.ibanMasked}
                      </p>
                      <p className="text-xs text-[#8B8FA8] mt-2">
                        Account holder:{' '}
                        <span className="text-white font-semibold">{selectedVendor.signatoryName}</span>
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
                        {selectedVendor.portfolioWebsite && (
                          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#1A1D27] border border-[#2A2D3A] hover:border-blue-500/30 transition-colors">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center shrink-0">
                              <Globe size={18} className="text-blue-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-white truncate">{selectedVendor.portfolioWebsite}</p>
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
                {selectedVendor.status === 'Pending' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(selectedVendor.id)}
                      className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#0F1117] font-extrabold text-sm flex items-center justify-center gap-2 transition-colors"
                    >
                      <Check size={16} /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(selectedVendor.id)}
                      className="flex-1 py-3 rounded-xl border border-red-500/40 hover:bg-red-500/10 text-red-400 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                    >
                      <CloseIcon size={16} /> Reject
                    </button>
                  </div>
                )}
                {selectedVendor.status === 'Approved' && (
                  <button
                    onClick={() => handleRevoke(selectedVendor.id)}
                    className="w-full py-3 rounded-xl border border-red-500/40 hover:bg-red-500/10 text-red-400 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <CloseIcon size={16} /> Revoke Approval
                  </button>
                )}
                {selectedVendor.status === 'Rejected' && (
                  <button
                    onClick={() => handleRevoke(selectedVendor.id)}
                    className="w-full py-3 rounded-xl border border-emerald-500/40 hover:bg-emerald-500/10 text-emerald-400 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <Check size={16} /> Re-approve Vendor
                  </button>
                )}
                <p className="text-center text-xs text-[#8B8FA8] mt-2">
                  {selectedVendor.status === 'Pending' && 'Approving will notify the vendor by email and grant platform access.'}
                  {selectedVendor.status === 'Approved' && "Revoking will suspend the vendor's listings immediately."}
                  {selectedVendor.status === 'Rejected' && "Re-approving will restore the vendor's full platform access."}
                </p>
              </div>

            </div>
          </div>
        </>
      )}

    </>
  );
}
