import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * State that mirrors itself into localStorage.
 *
 * Reads once on mount (lazily, so the initial render never blocks), then writes
 * on every change. Corrupt or missing values fall back to `initial`.
 */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => readInitial(key, initial));
  const keyRef = useRef(key);

  useEffect(() => {
    keyRef.current = key;
  }, [key]);

  useEffect(() => {
    try {
      window.localStorage.setItem(keyRef.current, JSON.stringify(value));
    } catch {
      // Storage can be full or blocked (private mode); the app still works in memory.
    }
  }, [value]);

  const reset = useCallback(() => setValue(initial), [initial]);

  return [value, setValue, reset] as const;
}

function readInitial<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw) as T;
    if (parsed === null || parsed === undefined) return fallback;
    // Guard against a stored value of the wrong shape (e.g. an object where an array is expected).
    if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback;
    return parsed;
  } catch {
    return fallback;
  }
}
