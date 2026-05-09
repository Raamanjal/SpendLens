
// Persists form state to localStorage so page reloads
'use client';

import { useState, useEffect } from 'react';

export function useFormPersist<T>(key: string, initialValue: T) {
  const [value,    setValue]    = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  // Read from localStorage after first mount
  // Must be after mount to avoid SSR mismatch
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) setValue(JSON.parse(stored) as T);
    } catch {
      // Corrupted storage — fall back to initial value
    }
    setHydrated(true);
  }, [key]);

  // Write to localStorage on every state change
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full or blocked — continue silently
    }
  }, [key, value, hydrated]);

  return [value, setValue, hydrated] as const;
}