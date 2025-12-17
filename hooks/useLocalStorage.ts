import { useState, useEffect } from 'react';

function safeParse<T>(value: string | null, fallback: T): T {
  if (value === null) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch (e) {
    return fallback;
  }
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return safeParse<T>(raw, initialValue);
    } catch (err) {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (err) {
      // ignore quota/localStorage errors
    }
  }, [key, state]);

  return [state, setState] as const;
}

export default useLocalStorage;
