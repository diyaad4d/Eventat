import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User, Building2, Eye, EyeOff, ArrowRight, ArrowLeft,
  IdCard, Upload, Globe,
  Link as LinkIcon, Info, CheckCircle2, Plus, Trash2,
  AtSign as InstagramIcon,
  Briefcase,
  ChevronDown,
} from 'lucide-react';

import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import useCategoriesStore from '../../store/categoriesStore';
import useAuthStore from '../../store/authStore';

// ─────────────────────────────────────────────────────────────
//  Jordanian cities
// ─────────────────────────────────────────────────────────────
const JORDAN_CITIES = [
  'Amman', 'Irbid', 'Zarqa', 'Mafraq', 'Ajloun', 'Jerash', 
  'Madaba', 'Balqa', 'Karak', 'Tafilah', 'Ma\'an', 'Aqaba'
];

// ─────────────────────────────────────────────────────────────
//  Social media platform options
// ─────────────────────────────────────────────────────────────
const SOCIAL_PLATFORMS = [
  'Instagram',
  'Facebook',
  'TikTok',
  'YouTube',
  'Twitter/X',
  'LinkedIn',
  'Snapchat',
];

// ─────────────────────────────────────────────────────────────
//  Zod schema — role-aware, vendor fields required only for vendor
// ─────────────────────────────────────────────────────────────
const baseSchema = z.object({
  role: z.enum(['customer', 'vendor']),
  full_name: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(80, 'Full name is too long'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username is too long')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed'),
  email: z.string().email('Please enter a valid email address'),
  phone: z
    .string()
    .regex(/^\+9627[789]\d{7}$/, 'Please enter a valid Jordanian phone number'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long'),
  confirm_password: z.string(),

  // Vendor-only fields — optional by default, required conditionally
  vendor_type:          z.enum(['company', 'freelancer']).optional(),
  company_name:         z.string().max(150).optional(),
  owner_signatory_name: z.string().max(120).optional(),
  company_description:  z.string().max(1000).optional(),
  city:                 z.string().max(100).optional(),
  category:             z.string().max(80).optional(),
  iban:                 z.string().max(40).optional(),
  portfolio_website:    z.string().max(255).optional(),
  portfolio_pdf:        z.string().optional(),
}).superRefine((data, ctx) => {
  // Confirm password match
  if (data.password !== data.confirm_password) {
    ctx.addIssue({
      path: ['confirm_password'],
      code: z.ZodIssueCode.custom,
      message: 'Passwords do not match',
    });
  }

  if (data.role === 'vendor') {
    if (!data.vendor_type) {
      ctx.addIssue({ path: ['vendor_type'], code: z.ZodIssueCode.custom, message: 'Please select a vendor type' });
    }
    if (!data.city || data.city.trim().length < 2) {
      ctx.addIssue({ path: ['city'], code: z.ZodIssueCode.custom, message: 'City is required' });
    }
    if (!data.category || data.category.trim().length < 2) {
      ctx.addIssue({ path: ['category'], code: z.ZodIssueCode.custom, message: 'Category is required' });
    }
    if (!data.iban || data.iban.trim().length < 10) {
      ctx.addIssue({ path: ['iban'], code: z.ZodIssueCode.custom, message: 'Please enter your IBAN (min 10 characters)' });
    }

    if (data.vendor_type === 'company') {
      if (!data.company_name || data.company_name.trim().length < 2) {
        ctx.addIssue({ path: ['company_name'], code: z.ZodIssueCode.custom, message: 'Company name is required (min. 2 characters)' });
      }
      if (!data.owner_signatory_name || data.owner_signatory_name.trim().length < 2) {
        ctx.addIssue({ path: ['owner_signatory_name'], code: z.ZodIssueCode.custom, message: 'Owner / signatory name is required' });
      }
      if (!data.company_description || data.company_description.trim().length < 20) {
        ctx.addIssue({ path: ['company_description'], code: z.ZodIssueCode.custom, message: 'Please describe your business (min. 20 characters)' });
      }
    }

    if (data.vendor_type === 'freelancer') {
      if (!data.company_description || data.company_description.trim().length < 20) {
        ctx.addIssue({ path: ['company_description'], code: z.ZodIssueCode.custom, message: 'Please describe your work (min. 20 characters)' });
      }
    }
  }
});

// ─────────────────────────────────────────────────────────────
function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: 'Weak', color: 'bg-red-400' };
  if (score <= 3) return { score, label: 'Medium', color: 'bg-amber-400' };
  return { score, label: 'Strong', color: 'bg-emerald-500' };
}

