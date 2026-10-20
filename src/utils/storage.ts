// Storage can be unavailable (blocked site data, some private modes) or hold a corrupted value:
// preferences are not worth crashing the game

export const load = <T>(key: string, fallback: T): T => {
  try {
    const value = localStorage.getItem(key)
    return value === null ? fallback : JSON.parse(value)
  } catch {
    return fallback
  }
}

export const save = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // not persisted, still applied for this session
  }
}
