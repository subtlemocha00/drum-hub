/**
 * Tiny localStorage-backed "recently viewed" tracker, namespaced per entity
 * type (e.g. 'grooves', 'rudiments'). Stores an ordered list of ids, newest
 * first. Deliberately client-only — this is lightweight UX state, not analytics.
 */
const key = (namespace) => `drumhub.recent.${namespace}`
const MAX = 12

export function recordView(namespace, id) {
  if (!id) return
  try {
    const list = getRecentIds(namespace).filter((existing) => existing !== id)
    list.unshift(id)
    localStorage.setItem(key(namespace), JSON.stringify(list.slice(0, MAX)))
  } catch {
    // Ignore storage failures (private mode, quota, etc.)
  }
}

export function getRecentIds(namespace) {
  try {
    const raw = localStorage.getItem(key(namespace))
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
