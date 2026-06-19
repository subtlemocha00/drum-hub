/**
 * Light, derived dashboard intelligence for rudiments. Pure functions over the
 * already-loaded catalog + progress map — no automation or analytics system.
 */

/**
 * Rudiments practiced most recently, newest first.
 * @param {Array} rudiments catalog
 * @param {Object} progressById  { [id]: { lastPracticedAt: Date|null, ... } }
 */
export function recentlyPracticed(rudiments, progressById, count = 5) {
  return rudiments
    .map((r) => ({ rudiment: r, progress: progressById[r.id] }))
    .filter((x) => x.progress?.lastPracticedAt)
    .sort((a, b) => b.progress.lastPracticedAt - a.progress.lastPracticedAt)
    .slice(0, count)
}

/**
 * "Suggested next" = least recently practiced. Never-practiced rudiments come
 * first (in catalog order), then the one with the oldest lastPracticedAt.
 */
export function suggestNextRudiment(rudiments, progressById) {
  if (!rudiments.length) return null

  const neverPracticed = rudiments.find((r) => !progressById[r.id]?.lastPracticedAt)
  if (neverPracticed) return neverPracticed

  return rudiments.reduce((oldest, r) => {
    const t = progressById[r.id].lastPracticedAt
    const oldestT = progressById[oldest.id].lastPracticedAt
    return t < oldestT ? r : oldest
  }, rudiments[0])
}
