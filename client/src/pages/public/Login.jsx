import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, LogIn } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import useAuthStore from '../../store/authStore';
import * as authService from '../../services/auth.service';
import { toastSuccess, toastError } from '../../utils/toast';

// ─────────────────────────────────────────────────────────────
//  Role → redirect map (mirrors ProtectedRoute ROLE_HOME)
// ─────────────────────────────────────────────────────────────
const ROLE_REDIRECT = {
  customer: '/home',
  vendor: '/vendor/dashboard',
  admin: '/admin/dashboard',
};

// ─────────────────────────────────────────────────────────────
//  Zod validation schema
// ─────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  remember_me: z.boolean().optional(),
});

// ─────────────────────────────────────────────────────────────
//  Login component
// ─────────────────────────────────────────────────────────────
function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  // ── Already-logged-in guard ───────────────────────────────
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirect = ROLE_REDIRECT[user.role] ?? '/home';
      navigate(redirect, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember_me: false },
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  // ── Login mutation ────────────────────────────────────────
  const loginMutation = useMutation({
    mutationFn: (credentials) => authService.login(credentials),
    onSuccess: (res) => {
      // res = { success, data: { user, token } }
      const { user: loggedInUser, token } = res.data;
      login(loggedInUser, token); // authStore action — handles localStorage
      toastSuccess(`Welcome back, ${loggedInUser.full_name?.split(' ')[0]}! 👋`);
      const redirect = ROLE_REDIRECT[loggedInUser.role] ?? '/home';
      navigate(redirect, { replace: true });
    },
    onError: (err) => {
      const msg =
        err.response?.data?.error ?? 'Login failed. Check your email and password.';
      toastError(msg);
    },
  });

  // ── Submit handler ────────────────────────────────────────
  const onSubmit = (data) => {
    loginMutation.mutate({
      email: data.email.trim().toLowerCase(),
      password: data.password,
    });
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* ── Card ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-[var(--shadow-modal)] border border-gray-100 overflow-hidden">

          {/* Gold gradient top strip — mirrors Signup design */}
          <div className="h-1.5 bg-gradient-to-r from-[var(--color-gold-dark)] via-[var(--color-gold)] to-[var(--color-gold-light)]" />

          <div className="px-8 pt-8 pb-10">

            {/* ── Heading ──────────────────────────────────── */}
            <div className="text-center mb-8">
              <Link to="/" className="inline-block mb-5" aria-label="Go to homepage">
                <span className="text-2xl font-extrabold tracking-tight text-[var(--color-dark)]">
                  EVEN<span className="text-[var(--color-gold)]">TAT</span>
                </span>
              </Link>

              <div className="flex items-center justify-center gap-2.5 mb-2">
                <div className="w-9 h-9 rounded-xl bg-[var(--color-gold)]/10 flex items-center justify-center">
                  <LogIn size={18} className="text-[var(--color-gold)]" />
                </div>
                <h1 className="text-xl font-bold text-[var(--color-dark)]">
                  Welcome back
                </h1>
              </div>
              <p className="text-sm text-gray-500">
                Log in to continue planning your perfect event
              </p>
            </div>

            {/* ── Form ─────────────────────────────────────── */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

              {/* Email */}
              <Input
                id="login-email"
                label="Email Address"
                type="email"
                placeholder="hello@example.com"
                required
                leftIcon={<Mail size={15} />}
                error={errors.email?.message}
                {...register('email')}
              />

              {/* Password */}
              <div>
                <Input
                  id="login-password"
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

                {/* Forgot password link — sits flush right under the field */}
                <div className="flex justify-end mt-1.5">
                  <Link
                    to="/forgot-password"
                    className="text-xs text-[var(--color-gold)] hover:text-[var(--color-gold-dark)] transition-colors font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Remember me checkbox */}
              <label
                htmlFor="login-remember"
                className="flex items-center gap-2.5 cursor-pointer group select-none"
              >
                <div className="relative flex items-center">
                  <input
                    id="login-remember"
                    type="checkbox"
                    className="peer sr-only"
                    {...register('remember_me')}
                  />
                  {/* Custom checkbox box */}
                  <div className="w-4.5 h-4.5 w-[18px] h-[18px] rounded border-2 border-gray-300 bg-white
                                  peer-checked:border-[var(--color-gold)] peer-checked:bg-[var(--color-gold)]
                                  peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-gold)]/30
                                  transition-all duration-150 flex items-center justify-center">
                    {/* Checkmark — always rendered, opacity driven by peer-checked */}
                    <svg
                      className="w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={3}
                      viewBox="0 0 12 12"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                    </svg>
                  </div>
                </div>
                <span className="text-sm text-gray-600 group-hover:text-[var(--color-dark)] transition-colors">
                  Remember me
                </span>
              </label>

              {/* Submit */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loginMutation.isPending}
                disabled={loginMutation.isPending}
                rightIcon={!loginMutation.isPending ? <ArrowRight size={17} /> : null}
                className="rounded-full mt-2"
              >
                {loginMutation.isPending ? 'Logging in…' : 'Log In'}
              </Button>
            </form>

            {/* ── Divider ───────────────────────────────────── */}
            <div className="relative flex items-center my-6">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="mx-3 text-xs text-gray-400 font-medium">or</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* ── Sign up link ──────────────────────────────── */}
            <p className="text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-semibold text-[var(--color-gold)] hover:text-[var(--color-gold-dark)] transition-colors"
              >
                Create one
              </Link>
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;
