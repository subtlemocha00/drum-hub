/**
 * Shared, framework-agnostic configuration for the advanced metronome.
 *
 * Everything here is pure data + pure helpers: the option lists the UI renders,
 * the canonical default config, accent-pattern helpers, and the example presets.
 * Both the Metronome page and the Subdivision Trainer build on these so the two
 * tools stay in sync and there is a single source of truth for valid values.
 */
import { SUBDIVISION_STEPS, SWING_OFFSETS, RANDOM_MUTE_PROBABILITY } from '../../lib/audio/metronomeEngine.js'

export { SUBDIVISION_STEPS, SWING_OFFSETS, RANDOM_MUTE_PROBABILITY }

// Subdivisions, in display order. `steps` is steps-per-beat for the engine and
// `counts` drives the trainer's large read-aloud display (one entry per beat).
export const SUBDIVISIONS = [
  { value: 'quarter', label: 'Quarter', steps: 1, counts: ['']  },
  { value: 'eighth', label: 'Eighth', steps: 2, counts: ['', '&'] },
  { value: 'triplet', label: 'Triplet', steps: 3, counts: ['', 'trip', 'let'] },
  { value: 'sixteenth', label: 'Sixteenth', steps: 4, counts: ['', 'e', '&', 'a'] }
]

export const SWING_LEVELS = [
  { value: 'straight', label: 'Straight' },
  { value: 'light', label: 'Light' },
  { value: 'medium', label: 'Medium' },
  { value: 'heavy', label: 'Heavy' }
]

export const RANDOM_MUTE_LEVELS = [
  { value: 'off', label: 'Off' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
]

export const TIME_SIGNATURES = [
  { label: '4/4', beats: 4 },
  { label: '3/4', beats: 3 },
  { label: '5/4', beats: 5 },
  { label: '6/8', beats: 6 },
  { label: '7/8', beats: 7 }
]

// Accent modes produce a boolean[] (one entry per beat). 'custom' is edited by
// hand in the AccentEditor and stored verbatim.
export const ACCENT_MODES = [
  { value: 'all', label: 'All beats' },
  { value: 'first', label: 'Beat 1' },
  { value: '1-3', label: '1 + 3' },
  { value: '2-4', label: '2 + 4' },
  { value: 'custom', label: 'Custom' }
]

/** Build the boolean accent array for a named mode at the given meter. */
export function accentPatternForMode(mode, beats) {
  const arr = Array.from({ length: beats }, () => false)
  switch (mode) {
    case 'all':
      return arr.map(() => true)
    case 'first':
      arr[0] = true
      return arr
    case '1-3':
      if (beats > 0) arr[0] = true
      if (beats > 2) arr[2] = true
      return arr
    case '2-4':
      if (beats > 1) arr[1] = true
      if (beats > 3) arr[3] = true
      return arr
    default:
      // 'custom' with no explicit pattern falls back to accenting beat 1.
      arr[0] = true
      return arr
  }
}

export const BPM_MIN = 40
export const BPM_MAX = 240

export const SUBDIVISION_BY_VALUE = Object.fromEntries(
  SUBDIVISIONS.map((s) => [s.value, s])
)

export function subdivisionSteps(value) {
  return SUBDIVISION_BY_VALUE[value]?.steps ?? 1
}

export function swingOffset(value) {
  return SWING_OFFSETS[value] ?? 0
}

export function randomMuteProbability(value) {
  return RANDOM_MUTE_PROBABILITY[value] ?? 0
}

/** The canonical default configuration (matches the original metronome feel). */
export function defaultConfig() {
  return {
    bpm: 120,
    beatsPerMeasure: 4,
    subdivision: 'quarter',
    swing: 'straight',
    accentMode: 'first',
    accentPattern: accentPatternForMode('first', 4),
    gapTraining: { enabled: false, audibleBars: 3, silentBars: 1 },
    randomMute: 'off',
    tempoRamp: { enabled: false, startBpm: 80, endBpm: 140, durationMin: 5 }
  }
}

/**
 * Merge a stored/partial config (e.g. a Firestore preset) over the defaults so
 * older or incomplete records always yield a fully-formed config.
 */
export function normalizeConfig(partial = {}) {
  const base = defaultConfig()
  const beats = partial.beatsPerMeasure ?? base.beatsPerMeasure
  const accentMode = partial.accentMode ?? base.accentMode
  const accentPattern =
    accentMode === 'custom' && Array.isArray(partial.accentPattern)
      ? partial.accentPattern
      : accentPatternForMode(accentMode, beats)
  return {
    bpm: partial.bpm ?? base.bpm,
    beatsPerMeasure: beats,
    subdivision: partial.subdivision ?? base.subdivision,
    swing: partial.swing ?? base.swing,
    accentMode,
    accentPattern,
    gapTraining: { ...base.gapTraining, ...(partial.gapTraining || {}) },
    randomMute: partial.randomMute ?? base.randomMute,
    tempoRamp: { ...base.tempoRamp, ...(partial.tempoRamp || {}) }
  }
}

// Four ready-made presets surfaced as "starters" in the preset bar.
export const EXAMPLE_PRESETS = [
  {
    name: 'Practice Pad',
    config: normalizeConfig({
      bpm: 100,
      beatsPerMeasure: 4,
      subdivision: 'sixteenth',
      accentMode: 'first'
    })
  },
  {
    name: 'Jazz Swing Time',
    config: normalizeConfig({
      bpm: 140,
      beatsPerMeasure: 4,
      subdivision: 'eighth',
      swing: 'heavy',
      accentMode: '2-4'
    })
  },
  {
    name: 'Speed Builder',
    config: normalizeConfig({
      bpm: 90,
      beatsPerMeasure: 4,
      subdivision: 'eighth',
      accentMode: 'first',
      tempoRamp: { enabled: true, startBpm: 90, endBpm: 160, durationMin: 5 }
    })
  },
  {
    name: 'Odd Meter Drill (7/8)',
    config: normalizeConfig({
      bpm: 120,
      beatsPerMeasure: 7,
      subdivision: 'eighth',
      accentMode: 'custom',
      accentPattern: [true, false, true, false, true, false, false]
    })
  }
]
