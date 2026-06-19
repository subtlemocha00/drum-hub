/**
 * Simple, rules-based recommendations from the onboarding profile. No AI — just
 * maps experience level + primary goal to difficulty and content categories.
 */
import { RUDIMENTS } from './rudiments/index.js'
import { GROOVES } from './grooves/index.js'
import { WARMUPS } from './warmups/index.js'
import { PLANS } from './practicePlans/index.js'

export const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
]

export const PRIMARY_GOALS = [
  { value: 'learn-basics', label: 'Learn Basics' },
  { value: 'improve-timing', label: 'Improve Timing' },
  { value: 'build-speed', label: 'Build Speed' },
  { value: 'learn-grooves', label: 'Learn Grooves' },
  { value: 'improve-coordination', label: 'Improve Coordination' }
]

export const PRACTICE_FREQUENCIES = [
  { value: '1-2', label: '1–2 days / week' },
  { value: '3-4', label: '3–4 days / week' },
  { value: '5+', label: '5+ days / week' }
]

const LEVEL_DIFFICULTY = {
  beginner: ['beginner'],
  intermediate: ['beginner', 'intermediate'],
  advanced: ['intermediate', 'advanced']
}

const GOAL_MAP = {
  'learn-basics': { rudimentCats: ['rolls', 'paradiddles'], grooveStyles: ['rock'], warmupCats: ['practice-pad', 'timing'], planTags: ['basics'] },
  'improve-timing': { rudimentCats: ['rolls'], grooveStyles: ['rock', 'funk'], warmupCats: ['timing'], planTags: ['timing'] },
  'build-speed': { rudimentCats: ['rolls', 'paradiddles'], grooveStyles: ['metal', 'punk'], warmupCats: ['speed', 'endurance'], planTags: ['speed'] },
  'learn-grooves': { rudimentCats: ['paradiddles'], grooveStyles: ['rock', 'funk', 'blues'], warmupCats: ['full-kit'], planTags: ['grooves'] },
  'improve-coordination': { rudimentCats: ['paradiddles', 'flams'], grooveStyles: ['funk', 'shuffle'], warmupCats: ['coordination'], planTags: ['coordination'] }
}

function pick(items, allowedDiff, preferredValues, key, progressById) {
  const byDiff = items.filter((i) => allowedDiff.includes(i.difficulty))
  const pool = byDiff.length ? byDiff : items
  let preferred =
    preferredValues && preferredValues.length
      ? pool.filter((i) => preferredValues.includes(i[key]))
      : pool
  if (!preferred.length) preferred = pool
  if (progressById) {
    const fresh = preferred.filter((i) => !progressById[i.id])
    if (fresh.length) preferred = fresh
  }
  return preferred[0] || null
}

/** Recommend a starting plan for the profile. */
export function recommendStartingPlan(profile) {
  const level = profile?.experienceLevel || 'beginner'
  const goalTags = GOAL_MAP[profile?.primaryGoal]?.planTags || []
  const ofLevel = PLANS.filter((p) => p.level === level)
  const match = ofLevel.find((p) => p.tags.some((t) => goalTags.includes(t)))
  return match || ofLevel[0] || PLANS[0]
}

/** Recommend one rudiment, groove, and warmup for the dashboard. */
export function recommendContent(profile, progressById = {}) {
  const level = profile?.experienceLevel || 'beginner'
  const allowed = LEVEL_DIFFICULTY[level] || ['beginner']
  const goal = GOAL_MAP[profile?.primaryGoal] || {}

  return {
    rudiment: pick(RUDIMENTS, allowed, goal.rudimentCats, 'category', progressById),
    groove: pick(GROOVES, allowed, goal.grooveStyles, 'style'),
    warmup: pick(WARMUPS, allowed, goal.warmupCats, 'category')
  }
}
