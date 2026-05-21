import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  User,
  AtSign,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Building2,
  FileText,
  MapPin,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { showToast } from '../../components/ui/Toast';

// ─────────────────────────────────────────────────────────────
//  Jordanian governorates — used for the City dropdown
// ─────────────────────────────────────────────────────────────
const JORDANIAN_CITIES = [
  'Amman', 'Irbid', 'Zarqa', 'Aqaba', 'Mafraq', 'Jerash',
  'Madaba', 'Ajloun', 'Karak', 'Tafilah', "Ma'an", 'Balqa',
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
  // Vendor-only — optional by default, required conditionally below
  company_name: z.string().max(150).optional(),
  company_description: z.string().max(1000).optional(),
  city: z.string().max(100).optional(),
}).superRefine((data, ctx) => {
  // Confirm password match
  if (data.password !== data.confirm_password) {
    ctx.addIssue({
      path: ['confirm_password'],
      code: z.ZodIssueCode.custom,
      message: 'Passwords do not match',
    });
  }
  // Vendor-required fields
  if (data.role === 'vendor') {
    if (!data.company_name || data.company_name.trim().length < 2) {
      ctx.addIssue({
        path: ['company_name'],
        code: z.ZodIssueCode.custom,
        message: 'Company name is required for vendors (min. 2 characters)',
      });
    }
    if (!data.company_description || data.company_description.trim().length < 20) {
      ctx.addIssue({
        path: ['company_description'],
        code: z.ZodIssueCode.custom,
        message: 'Please describe your business (min. 20 characters)',
      });
    }
    if (!data.city || data.city.trim().length < 2) {
      ctx.addIssue({
        path: ['city'],
        code: z.ZodIssueCode.custom,
        message: 'City is required for vendors',
      });
    }
  }
});

// ─────────────────────────────────────────────────────────────
//  Password strength helpers
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

// ─────────────────────────────────────────────────────────────
//  Phone formatter — formats as +962 X XXX XXXX
// ─────────────────────────────────────────────────────────────
function formatPhone(raw) {
  // Strip everything except digits and leading +
  let stripped = raw.replace(/[^\d+]/g, '');
  if (!stripped.startsWith('+962')) {
    if (stripped.startsWith('0')) stripped = stripped.slice(1);
    stripped = '+962' + stripped;
  }
  if (stripped.length > 13) {
    stripped = stripped.slice(0, 13);
  }
  return stripped;
}