function PasswordStrengthBar({ password }) {
  const { score, label, color } = getPasswordStrength(password);
  if (!password) return null;
  const pct = Math.round((score / 5) * 100);

  return (
    <div className="mt-1.5 space-y-1">
      <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className={`text-xs font-medium ${score <= 1 ? 'text-red-500' : score <= 3 ? 'text-amber-500' : 'text-emerald-600'
        }`}>
        {label} password
      </p>
    </div>
  );
}

function formatPhone(raw) {
  let stripped = raw.replace(/[^\d+]/g, '');
  if (!stripped.startsWith('+962')) {
    if (stripped.startsWith('0')) stripped = stripped.slice(1);
    stripped = '+962' + stripped;
  }
  if (stripped.length > 13) stripped = stripped.slice(0, 13);
  return stripped;
}

function RoleToggle({ value, onChange }) {
  return (
    <div
      role="radiogroup"
      aria-label="Account type"
      className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl"
    >
      {[
        { role: 'customer', label: 'Client', icon: User },
        { role: 'vendor', label: 'Vendor', icon: Building2 },
      ].map(({ role, label, icon: Icon }) => (
        <button
          key={role}
          type="button"
          role="radio"
          aria-checked={value === role}
          onClick={() => onChange(role)}
          className={[
            'flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg',
            'text-sm font-semibold transition-all duration-200',
            value === role
              ? 'bg-white text-[var(--color-dark)] shadow-sm'
              : 'text-gray-500 hover:text-gray-700',
          ].join(' ')}
        >
          <Icon size={15} aria-hidden="true" />
          {label}
        </button>
      ))}
    </div>
  );
}

