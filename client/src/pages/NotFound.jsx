import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

// ─────────────────────────────────────────────────────────────
//  NotFound — 404 page
//  Shown for any unmatched route.
//  Step 8.1 (full branded illustration will be added here)
// ─────────────────────────────────────────────────────────────

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--color-surface)] px-4 text-center">
      {/* Decorative number */}
      <div className="relative select-none mb-6">
        <span
          className="text-[10rem] sm:text-[14rem] font-extrabold leading-none text-[var(--color-gold)]/10 tracking-tight"
          aria-hidden="true"
        >
          404
        </span>
        <span className="absolute inset-0 flex items-center justify-center text-5xl sm:text-7xl font-extrabold text-[var(--color-gold)] tracking-tight">
          404
        </span>
      </div>

      {/* Message */}
      <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-dark)] mb-3">
        Oops, this page doesn't exist
      </h1>
      <p className="text-gray-500 max-w-md mb-10 leading-relaxed">
        The page you're looking for may have been moved, deleted, or never
        existed. Let's get you back on track.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-gold)] text-white font-semibold text-sm hover:bg-[var(--color-gold-dark)] transition-colors shadow-md"
        >
          <Home size={16} />
          Go Back Home
        </Link>
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-[var(--color-dark-soft)] font-semibold text-sm hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-colors"
        >
          <ArrowLeft size={16} />
          Go Back
        </button>
      </div>

      {/* Subtle brand footer line */}
      <p className="mt-16 text-xs text-gray-300 tracking-widest uppercase">
        EVEN<span className="text-[var(--color-gold)]">TAT</span>
      </p>
    </div>
  );
}

export default NotFound;
