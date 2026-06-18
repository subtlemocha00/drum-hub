/**
 * Lightweight, derived session stats for the Phase 1 dashboard. Intentionally
 * minimal — richer statistics (weekly totals, longest session, etc.) come
 * later. These run on whatever recent sessions are already loaded.
 */

function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Current practice streak: the number of consecutive calendar days (ending
 * today or yesterday) that contain at least one session.
 */
export function computeCurrentStreak(sessions) {
  const days = new Set(
    sessions
      .map((s) => s.startTime)
      .filter(Boolean)
      .map((d) => startOfDay(d))
  )
  if (days.size === 0) return 0

  const today = startOfDay(new Date())
  // Allow the streak to "count" from today or yesterday so it doesn't reset
  // before the user has practiced today.
  let cursor = days.has(today) ? today : today - DAY_MS
  if (!days.has(cursor)) return 0

  let streak = 0
  while (days.has(cursor)) {
    streak += 1
    cursor -= DAY_MS
  }
  return streak
}

/** Total practice seconds across the provided sessions. */
export function totalSeconds(sessions) {
  return sessions.reduce((sum, s) => sum + (s.durationSeconds || 0), 0)
}
