// ─────────────────────────────────────────────────────────────
//  Card
//  variant : default | flat | bordered | elevated
//  props   : hover (enables lift effect), padding, className
// ─────────────────────────────────────────────────────────────

const VARIANTS = {
  default:  'bg-white shadow-[var(--shadow-card)] rounded-xl',
  flat:     'bg-[var(--color-surface)] rounded-xl',
  bordered: 'bg-white border border-gray-100 rounded-xl',
  elevated: 'bg-white shadow-[var(--shadow-modal)] rounded-2xl',
};

const PADDING = {
  none: '',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
};

function Card({
  variant = 'default',
  padding = 'none',
  hover = false,
  className = '',
  children,
  ...rest
}) {
  return (
    <div
      className={[
        VARIANTS[variant] ?? VARIANTS.default,
        PADDING[padding] ?? '',
        hover
          ? 'transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1 cursor-pointer'
          : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
}

// ── Sub-components for flexible composition ───────────────────

Card.Header = function CardHeader({ className = '', children, ...rest }) {
  return (
    <div
      className={['px-6 pt-6 pb-4 border-b border-gray-100', className].join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
};

Card.Body = function CardBody({ className = '', children, ...rest }) {
  return (
    <div className={['p-6', className].join(' ')} {...rest}>
      {children}
    </div>
  );
};

Card.Footer = function CardFooter({ className = '', children, ...rest }) {
  return (
    <div
      className={['px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl', className].join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Card;
