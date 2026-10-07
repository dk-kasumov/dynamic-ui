/**
 * localStorage access that never throws: a read returns the fallback when the stored
 * value is missing or fails validation, and a write is silently dropped. Storage can
 * be unavailable in private mode or when site data is blocked.
 */
export function readStored<T>(
  win: Window | null,
  key: string,
  isValid: (value: unknown) => value is T,
  fallback: T
): T {
  try {
    const stored = win?.localStorage.getItem(key)
    return isValid(stored) ? stored : fallback
  } catch {
    return fallback
  }
}

export function writeStored(win: Window | null, key: string, value: string): void {
  try {
    win?.localStorage.setItem(key, value)
  } catch {
    // Not persisted; the value still applies for this session.
  }
}
