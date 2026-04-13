// ─────────────────────────────────────────────────────────────
//  Badge
//  variant : gold | dark | success | error | warning | info |
//            blue | gray | outline-gold
//  size    : sm | md
// ─────────────────────────────────────────────────────────────

const VARIANTS = {
  gold:         'bg-[var(--color-gold)]/15 text-[var(--color-gold-dark)] border border-[var(--color-gold)]/30',
  dark:         'bg-[var(--color-dark)]/10 text-[var(--color-dark)] border border-[var(--color-dark)]/20',
  success:      'bg-green-50 text-green-700 border border-green-200',
  error:        'bg-red-50 text-red-700 border border-red-200',
  warning:      'bg-amber-50 text-amber-700 border border-amber-200',
  info:         'bg-blue-50 text-blue-700 border border-blue-200',
  blue:         'bg-[var(--color-hero-blue)]/40 text-[var(--color-dark)] border border-[var(--color-hero-blue)]',
  gray:         'bg-gray-100 text-gray-600 border border-gray-200',
  'outline-gold':'bg-transparent text-[var(--color-gold)] border border-[var(--color-gold)]',
};

const SIZES = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-1 text-xs',
};

function Badge({
  variant = 'gold',
  size = 'md',
  children,
  className = '',
  dot = false,
}) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full font-medium leading-none',
        VARIANTS[variant] ?? VARIANTS.gray,
        SIZES[size] ?? SIZES.md,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {dot && (
        <span
          className={[
            'w-1.5 h-1.5 rounded-full shrink-0',
            variant === 'success' ? 'bg-green-500' :
            variant === 'error'   ? 'bg-red-500'   :
            variant === 'warning' ? 'bg-amber-500' :
            variant === 'gold'    ? 'bg-[var(--color-gold)]' :
            'bg-current',
          ].join(' ')}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

export default Badge;
