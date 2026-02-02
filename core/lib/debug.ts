// Lightweight development-only logger
export function devLog(...args: unknown[]) {
  try {
    // Prefer bundler replacement for NODE_ENV; fallback to window check
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') return
    if (typeof window === 'undefined' && typeof process === 'undefined') return
    // In browser or dev node env — print
    // eslint-disable-next-line no-console
    console.log(...args)
  } catch {
    // ignore logging errors
  }
}
