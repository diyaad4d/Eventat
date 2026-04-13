// ─────────────────────────────────────────────────────────────
//  EmptyState
//  A reusable illustration + message block for empty lists.
//
//  variant : default | cart | bookings | services | notifications | search
//  props   : title, description, action (button label + onClick)
// ─────────────────────────────────────────────────────────────

import Button from './Button';

// SVG illustrations per variant (inline, no external deps)
const ILLUSTRATIONS = {
  default: (
    <svg viewBox="0 0 120 100" fill="none" className="w-full h-full">
      <rect x="20" y="30" width="80" height="55" rx="8" fill="#F3F4F6" />
      <rect x="35" y="45" width="50" height="6" rx="3" fill="#D1D5DB" />
      <rect x="40" y="57" width="40" height="5" rx="2.5" fill="#E5E7EB" />
      <rect x="45" y="68" width="30" height="5" rx="2.5" fill="#E5E7EB" />
      <circle cx="60" cy="22" r="10" fill="#E8C97A" opacity="0.6" />
      <path d="M56 22l3 3 5-5" stroke="#A07830" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  cart: (
    <svg viewBox="0 0 120 100" fill="none" className="w-full h-full">
      <circle cx="60" cy="48" r="30" fill="#F3F4F6" />
      <path d="M38 36h8l5 20h22l4-14H46" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="51" cy="59" r="3" fill="#D1D5DB" />
      <circle cx="67" cy="59" r="3" fill="#D1D5DB" />
      <path d="M60 28v8M56 32l4-4 4 4" stroke="#E8C97A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  bookings: (
    <svg viewBox="0 0 120 100" fill="none" className="w-full h-full">
      <rect x="25" y="28" width="70" height="55" rx="8" fill="#F3F4F6" />
      <rect x="25" y="28" width="70" height="18" rx="8" fill="#E8C97A" opacity="0.4" />
      <rect x="40" y="52" width="40" height="5" rx="2.5" fill="#D1D5DB" />
      <rect x="45" y="63" width="30" height="5" rx="2.5" fill="#E5E7EB" />
      <circle cx="44" cy="37" r="4" fill="white" opacity="0.8" />
      <circle cx="76" cy="37" r="4" fill="white" opacity="0.8" />
    </svg>
  ),
  services: (
    <svg viewBox="0 0 120 100" fill="none" className="w-full h-full">
      <circle cx="60" cy="50" r="28" fill="#F3F4F6" />
      <path d="M48 50a12 12 0 1024 0 12 12 0 00-24 0z" fill="#E5E7EB" />
      <path d="M60 38v4M60 58v4M48 50h4M68 50h4" stroke="#C9A24D" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="60" cy="50" r="3" fill="#C9A24D" />
    </svg>
  ),
  notifications: (
    <svg viewBox="0 0 120 100" fill="none" className="w-full h-full">
      <path d="M60 25c-11 0-20 9-20 20v12l-4 8h48l-4-8V45c0-11-9-20-20-20z" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="1.5" />
      <path d="M55 65a5 5 0 0010 0" fill="#D1D5DB" />
      <circle cx="76" cy="28" r="6" fill="#E8C97A" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 120 100" fill="none" className="w-full h-full">
      <circle cx="52" cy="46" r="22" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="2" />
      <path d="M68 62l16 16" stroke="#D1D5DB" strokeWidth="3" strokeLinecap="round" />
      <path d="M44 46h16M52 38v16" stroke="#C9A24D" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
    </svg>
  ),
};

const DEFAULTS = {
  default:       { title: 'Nothing here yet',            description: 'There is no content to display right now.' },
  cart:          { title: 'Your cart is empty',          description: 'Browse our services and add something you love.' },
  bookings:      { title: 'No bookings yet',             description: "You haven't made any bookings yet. Start planning your event!" },
  services:      { title: 'No services found',           description: 'Try adjusting your filters or search terms.' },
  notifications: { title: 'All caught up!',              description: "You don't have any notifications right now." },
  search:        { title: 'No results match',            description: 'Try changing your search terms or clearing your filters.' },
};

function EmptyState({
  variant = 'default',
  title,
  description,
  action,        // { label: string, onClick: () => void, variant?: ButtonVariant }
  className = '',
}) {
  const defaults = DEFAULTS[variant] ?? DEFAULTS.default;
  const illustration = ILLUSTRATIONS[variant] ?? ILLUSTRATIONS.default;

  return (
    <div
      className={[
        'flex flex-col items-center justify-center text-center py-16 px-6',
        className,
      ].join(' ')}
    >
      {/* Illustration */}
      <div className="w-36 h-28 mb-6 opacity-90">{illustration}</div>

      {/* Text */}
      <h3 className="text-lg font-semibold text-[var(--color-dark)] mb-2">
        {title ?? defaults.title}
      </h3>
      <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
        {description ?? defaults.description}
      </p>

      {/* CTA */}
      {action && (
        <div className="mt-6">
          <Button
            variant={action.variant ?? 'primary'}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}

export default EmptyState;
