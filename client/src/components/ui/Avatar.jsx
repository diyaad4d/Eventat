// ─────────────────────────────────────────────────────────────
//  Avatar
//  Shows a profile image or falls back to the user's initials.
//
//  size   : xs | sm | md | lg | xl
//  shape  : circle | square
// ─────────────────────────────────────────────────────────────

const SIZES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
};

/** Deterministic background color from the user's name */
function colorFromName(name = '') {
  const PALETTE = [
    'bg-rose-400',
    'bg-orange-400',
    'bg-amber-400',
    'bg-teal-400',
    'bg-cyan-500',
    'bg-blue-400',
    'bg-violet-400',
    'bg-pink-400',
  ];
  const index = [...(name ?? '')].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return PALETTE[index % PALETTE.length];
}

/** Extract initials — up to 2 chars */
function getInitials(name = '') {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '?';
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function Avatar({
  src,
  name = '',
  size = 'md',
  shape = 'circle',
  className = '',
  onClick,
}) {
  const sizeClass  = SIZES[size] ?? SIZES.md;
  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-xl';
  const initials   = getInitials(name);
  const bgColor    = colorFromName(name);

  return (
    <div
      className={[
        'relative inline-flex items-center justify-center shrink-0 font-semibold text-white overflow-hidden select-none',
        sizeClass,
        shapeClass,
        !src ? bgColor : 'bg-gray-100',
        onClick ? 'cursor-pointer ring-2 ring-offset-1 ring-transparent hover:ring-[var(--color-gold)] transition-all' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={name ? `Avatar for ${name}` : 'Avatar'}
    >
      {src ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          className="w-full h-full object-cover"
          onError={(e) => {
            // On broken image, hide the img to reveal initials underneath
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </div>
  );
}

export default Avatar;
