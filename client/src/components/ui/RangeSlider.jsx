import { useState, useCallback, useRef, useEffect } from 'react';

// ─────────────────────────────────────────────────────────────
//  RangeSlider — dual-handle price range slider
//
//  props:
//    min       : number  — absolute minimum value (e.g. 0)
//    max       : number  — absolute maximum value (e.g. 5000)
//    value     : [number, number]  — [low, high] controlled value
//    onChange  : ([low, high]) => void
//    step      : number  — snap step (default 50)
//    prefix    : string  — currency prefix (default 'JOD')
//    formatLabel: (val: number) => string  — custom label formatter
// ─────────────────────────────────────────────────────────────

function clamp(val, lo, hi) {
  return Math.min(Math.max(val, lo), hi);
}

function RangeSlider({
  min = 0,
  max = 5000,
  value = [0, 5000],
  onChange,
  step = 50,
  prefix = 'JOD',
  formatLabel,
  className = '',
}) {
  const [low, high] = value;
  const trackRef = useRef(null);

  const fmt = formatLabel ?? ((v) => `${prefix} ${v.toLocaleString()}`);

  // Percentage positions for the filled track
  const lowPct  = ((low  - min) / (max - min)) * 100;
  const highPct = ((high - min) / (max - min)) * 100;

  // ── Drag logic via pointer events ────────────────────────────

  const getValueFromPointer = useCallback(
    (clientX) => {
      const rect = trackRef.current?.getBoundingClientRect();
      if (!rect) return min;
      const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
      const raw   = min + ratio * (max - min);
      return Math.round(raw / step) * step;
    },
    [min, max, step],
  );

  const makeHandleDrag = useCallback(
    (which) => (e) => {
      e.preventDefault();
      const move = (ev) => {
        const newVal = getValueFromPointer(ev.clientX);
        if (which === 'low') {
          const newLow = clamp(newVal, min, high - step);
          onChange([newLow, high]);
        } else {
          const newHigh = clamp(newVal, low + step, max);
          onChange([low, newHigh]);
        }
      };
      const up = () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
    },
    [getValueFromPointer, low, high, min, max, step, onChange],
  );

  // ── Keyboard support ─────────────────────────────────────────

  const handleKeyDown = (which) => (e) => {
    const dir = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    if (which === 'low') {
      onChange([clamp(low + dir * step, min, high - step), high]);
    } else {
      onChange([low, clamp(high + dir * step, low + step, max)]);
    }
  };

  return (
    <div className={['w-full select-none', className].join(' ')}>
      {/* Value labels */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-[var(--color-dark)] bg-[var(--color-gold)]/10 px-2.5 py-1 rounded-lg">
          {fmt(low)}
        </span>
        <span className="text-xs text-gray-400 font-medium">to</span>
        <span className="text-sm font-semibold text-[var(--color-dark)] bg-[var(--color-gold)]/10 px-2.5 py-1 rounded-lg">
          {fmt(high)}
        </span>
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        className="relative h-1.5 rounded-full bg-gray-200 mx-3"
      >
        {/* Filled range */}
        <div
          className="absolute h-full rounded-full"
          style={{
            left: `${lowPct}%`,
            width: `${highPct - lowPct}%`,
            background: 'linear-gradient(90deg, var(--color-gold-light), var(--color-gold))',
          }}
        />

        {/* Low handle */}
        <button
          type="button"
          role="slider"
          aria-valuemin={min}
          aria-valuemax={high - step}
          aria-valuenow={low}
          aria-label="Minimum price"
          onPointerDown={makeHandleDrag('low')}
          onKeyDown={handleKeyDown('low')}
          className={[
            'absolute top-1/2 -translate-y-1/2 -translate-x-1/2',
            'w-5 h-5 rounded-full bg-white border-2 border-[var(--color-gold)]',
            'shadow-md cursor-grab active:cursor-grabbing',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] focus-visible:ring-offset-1',
            'transition-transform hover:scale-110',
          ].join(' ')}
          style={{ left: `${lowPct}%`, zIndex: 10 }}
        />

        {/* High handle */}
        <button
          type="button"
          role="slider"
          aria-valuemin={low + step}
          aria-valuemax={max}
          aria-valuenow={high}
          aria-label="Maximum price"
          onPointerDown={makeHandleDrag('high')}
          onKeyDown={handleKeyDown('high')}
          className={[
            'absolute top-1/2 -translate-y-1/2 -translate-x-1/2',
            'w-5 h-5 rounded-full bg-white border-2 border-[var(--color-gold)]',
            'shadow-md cursor-grab active:cursor-grabbing',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] focus-visible:ring-offset-1',
            'transition-transform hover:scale-110',
          ].join(' ')}
          style={{ left: `${highPct}%`, zIndex: 10 }}
        />
      </div>

      {/* Min/Max labels */}
      <div className="flex items-center justify-between mt-2 px-1">
        <span className="text-xs text-gray-400">{fmt(min)}</span>
        <span className="text-xs text-gray-400">{fmt(max)}</span>
      </div>
    </div>
  );
}

export default RangeSlider;
