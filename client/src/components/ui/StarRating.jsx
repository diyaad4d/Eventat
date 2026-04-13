import { useState, useCallback } from 'react';
import { Star } from 'lucide-react';

// ─────────────────────────────────────────────────────────────
//  StarRating
//  mode      : 'interactive' | 'readonly'
//  value     : current rating (1-5, or 0 for none)
//  onChange  : (rating: number) => void  — required in interactive mode
//  max       : max stars (default 5)
//  size      : sm | md | lg
// ─────────────────────────────────────────────────────────────

const SIZES = {
  sm: 14,
  md: 18,
  lg: 24,
};

function StarRating({
  value = 0,
  onChange,
  mode = 'interactive',
  max = 5,
  size = 'md',
  showLabel = false,
  className = '',
}) {
  const [hovered, setHovered] = useState(0);
  const isReadOnly = mode === 'readonly';
  const iconSize  = SIZES[size] ?? SIZES.md;

  const handleClick = useCallback(
    (rating) => {
      if (!isReadOnly && onChange) {
        // Clicking the current rating again deselects it
        onChange(rating === value ? 0 : rating);
      }
    },
    [isReadOnly, onChange, value],
  );

  const displayValue = isReadOnly ? value : hovered || value;

  return (
    <span
      className={['inline-flex items-center gap-0.5', className].join(' ')}
      aria-label={`Rating: ${value} out of ${max} stars`}
    >
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1;
        const filled    = starValue <= displayValue;

        return (
          <button
            key={starValue}
            type="button"
            disabled={isReadOnly}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => !isReadOnly && setHovered(starValue)}
            onMouseLeave={() => !isReadOnly && setHovered(0)}
            aria-label={`${starValue} star${starValue !== 1 ? 's' : ''}`}
            className={[
              'transition-transform duration-100',
              isReadOnly
                ? 'cursor-default'
                : 'cursor-pointer hover:scale-110 focus-visible:outline-none focus-visible:scale-110',
            ].join(' ')}
          >
            <Star
              size={iconSize}
              className="transition-colors duration-100"
              fill={filled ? 'var(--color-gold)' : 'none'}
              stroke={filled ? 'var(--color-gold)' : '#d1d5db'}
              strokeWidth={1.5}
            />
          </button>
        );
      })}

      {showLabel && (
        <span className="ml-1.5 text-sm font-medium text-[var(--color-dark)]">
          {value > 0 ? value.toFixed(1) : '—'}
        </span>
      )}
    </span>
  );
}

export default StarRating;