// ─────────────────────────────────────────────────────────────
//  Role Toggle Component
// ─────────────────────────────────────────────────────────────
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
            'flex items-center justify-center gap-2 rounded-lg py-2.5 px-4 text-sm font-semibold',
            'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]',
            value === role
              ? 'bg-white text-[var(--color-gold)] shadow-sm'
              : 'text-gray-500 hover:text-[var(--color-dark)]',
          ].join(' ')}
        >
          <Icon size={15} />
          {label}
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Main Signup component
// ─────────────────────────────────────────────────────────────
function Signup() {
  const location = useLocation();
  const navigate = useNavigate();

  // Seed role from router state (passed from Landing page)
  const seedRole = location.state?.role === 'vendor' ? 'vendor' : 'customer';

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
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
      company_name: '',
      company_description: '',
      city: '',
    },
    mode: 'onBlur',       // validate on blur for inline errors
    reValidateMode: 'onChange', // re-validate on change after first submit
  });

  const watchedRole = watch('role');
  const watchedPassword = watch('password');
  const isVendor = watchedRole === 'vendor';

  // When role changes clear vendor errors so they don't show for customers
  useEffect(() => {
    if (!isVendor) {
      setValue('company_name', '');
      setValue('company_description', '');
      setValue('city', '');
    }
  }, [isVendor, setValue]);

  // ── Submit handler ─────────────────────────────────────────
  const onSubmit = async (data) => {
    // Simulate a 1.5s API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // In a real app: await authService.register(data)
    // For now, simulate success
    showToast.success(
      `Account created! Welcome to Eventat, ${data.full_name.split(' ')[0]}. Please log in.`
    );
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* ── Card ───────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-[var(--shadow-modal)] border border-gray-100 overflow-hidden">

          {/* Card header strip */}
          <div className="h-1.5 bg-gradient-to-r from-[var(--color-gold-dark)] via-[var(--color-gold)] to-[var(--color-gold-light)]" />

          <div className="px-8 pt-8 pb-10">

            {/* Heading */}
            <div className="text-center mb-8">
              <Link to="/" className="inline-block mb-5">
                <span className="text-2xl font-extrabold tracking-tight text-[var(--color-dark)]">
                  EVEN<span className="text-[var(--color-gold)]">TAT</span>
                </span>
              </Link>
              <h1 className="text-xl font-bold text-[var(--color-dark)] mb-1">
                Create your account
              </h1>
              <p className="text-sm text-gray-500">
                Join thousands of event planners on Eventat
              </p>
            </div>

            {/* ── Form ─────────────────────────────────────── */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

              {/* Role Toggle — controlled via react-hook-form Controller */}
              <div className="space-y-1.5">
                <span className="text-sm font-medium text-[var(--color-dark)]">
                  I am a <span className="text-red-500" aria-hidden="true">*</span>
                </span>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <RoleToggle value={field.value} onChange={field.onChange} />
                  )}
                />
              </div>

              {/* Full Name */}
              <Input
                id="signup-full-name"
                label="Full Name"
                placeholder="Diyaa Al-Daifi"
                required
                leftIcon={<User size={15} />}
                error={errors.full_name?.message}
                {...register('full_name')}
              />

              {/* Username */}
              <Input
                id="signup-username"
                label="Username"
                placeholder="d4d"
                required
                leftIcon={<AtSign size={15} />}
                error={errors.username?.message}
                hint="Letters, numbers, and underscores only"
                {...register('username')}
              />

              {/* Email */}
              <Input
                id="signup-email"
                label="Email Address"
                type="email"
                placeholder="hello@example.com"
                required
                leftIcon={<Mail size={15} />}
                error={errors.email?.message}
                {...register('email')}
              />

              {/* Phone */}
              <Input
                id="signup-phone"
                label="Phone Number"
                type="tel"
                placeholder="+962 7 8000 0000"
                required
                leftIcon={<Phone size={15} />}
                error={errors.phone?.message}
                {...register('phone', {
                  onChange: (e) => {
                    e.target.value = formatPhone(e.target.value);
                  },
                })}
              />

              {/* Password */}
              <div>
                <Input
                  id="signup-password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  required
                  leftIcon={<Lock size={15} />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="text-gray-400 hover:text-[var(--color-gold)] transition-colors"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  }
                  error={errors.password?.message}
                  {...register('password')}
                />
                {/* Password strength bar */}
                <PasswordStrengthBar password={watchedPassword} />
              </div>

              {/* Confirm Password */}
              <Input
                id="signup-confirm-password"
                label="Confirm Password"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Repeat your password"
                required
                leftIcon={<Lock size={15} />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    className="text-gray-400 hover:text-[var(--color-gold)] transition-colors"
                  >
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
                error={errors.confirm_password?.message}
                {...register('confirm_password')}
              />

              {/* ── Vendor-only fields (animated reveal) ──── */}
              <div
                className={[
                  'overflow-hidden transition-all duration-500 ease-in-out',
                  isVendor ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0',
                ].join(' ')}
                aria-hidden={!isVendor}
              >
                <div className="pt-1 space-y-5">
                  {/* Divider label */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gray-100" />
                    <span className="text-xs font-semibold text-[var(--color-gold)] uppercase tracking-wider">
                      Vendor Details
                    </span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>

                  {/* Company Name */}
                  <Input
                    id="signup-company-name"
                    label="Company Name"
                    placeholder="Al-Noor Events & Catering"
                    required={isVendor}
                    leftIcon={<Building2 size={15} />}
                    error={errors.company_name?.message}
                    {...register('company_name')}
                  />

                  {/* Company Description */}
                  <div className="flex flex-col gap-1.5 w-full">
                    <label
                      htmlFor="signup-company-desc"
                      className="text-sm font-medium text-[var(--color-dark)]"
                    >
                      Business Description
                      {isVendor && (
                        <span className="ml-0.5 text-red-500" aria-hidden="true">*</span>
                      )}
                    </label>
                    <div className="relative">
                      <span className="absolute top-3 left-3 text-gray-400 pointer-events-none">
                        <FileText size={15} />
                      </span>
                      <textarea
                        id="signup-company-desc"
                        rows={3}
                        placeholder="Describe your services, experience, and what makes your business unique..."
                        aria-invalid={!!errors.company_description}
                        className={[
                          'w-full rounded-lg border bg-white text-sm text-[var(--color-dark)] pl-10 pr-4 py-2.5',
                          'placeholder:text-gray-400 transition-all duration-150 outline-none resize-none',
                          errors.company_description
                            ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-200'
                            : 'border-gray-200 focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/20',
                        ].join(' ')}
                        {...register('company_description')}
                      />
                    </div>
                    {errors.company_description && (
                      <p role="alert" className="text-xs text-red-500 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.company_description.message}
                      </p>
                    )}
                  </div>

                  {/* City — dropdown of Jordanian governorates */}
                  <div className="flex flex-col gap-1.5 w-full">
                    <label
                      htmlFor="signup-city"
                      className="text-sm font-medium text-[var(--color-dark)]"
                    >
                      City
                      {isVendor && (
                        <span className="ml-0.5 text-red-500" aria-hidden="true">*</span>
                      )}
                    </label>

                    <div className="relative flex items-center">
                      {/* MapPin icon — left */}
                      <span className="absolute left-3 flex items-center text-gray-400 pointer-events-none z-10">
                        <MapPin size={15} />
                      </span>

                      <select
                        id="signup-city"
                        aria-invalid={!!errors.city}
                        aria-describedby={errors.city ? 'signup-city-error' : undefined}
                        className={[
                          'w-full appearance-none rounded-lg border bg-white text-sm',
                          'pl-10 pr-10 py-2.5 outline-none transition-all duration-150',
                          'text-[var(--color-dark)] cursor-pointer',
                          errors.city
                            ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-200'
                            : 'border-gray-200 focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/20',
                        ].join(' ')}
                        {...register('city')}
                      >
                        <option value="" disabled>Select your city</option>
                        {JORDANIAN_CITIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>

                      {/* Chevron icon — right */}
                      <span className="pointer-events-none absolute right-3 text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </div>

                    {/* Error message */}
                    {errors.city && (
                      <p
                        id="signup-city-error"
                        role="alert"
                        className="text-xs text-red-500 flex items-center gap-1"
                      >
                        <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.city.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Terms notice ──────────────────────────── */}
              <p className="text-xs text-gray-400 leading-relaxed text-center">
                By creating an account you agree to our{' '}
                <a href="/terms" className="text-[var(--color-gold)] hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="/privacy" className="text-[var(--color-gold)] hover:underline">Privacy Policy</a>.
              </p>

              {/* ── Submit ────────────────────────────────── */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isSubmitting}
                rightIcon={!isSubmitting ? <ArrowRight size={17} /> : null}
                className="rounded-full mt-2"
              >
                {isVendor ? 'Create Vendor Account' : 'Create Client Account'}
              </Button>
            </form>

            {/* ── Footer link ───────────────────────────────── */}
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

        {/* Feature highlights below card
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: CheckCircle, text: 'Free to join' },
            { icon: CheckCircle, text: 'No hidden fees' },
            { icon: CheckCircle, text: 'Verified vendors' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex flex-col items-center gap-1.5">
              <Icon size={16} className="text-[var(--color-gold)]" />
              <span className="text-xs text-gray-500 font-medium">{text}</span>
            </div>
          ))}
        </div> */}
      </div>
    </div>
  );
}

export default Signup;