function VendorTypeToggle({ value, onChange, error }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-[var(--color-dark)]">
        Vendor Type <span className="text-red-500" aria-hidden="true">*</span>
      </span>
      <div className="grid grid-cols-2 gap-3">
        {[
          { type: 'company', label: 'Company / Establishment', icon: Building2, desc: 'Commercial Register or Occupational License required' },
          { type: 'freelancer', label: 'Freelancer / Individual', icon: User, desc: 'National ID required, portfolio mandatory' },
        ].map(({ type, label, icon: Icon, desc }) => (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={[
              'flex flex-col items-start gap-2 p-4 rounded-xl border-2 text-left transition-all duration-200',
              value === type
                ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/5'
                : 'border-gray-200 bg-white hover:border-gray-300',
            ].join(' ')}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${value === type ? 'bg-[var(--color-gold)] text-white' : 'bg-gray-100 text-gray-500'}`}>
              <Icon size={16} />
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--color-dark)]">{label}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </button>
        ))}
      </div>
      {error && (
        <p role="alert" className="text-xs text-red-500 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

function FileUploadField({ id, label, hint, required, accept, error, file, setFile }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-[var(--color-dark)]">
        {label}{required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
      </label>
      <label
        htmlFor={id}
        className={[
          'relative flex items-center gap-3 p-3.5 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200',
          file
            ? 'border-emerald-400 bg-emerald-50'
            : 'border-gray-200 bg-gray-50/50 hover:border-[var(--color-gold)] hover:bg-[var(--color-gold)]/5',
        ].join(' ')}
      >
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${file ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
          {file ? <CheckCircle2 size={16} /> : <Upload size={16} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${file ? 'text-emerald-700' : 'text-gray-500'}`}>
            {file?.name || 'Click to upload'}
          </p>
          {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
        </div>
        <input
          id={id}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </label>
      {error && (
        <p role="alert" className="text-xs text-red-500 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

function SectionDivider({ label }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="h-px flex-1 bg-gray-200" />
      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
        {label}
      </span>
      <div className="h-px flex-1 bg-gray-200" />
    </div>
  );
}

function InfoCallout({ children }) {
  return (
    <div className="flex items-start gap-2.5 p-3.5 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 leading-relaxed">
      <Info size={14} className="shrink-0 mt-0.5 text-blue-500" />
      <span>{children}</span>
    </div>
  );
}

function PortfolioSection({ isFreelancer, portfolioWebsite, onWebsiteChange, portfolioPdf, onPdfChange, socialMediaLinks, onSocialMediaChange, portfolioError }) {
  const [pdfName, setPdfName] = useState(portfolioPdf || '');

  const optionAFilled = (portfolioWebsite && portfolioWebsite.trim().length > 4) || pdfName;
  const optionBFilled = socialMediaLinks.length > 0 && socialMediaLinks.some(l => l.url.trim().length > 3);
  const portfolioProvided = optionAFilled || optionBFilled;

  const addSocialLink = () => {
    onSocialMediaChange([...socialMediaLinks, { platform: 'Instagram', url: '' }]);
  };

  const removeSocialLink = (index) => {
    onSocialMediaChange(socialMediaLinks.filter((_, i) => i !== index));
  };

  const updateSocialLink = (index, field, value) => {
    const updated = socialMediaLinks.map((link, i) =>
      i === index ? { ...link, [field]: value } : link
    );
    onSocialMediaChange(updated);
  };

  return (
    <div className="flex flex-col gap-4">
      {portfolioProvided && (
        <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
          <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
          <span className="text-xs font-bold text-emerald-700">✓ Portfolio provided</span>
        </div>
      )}

      {portfolioError && (
        <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 rounded-xl">
          <svg className="w-3.5 h-3.5 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-xs text-red-600 font-semibold">{portfolioError}</p>
        </div>
      )}

      {/* OPTION A: Professional Portfolio */}
      <div className={`rounded-xl border-2 p-4 flex flex-col gap-3 transition-colors ${optionAFilled ? 'border-emerald-300 bg-emerald-50/50' : 'border-gray-200 bg-gray-50/30'}`}>
        <div className="flex items-center gap-2">
          {optionAFilled ? <CheckCircle2 size={15} className="text-emerald-600 shrink-0" /> : <Briefcase size={15} className="text-gray-400 shrink-0" />}
          <p className="text-sm font-bold text-[var(--color-dark)]">Option A — Professional Portfolio</p>
        </div>
        <p className="text-xs text-gray-500 -mt-1">Share your website or upload a PDF portfolio</p>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-600">Website URL</label>
          <div className="relative">
            <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              id="portfolio-website"
              type="url"
              value={portfolioWebsite}
              onChange={(e) => onWebsiteChange(e.target.value)}
              placeholder="https://yourwebsite.com"
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/20 bg-white transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-600">PDF Portfolio</label>
          <label
            className={[
              'flex items-center gap-3 p-3 rounded-xl border-2 border-dashed cursor-pointer transition-all',
              pdfName ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 hover:border-[var(--color-gold)]/60 bg-white',
            ].join(' ')}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${pdfName ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
              {pdfName ? <CheckCircle2 size={14} /> : <Upload size={14} />}
            </div>
            <div className="min-w-0">
              <p className={`text-xs font-semibold truncate ${pdfName ? 'text-emerald-700' : 'text-gray-500'}`}>
                {pdfName || 'Upload PDF portfolio'}
              </p>
              <p className="text-[10px] text-gray-400">Max 10 MB, .pdf only</p>
            </div>
            <input
              type="file"
              accept=".pdf"
              className="sr-only"
              onChange={(e) => {
                const name = e.target.files?.[0]?.name ?? '';
                setPdfName(name);
                onPdfChange(name);
              }}
            />
          </label>
        </div>
      </div>

      {/* OPTION B: Social Media */}
      <div className={`rounded-xl border-2 p-4 flex flex-col gap-3 transition-colors ${optionBFilled ? 'border-emerald-300 bg-emerald-50/50' : 'border-gray-200 bg-gray-50/30'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {optionBFilled ? <CheckCircle2 size={15} className="text-emerald-600 shrink-0" /> : <InstagramIcon size={15} className="text-gray-400 shrink-0" />}
            <p className="text-sm font-bold text-[var(--color-dark)]">Option B — Social Media Presence</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 -mt-1">Share your social media profiles</p>

        {socialMediaLinks.length === 0 ? (
          <button
            type="button"
            onClick={addSocialLink}
            className="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm font-semibold text-gray-500 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all"
          >
            <Plus size={15} /> Add Social Media Account
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            {socialMediaLinks.map((link, index) => (
              <div key={index} className="flex items-center gap-2">
                <select
                  value={link.platform}
                  onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                  className="shrink-0 px-2.5 py-2 text-xs font-semibold border border-gray-200 rounded-lg outline-none focus:border-[var(--color-gold)] bg-white text-[var(--color-dark)]"
                >
                  {SOCIAL_PLATFORMS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                  placeholder="https://instagram.com/yourhandle"
                  className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/20 bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => removeSocialLink(index)}
                  className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addSocialLink}
              className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-gold)] hover:text-[var(--color-gold-dark)] transition-colors mt-1"
            >
              <Plus size={13} /> Add another
            </button>
          </div>
        )}
      </div>

      {isFreelancer && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 leading-relaxed">
          ⚠️ Freelancers must provide at least one portfolio option (A or B) to be considered for approval.
        </p>
      )}
    </div>
  );
}


function AccordionSection({ id, title, isOpen, onToggle, children }) {
  return (
    <div className="flex flex-col border border-gray-200 rounded-xl overflow-hidden bg-white mb-2">
      <button
        id={`${id}-header`}
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors w-full text-left"
      >
        <span className="font-bold text-[var(--color-dark)]">{title}</span>
        <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown size={18} className="text-gray-500" />
        </div>
      </button>
      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[2500px] opacity-100 p-5 border-t border-gray-200' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
function Signup() {
  const location = useLocation();
  const navigate = useNavigate();
  const { categories } = useCategoriesStore();
  const { login } = useAuthStore();

  const seedRole = location.state?.role === 'vendor' ? 'vendor' : 'customer';

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [socialMediaLinks, setSocialMediaLinks] = useState([]);
  const [portfolioError, setPortfolioError] = useState('');
  
  // Accordion state
  const [openSections, setOpenSections] = useState({
    step1: true,
    step2: false,
    step3: false,
    step4: false,
    step5: false,
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // File uploads
  const [docCr, setDocCr] = useState(null);
  const [docNidFront, setDocNidFront] = useState(null);
  const [docNidBack, setDocNidBack] = useState(null);
  const [docError, setDocError] = useState('');

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      role: seedRole,
      full_name: '',
      username: '',
      email: '',
      phone: '',
      password: '',
      confirm_password: '',
      vendor_type: undefined,
      company_name: '',
      owner_signatory_name: '',
      company_description: '',
      city: '',
      category: '',
      iban: '',
      portfolio_website: '',
      portfolio_pdf: '',
    },
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const watchedRole = watch('role');
  const watchedPassword = watch('password');
  const watchedVendorType = watch('vendor_type');
  const watchedPortfolioWebsite = watch('portfolio_website');
  const watchedPortfolioPdf = watch('portfolio_pdf');
  const isVendor = watchedRole === 'vendor';
  const isCompany = watchedVendorType === 'company';
  const isFreelancer = watchedVendorType === 'freelancer';

  useEffect(() => {
    if (!isVendor) {
      setValue('vendor_type', undefined);
      setValue('company_name', '');
      setValue('owner_signatory_name', '');
      setValue('company_description', '');
      setValue('city', '');
      setValue('category', '');
      setValue('iban', '');
      setValue('portfolio_website', '');
      setValue('portfolio_pdf', '');
      setSocialMediaLinks([]);
      setPortfolioError('');
      setOpenSections(prev => ({ ...prev, step1: true, step2: false, step3: false, step4: false, step5: false }));
    }
  }, [isVendor, setValue]);


  const stepMap = {
    full_name: 'step1',
    username: 'step1',
    email: 'step1',
    phone: 'step1',
    password: 'step1',
    confirm_password: 'step1',
    vendor_type: 'step1',

    company_name: 'step2',
    owner_signatory_name: 'step2',
    company_description: 'step2',
    city: 'step2',
    category: 'step2',

    iban: 'step5'
  };

  const onError = (errors) => {
    const sectionsToOpen = { ...openSections };
    let firstErrorElement = null;

    for (const field of Object.keys(errors)) {
      const step = stepMap[field];
      if (step) {
        sectionsToOpen[step] = true;
      }
      if (!firstErrorElement) {
        firstErrorElement = document.getElementsByName(field)[0] || document.getElementById(`signup-${field.replace(/_/g, '-')}`);
      }
    }
    setOpenSections(sectionsToOpen);

    if (firstErrorElement) {
      setTimeout(() => {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstErrorElement.focus({ preventScroll: true });
      }, 100);
    }
  };

  const onSubmit = async (data) => {
    let hasLocalErrors = false;
    const sectionsToOpen = { ...openSections };

    if (isVendor) {
      setDocError('');
      if (isCompany) {
        if (!docCr || !docNidFront || !docNidBack) {
          setDocError('Please upload all required documents.');
          hasLocalErrors = true;
          sectionsToOpen.step3 = true;
        }
      } else if (isFreelancer) {
        if (!docNidFront || !docNidBack) {
          setDocError('Please upload both sides of your National ID.');
          hasLocalErrors = true;
          sectionsToOpen.step3 = true;
        }
      }

      if (isFreelancer) {
        const hasWebsite = watchedPortfolioWebsite && watchedPortfolioWebsite.trim().length > 4;
        const hasPdf = watchedPortfolioPdf && watchedPortfolioPdf.trim().length > 0;
        const hasSocial = socialMediaLinks.some(l => l.url.trim().length > 3);
        if (!hasWebsite && !hasPdf && !hasSocial) {
          setPortfolioError('Freelancers must provide at least one portfolio option (website, PDF, or social media)');
          hasLocalErrors = true;
          sectionsToOpen.step4 = true;
        } else {
          setPortfolioError('');
        }
      } else {
        setPortfolioError('');
      }
    }

    if (hasLocalErrors) {
      setOpenSections(sectionsToOpen);
      if (sectionsToOpen.step3) {
        setTimeout(() => document.getElementById('step3-header')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
      } else if (sectionsToOpen.step4) {
        setTimeout(() => document.getElementById('step4-header')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
      }
      return;
    }

    const payload = { ...data, socialMediaLinks };

    try {
      await new Promise((r) => setTimeout(r, 1200));
      
      const mockUser = {
        id: Math.floor(Math.random() * 1000) + 10,
        full_name: data.full_name,
        username: data.username,
        email: data.email,
        role: data.role,
        avatar_url: null
      };
      const mockToken = `mock-jwt-${mockUser.role}-${Date.now()}`;
      login(mockUser, mockToken);
      
      if (data.role === 'vendor') {
        navigate('/vendor/dashboard');
      } else {
        navigate('/home');
      }
    } catch (err) {
      console.error('Registration error:', err);
    }
  };

  const ibanLabel = isCompany
    ? 'Company IBAN (must match Commercial Register name)'
    : 'IBAN (must match your National ID name)';

  // Only render active step fields
  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl">

        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-2xl font-black text-[var(--color-dark)] tracking-tight">
              EVEN<span className="text-[var(--color-gold)]">TAT</span>
            </span>
          </Link>
          <h1 className="text-2xl font-extrabold text-[var(--color-dark)]">
            Create your account
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Join Jordan's premier event planning marketplace
          </p>
        </div>

        {/* ── Match Login.jsx design ── */}
        <div className="bg-white rounded-2xl shadow-[var(--shadow-modal)] border border-gray-100 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-[var(--color-gold-dark)] via-[var(--color-gold)] to-[var(--color-gold-light)]" />
          <div className="px-6 sm:px-8 pt-8 pb-10">
            <form onSubmit={handleSubmit(onSubmit, onError)} noValidate className="flex flex-col gap-3">
              


              {/* STEP 1 / BASIC INFO */}
              {(!isVendor || true) && (
                <AccordionSection
                  id="step1"
                  title="1. Basic Information"
                  isOpen={!isVendor || openSections.step1}
                  onToggle={() => isVendor && toggleSection('step1')}
                >
                <div className="flex flex-col gap-5">
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <RoleToggle value={field.value} onChange={field.onChange} />
                    )}
                  />

                  <SectionDivider label="Account Information" />

                  <Input
                    id="signup-fullname"
                    label="Full Name"
                    placeholder="Diyaa Daifi"
                    required
                    autoComplete="name"
                    error={errors.full_name?.message}
                    {...register('full_name')}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      id="signup-username"
                      label="Username"
                      placeholder="d4d"
                      required
                      autoComplete="username"
                      error={errors.username?.message}
                      hint="Letters, numbers, underscores only"
                      {...register('username')}
                    />
                    <Input
                      id="signup-email"
                      label="Email Address"
                      type="email"
                      placeholder="you@email.com"
                      required
                      autoComplete="email"
                      error={errors.email?.message}
                      {...register('email')}
                    />
                  </div>

                  <Input
                    id="signup-phone"
                    label="Phone Number"
                    placeholder="+962 7X XXX XXXX"
                    required
                    type="tel"
                    autoComplete="tel"
                    error={errors.phone?.message}
                    hint="Jordanian mobile (+962 7X...)"
                    {...register('phone', {
                      onChange: (e) => {
                        e.target.value = formatPhone(e.target.value);
                      },
                    })}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Input
                        id="signup-password"
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="At least 8 characters"
                        required
                        autoComplete="new-password"
                        error={errors.password?.message}
                        rightIcon={
                          <button type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        }
                        {...register('password')}
                      />
                      <PasswordStrengthBar password={watchedPassword} />
                    </div>

                    <Input
                      id="signup-confirm"
                      label="Confirm Password"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Repeat password"
                      required
                      autoComplete="new-password"
                      error={errors.confirm_password?.message}
                      rightIcon={
                        <button type="button" onClick={() => setShowConfirm(v => !v)} aria-label={showConfirm ? 'Hide' : 'Show'}>
                          {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      }
                      {...register('confirm_password')}
                    />
                  </div>

                  {isVendor && (
                    <>
                      <SectionDivider label="Vendor Type" />
                      <Controller
                        name="vendor_type"
                        control={control}
                        render={({ field }) => (
                          <VendorTypeToggle
                            value={field.value}
                            onChange={field.onChange}
                            error={errors.vendor_type?.message}
                          />
                        )}
                      />
                    </>
                  )}
                </div>
                </AccordionSection>
              )}

              {/* STEP 2: BUSINESS INFO */}
              {isVendor && (
                <AccordionSection
                  id="step2"
                  title="2. Business Information"
                  isOpen={openSections.step2}
                  onToggle={() => toggleSection('step2')}
                >
                  <div className="flex flex-col gap-5">

                  {isCompany && (
                    <>
                      <Input
                        id="signup-company-name"
                        label="Company / Business Name"
                        placeholder="Royal Events Co."
                        required
                        error={errors.company_name?.message}
                        leftIcon={<Building2 size={15} />}
                        {...register('company_name')}
                      />
                      <Input
                        id="signup-signatory"
                        label="Owner / Authorized Signatory Name"
                        placeholder="Name as in Commercial Register"
                        required
                        error={errors.owner_signatory_name?.message}
                        leftIcon={<IdCard size={15} />}
                        hint="Must match your Commercial Register exactly"
                        {...register('owner_signatory_name')}
                      />
                    </>
                  )}

                  {isFreelancer && (
                    <Input
                      id="signup-display-name"
                      label="Display / Professional Name"
                      required
                      placeholder="Your name as you want it shown"
                      error={errors.owner_signatory_name?.message}
                      leftIcon={<User size={15} />}
                      hint="Must match your National ID name exactly"
                      {...register('owner_signatory_name')}
                    />
                  )}

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="signup-description" className="text-sm font-medium text-[var(--color-dark)]">
                      {isCompany ? 'Business Description' : 'About Your Work'}
                      <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>
                    </label>
                    <textarea
                      id="signup-description"
                      rows={3}
                      placeholder={isCompany ? 'Describe your business, services, and experience…' : 'Describe your work, skills, and what makes you unique…'}
                      className={[
                        'w-full rounded-xl border px-4 py-3 text-sm resize-none outline-none transition-all',
                        'focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/20',
                        errors.company_description ? 'border-red-400 bg-red-50/30' : 'border-gray-200',
                      ].join(' ')}
                      {...register('company_description')}
                    />
                    {errors.company_description && (
                      <p role="alert" className="text-xs text-red-500 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.company_description.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="signup-city" className="text-sm font-medium text-[var(--color-dark)]">
                        City <span className="text-red-500" aria-hidden="true">*</span>
                      </label>
                      <select
                        id="signup-city"
                        className={[
                          'w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all bg-white',
                          'focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/20',
                          errors.city ? 'border-red-400 bg-red-50/30' : 'border-gray-200',
                        ].join(' ')}
                        {...register('city')}
                      >
                        <option value="">Select city…</option>
                        {JORDAN_CITIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      {errors.city && <p className="text-xs text-red-500">{errors.city.message}</p>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="signup-category" className="text-sm font-medium text-[var(--color-dark)]">
                        Service Category <span className="text-red-500" aria-hidden="true">*</span>
                      </label>
                      <select
                        id="signup-category"
                        className={[
                          'w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all bg-white',
                          'focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/20',
                          errors.category ? 'border-red-400 bg-red-50/30' : 'border-gray-200',
                        ].join(' ')}
                        {...register('category')}
                      >
                        <option value="">Select category…</option>
                        {categories.filter(c => c.isActive).map((c) => (
                          <option key={c.slug} value={c.slug}>{c.name}</option>
                        ))}
                      </select>
                      {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
                    </div>
                  </div>
                </div>
                </AccordionSection>
              )}

              {/* STEP 3: DOCUMENTS */}
              {isVendor && (
                <AccordionSection
                  id="step3"
                  title="3. Identity Documents"
                  isOpen={openSections.step3}
                  onToggle={() => toggleSection('step3')}
                >
                  <div className="flex flex-col gap-5">

                  {docError && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm font-semibold rounded-xl border border-red-200">
                      {docError}
                    </div>
                  )}

                  {isCompany && (
                    <>
                      <InfoCallout>
                        Companies must upload either a Commercial Register or Occupational License, plus the National ID of the authorized signatory.
                      </InfoCallout>
                      <FileUploadField
                        id="doc-commercial-register"
                        label="Commercial Register / Occupational License"
                        hint="PDF or image, max 5 MB"
                        required
                        accept="application/pdf,image/*"
                        file={docCr}
                        setFile={setDocCr}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <FileUploadField
                          id="doc-nid-front"
                          label="National ID — Front"
                          hint="Clear photo, JPG/PNG"
                          required
                          accept="image/*"
                          file={docNidFront}
                          setFile={setDocNidFront}
                        />
                        <FileUploadField
                          id="doc-nid-back"
                          label="National ID — Back"
                          hint="Clear photo, JPG/PNG"
                          required
                          accept="image/*"
                          file={docNidBack}
                          setFile={setDocNidBack}
                        />
                      </div>
                    </>
                  )}

                  {isFreelancer && (
                    <>
                      <InfoCallout>
                        Freelancers must upload their National ID (front and back). Your full name above must match the ID exactly.
                      </InfoCallout>
                      <div className="grid grid-cols-2 gap-3">
                        <FileUploadField
                          id="doc-nid-front-fl"
                          label="National ID — Front"
                          hint="Clear photo, JPG/PNG"
                          required
                          accept="image/*"
                          file={docNidFront}
                          setFile={setDocNidFront}
                        />
                        <FileUploadField
                          id="doc-nid-back-fl"
                          label="National ID — Back"
                          hint="Clear photo, JPG/PNG"
                          required
                          accept="image/*"
                          file={docNidBack}
                          setFile={setDocNidBack}
                        />
                      </div>
                    </>
                  )}
                </div>
                </AccordionSection>
              )}

              {/* STEP 4: PORTFOLIO */}
              {isVendor && (
                <AccordionSection
                  id="step4"
                  title={`4. Portfolio ${isFreelancer ? '(Required)' : '(Optional)'}`}
                  isOpen={openSections.step4}
                  onToggle={() => toggleSection('step4')}
                >
                  <div className="flex flex-col gap-5">
                  <div id="portfolio-section">
                    <PortfolioSection
                      isFreelancer={isFreelancer}
                      portfolioWebsite={watchedPortfolioWebsite}
                      onWebsiteChange={(v) => setValue('portfolio_website', v)}
                      portfolioPdf={watchedPortfolioPdf}
                      onPdfChange={(v) => setValue('portfolio_pdf', v)}
                      socialMediaLinks={socialMediaLinks}
                      onSocialMediaChange={setSocialMediaLinks}
                      portfolioError={portfolioError}
                    />
                  </div>
                </div>
                </AccordionSection>
              )}

              {/* STEP 5: BANK ACCOUNT */}
              {isVendor && (
                <AccordionSection
                  id="step5"
                  title="5. Bank Account"
                  isOpen={openSections.step5}
                  onToggle={() => toggleSection('step5')}
                >
                  <div className="flex flex-col gap-5">
                  <InfoCallout>
                    Your IBAN must match the name on your {isCompany ? 'Commercial Register' : 'National ID'}. This is required to receive payouts from Eventat.
                  </InfoCallout>
                  <Input
                    id="signup-iban"
                    label={ibanLabel}
                    placeholder="JO94 CBJO 0010 0000 0000 0131 0003 02"
                    required
                    leftIcon={<LinkIcon size={15} />}
                    error={errors.iban?.message}
                    hint="Jordanian IBAN starts with JO followed by 28 characters"
                    {...register('iban')}
                  />
                </div>
                </AccordionSection>
              )}

              <p className="text-xs text-gray-400 leading-relaxed text-center mt-2">
                By creating an account you agree to our{' '}
                <a href="/terms" className="text-[var(--color-gold)] hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="/privacy" className="text-[var(--color-gold)] hover:underline">Privacy Policy</a>.
                {isVendor && ' Vendor accounts are subject to approval review.'}
              </p>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isSubmitting}
                rightIcon={!isSubmitting ? <ArrowRight size={17} /> : null}
                className="rounded-full mt-2"
              >
                {isVendor ? 'Submit Vendor Application' : 'Create Client Account'}
              </Button>

              {isVendor && (
                <p className="text-center text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 leading-relaxed">
                  🕐 Vendor applications are reviewed within <strong>1–2 business days</strong>. You'll receive an email confirmation once approved.
                </p>
              )}
            </form>

            <div className="relative flex items-center my-6">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="mx-3 text-xs text-gray-400 font-medium">or</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-[var(--color-gold)] hover:text-[var(--color-gold-dark)] transition-colors"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
