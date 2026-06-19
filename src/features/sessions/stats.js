/**
 * Derived practice statistics over completed sessions. Pure functions, no I/O —
 * callers pass already-loaded sessions ({ startTime: Date, durationSeconds }).
 */

const DAY_MS = 24 * 60 * 60 * 1000

/** A calendar day counts toward a streak only with this much practice. */
export const PRACTICE_DAY_MIN_SECONDS = 10 * 60

function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function startOfWeek(date) {
  // Week starts Monday.
  const day = (new Date(date).getDay() + 6) % 7
  return startOfDay(date) - day * DAY_MS
}

function startOfMonth(date) {
  const d = new Date(date)
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime()
}

/** Sum of practice seconds per calendar day → Map<dayMs, seconds>. */
function secondsByDay(sessions) {
  const map = new Map()
  for (const s of sessions) {
    if (!s.startTime) continue
    const key = startOfDay(s.startTime)
    map.set(key, (map.get(key) ?? 0) + (s.durationSeconds || 0))
  }
  return map
}

/** Total practice seconds across the provided sessions. */
export function totalSeconds(sessions) {
  return sessions.reduce((sum, s) => sum + (s.durationSeconds || 0), 0)
}

/** Practice-time totals for today / this week / this month / lifetime. */
export function timeTotals(sessions) {
  const now = Date.now()
  const dayStart = startOfDay(now)
  const weekStart = startOfWeek(now)
  const monthStart = startOfMonth(now)

  const totals = { today: 0, week: 0, month: 0, lifetime: 0 }
  for (const s of sessions) {
    const secs = s.durationSeconds || 0
    totals.lifetime += secs
    if (!s.startTime) continue
    const t = s.startTime.getTime()
    if (t >= dayStart) totals.today += secs
    if (t >= weekStart) totals.week += secs
    if (t >= monthStart) totals.month += secs
  }
  return totals
}

/** Total / average / longest session length (seconds) and session count. */
export function sessionStats(sessions) {
  const count = sessions.length
  if (count === 0) return { count: 0, averageSeconds: 0, longestSeconds: 0 }
  let longest = 0
  let sum = 0
  for (const s of sessions) {
    const secs = s.durationSeconds || 0
    sum += secs
    if (secs > longest) longest = secs
  }
  return { count, averageSeconds: Math.round(sum / count), longestSeconds: longest }
}

/**
 * Current and longest streak in days. A day counts only if total practice that
 * day meets PRACTICE_DAY_MIN_SECONDS. The current streak may anchor on today or
 * yesterday so it doesn't reset before you've practiced today.
 */
export function computeStreaks(sessions) {
  const byDay = secondsByDay(sessions)
  const qualifying = [...byDay.entries()]
    .filter(([, secs]) => secs >= PRACTICE_DAY_MIN_SECONDS)
    .map(([day]) => day)
    .sort((a, b) => a - b)

  if (qualifying.length === 0) return { current: 0, longest: 0 }

  // Longest run of consecutive days.
  let longest = 1
  let run = 1
  for (let i = 1; i < qualifying.length; i++) {
    if (qualifying[i] - qualifying[i - 1] === DAY_MS) {
      run += 1
      longest = Math.max(longest, run)
    } else {
      run = 1
    }
  }

  // Current streak counting back from today or yesterday.
  const days = new Set(qualifying)
  const today = startOfDay(Date.now())
  let cursor = days.has(today) ? today : today - DAY_MS
  let current = 0
  while (days.has(cursor)) {
    current += 1
    cursor -= DAY_MS
  }

  return { current, longest }
}

/** Backwards-compatible helper: just the current streak. */
export function computeCurrentStreak(sessions) {
  return computeStreaks(sessions).current
}

/** Practice seconds bucketed by the last `weeks` ISO-ish weeks (oldest first). */
export function weeklyBuckets(sessions, weeks = 8) {
  const thisWeek = startOfWeek(Date.now())
  const buckets = []
  for (let i = weeks - 1; i >= 0; i--) {
    const start = thisWeek - i * 7 * DAY_MS
    const end = start + 7 * DAY_MS
    const label = new Date(start).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    })
    buckets.push({ label, start, end, seconds: 0 })
  }
  for (const s of sessions) {
    if (!s.startTime) continue
    const t = s.startTime.getTime()
    const bucket = buckets.find((b) => t >= b.start && t < b.end)
    if (bucket) bucket.seconds += s.durationSeconds || 0
  }
  return buckets
}

/** Practice seconds bucketed by the last `months` calendar months (oldest first). */
export function monthlyBuckets(sessions, months = 6) {
  const now = new Date()
  const buckets = []
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const start = d.getTime()
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime()
    const label = d.toLocaleDateString(undefined, { month: 'short' })
    buckets.push({ label, start, end, seconds: 0 })
  }
  for (const s of sessions) {
    if (!s.startTime) continue
    const t = s.startTime.getTime()
    const bucket = buckets.find((b) => t >= b.start && t < b.end)
    if (bucket) bucket.seconds += s.durationSeconds || 0
  }
  return buckets
}
