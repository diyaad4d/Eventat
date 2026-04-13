import { Toaster, toast } from 'react-hot-toast';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
//  Toast — configured React Hot Toast wrapper with Eventat brand styles.
//
//  Usage:
//    1. Place <Toast /> once at the root (inside App.jsx or main.jsx).
//    2. Use the exported helpers anywhere:
//         toast.success('Booking confirmed!')
//         showToast.success('...')
//         showToast.error('...')
//         showToast.warning('...')
//         showToast.info('...')
// ─────────────────────────────────────────────────────────────

// ── Custom toast renderer ─────────────────────────────────────

function ToastContent({ t, icon, message, borderColor }) {
  return (
    <div
      className={[
        'flex items-start gap-3 bg-white rounded-xl shadow-[var(--shadow-modal)] border-l-4 px-4 py-3 min-w-[280px] max-w-sm',
        `transition-all duration-300`,
        t.visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2',
      ].join(' ')}
      style={{ borderLeftColor: borderColor }}
    >
      <span className="shrink-0 mt-0.5">{icon}</span>
      <p className="text-sm text-[var(--color-dark)] leading-relaxed flex-1">
        {message}
      </p>
      <button
        onClick={() => toast.dismiss(t.id)}
        className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors ml-1"
        aria-label="Dismiss"
      >
        <XCircle size={16} />
      </button>
    </div>
  );
}

// ── Branded helper functions ──────────────────────────────────

export const showToast = {
  success: (message, options = {}) =>
    toast.custom(
      (t) => (
        <ToastContent
          t={t}
          message={message}
          borderColor="var(--color-success, #22C55E)"
          icon={<CheckCircle size={18} className="text-green-500" />}
        />
      ),
      { duration: 4000, ...options },
    ),

  error: (message, options = {}) =>
    toast.custom(
      (t) => (
        <ToastContent
          t={t}
          message={message}
          borderColor="var(--color-error, #EF4444)"
          icon={<XCircle size={18} className="text-red-500" />}
        />
      ),
      { duration: 5000, ...options },
    ),

  warning: (message, options = {}) =>
    toast.custom(
      (t) => (
        <ToastContent
          t={t}
          message={message}
          borderColor="var(--color-warning, #F59E0B)"
          icon={<AlertCircle size={18} className="text-amber-500" />}
        />
      ),
      { duration: 4500, ...options },
    ),

  info: (message, options = {}) =>
    toast.custom(
      (t) => (
        <ToastContent
          t={t}
          message={message}
          borderColor="var(--color-info, #3B82F6)"
          icon={<Info size={18} className="text-blue-500" />}
        />
      ),
      { duration: 4000, ...options },
    ),
};

// ── <Toast /> component — place once in your app tree ─────────

function Toast() {
  return (
    <Toaster
      position="top-right"
      gutter={10}
      containerStyle={{ top: 72 }} // below navbar
      toastOptions={{
        // Fallback styles for native react-hot-toast calls
        style: {
          fontFamily: 'var(--font-sans)',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-modal)',
          color: 'var(--color-dark)',
          fontSize: '14px',
        },
        success: {
          iconTheme: {
            primary: 'var(--color-gold)',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}

export default Toast;
