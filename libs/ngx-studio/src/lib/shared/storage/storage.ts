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
    return
  }
}
