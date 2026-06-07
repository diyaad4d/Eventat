import { useState, useEffect } from 'react';

/**
 * Delays propagating `value` until it hasn't changed for `delay` ms.
 * @param {*}      value  The value to debounce.
 * @param {number} delay  Milliseconds to wait (default 400).
 * @returns {*} The debounced value.
 */
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(value);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
