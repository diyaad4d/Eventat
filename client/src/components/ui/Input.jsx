import { forwardRef } from 'react';

// ─────────────────────────────────────────────────────────────
//  Input
//  props: label, error, hint, leftIcon, rightIcon, required
//  Forwards ref to the underlying <input> element.
// ─────────────────────────────────────────────────────────────

const Input = forwardRef(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      required = false,
      id,
      className = '',
      disabled = false,
      type = 'text',
      ...rest
    },
    ref,
  ) => {
    const inputId = id ?? `input-${Math.random().toString(36).slice(2, 7)}`;
    const hasError = Boolean(error);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[var(--color-dark)]"
          >
            {label}
            {required && (
              <span className="ml-0.5 text-red-500" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative flex items-center">
          {/* Left icon */}
          {leftIcon && (
            <span className="absolute left-3 flex items-center text-gray-400 pointer-events-none">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={
              hasError
                ? `${inputId}-error`
                : hint
                ? `${inputId}-hint`
                : undefined
            }
            className={[
              'w-full rounded-lg border bg-white text-sm text-[var(--color-dark)]',
              'placeholder:text-gray-400 transition-all duration-150 outline-none',
              'py-2.5',
              leftIcon ? 'pl-10' : 'pl-4',
              rightIcon ? 'pr-10' : 'pr-4',
              hasError
                ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-200'
                : 'border-gray-200 focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/20',
              disabled ? 'bg-gray-50 cursor-not-allowed opacity-60' : '',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            {...rest}
          />

          {/* Right icon */}
          {rightIcon && (
            <span className="absolute right-3 flex items-center text-gray-400">
              {rightIcon}
            </span>
          )}
        </div>

        {/* Error message */}
        {hasError && (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="text-xs text-red-500 flex items-center gap-1"
          >
            <svg
              className="w-3.5 h-3.5 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}

        {/* Hint text (only when no error) */}
        {hint && !hasError && (
          <p id={`${inputId}-hint`} className="text-xs text-gray-400">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
export default Input;
