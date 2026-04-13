// ─────────────────────────────────────────────────────────────
//  Spinner
//  sizes  : sm | md | lg
//  colors : gold | white | dark
// ─────────────────────────────────────────────────────────────

const SIZES = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-10 h-10 border-[3px]',
};

const COLORS = {
  gold:  'border-[var(--color-gold-light)] border-t-[var(--color-gold)]',
  white: 'border-white/30 border-t-white',
  dark:  'border-[var(--color-dark-soft)] border-t-[var(--color-dark)]',
};

function Spinner({ size = 'md', color = 'gold', className = '' }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={[
        'inline-block rounded-full animate-spin',
        SIZES[size] ?? SIZES.md,
        COLORS[color] ?? COLORS.gold,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    />
  );
}

export default Spinner;
