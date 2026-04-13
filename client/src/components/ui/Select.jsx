import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

// ─────────────────────────────────────────────────────────────
//  Select
//  props: label, error, hint, placeholder, options, required
//  Forwards ref to the underlying <select> element.
//  options: [{ value, label, disabled? }]
// ─────────────────────────────────────────────────────────────

const Select = forwardRef(
  (
    {
      label,
      error,
      hint,
      placeholder = 'Select an option',
      options = [],
      required = false,
      id,
      disabled = false,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const selectId = id ?? `select-${Math.random().toString(36).slice(2, 7)}`;
    const hasError = Boolean(error);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={selectId}
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

        {/* Select wrapper */}
        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined
            }
            className={[
              'w-full appearance-none rounded-lg border bg-white text-sm transition-all duration-150 outline-none',
              'px-4 py-2.5 pr-10',
              hasError
                ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-200 text-[var(--color-dark)]'
                : 'border-gray-200 focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/20 text-[var(--color-dark)]',
              disabled ? 'bg-gray-50 cursor-not-allowed opacity-60' : 'cursor-pointer',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            {...rest}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
              >
                {opt.label}
              </option>
            ))}
          </select>

          {/* Chevron icon */}
          <span className="pointer-events-none absolute right-3 text-gray-400">
            <ChevronDown size={16} />
          </span>
        </div>

        {/* Error */}
        {hasError && (
          <p
            id={`${selectId}-error`}
            role="alert"
            className="text-xs text-red-500 flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}

        {/* Hint */}
        {hint && !hasError && (
          <p id={`${selectId}-hint`} className="text-xs text-gray-400">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';
export default Select;
