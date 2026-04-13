import { forwardRef } from 'react';
import Spinner from './Spinner';

// ─────────────────────────────────────────────────────────────
//  Button
//  variants : primary | secondary | outline | ghost | danger
//  sizes    : sm | md | lg
//  props    : loading, disabled, leftIcon, rightIcon, fullWidth
// ─────────────────────────────────────────────────────────────

const BASE =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-lg border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

const VARIANTS = {
  primary:
    'bg-[var(--color-gold)] text-white border-transparent hover:bg-[var(--color-gold-dark)] focus-visible:ring-[var(--color-gold)] shadow-sm hover:shadow-md hover:-translate-y-px active:translate-y-0',
  secondary:
    'bg-[var(--color-dark)] text-white border-transparent hover:bg-[var(--color-dark-soft)] focus-visible:ring-[var(--color-dark)] shadow-sm hover:shadow-md hover:-translate-y-px active:translate-y-0',
  outline:
    'bg-transparent text-[var(--color-gold)] border-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-white focus-visible:ring-[var(--color-gold)]',
  ghost:
    'bg-transparent text-[var(--color-dark)] border-transparent hover:bg-black/5 focus-visible:ring-[var(--color-dark)]',
  danger:
    'bg-red-500 text-white border-transparent hover:bg-red-600 focus-visible:ring-red-500 shadow-sm hover:shadow-md hover:-translate-y-px active:translate-y-0',
};

const SIZES = {
  sm: 'px-3.5 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-base',
};

const SPINNER_SIZES = { sm: 'sm', md: 'sm', lg: 'md' };

const Button = forwardRef(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      fullWidth = false,
      leftIcon = null,
      rightIcon = null,
      className = '',
      children,
      type = 'button',
      ...rest
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={[
          BASE,
          VARIANTS[variant] ?? VARIANTS.primary,
          SIZES[size] ?? SIZES.md,
          fullWidth ? 'w-full' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      >
        {loading ? (
          <>
            <Spinner
              size={SPINNER_SIZES[size]}
              color={variant === 'outline' || variant === 'ghost' ? 'gold' : 'white'}
            />
            <span>{children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
export default Button;
