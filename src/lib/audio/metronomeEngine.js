/**
 * MetronomeEngine — sample-accurate metronome built on the Web Audio API.
 *
 * Timing follows the well-known "A Tale of Two Clocks" pattern: a coarse
 * lookahead loop (setTimeout) wakes up periodically and schedules any events due
 * within the next lookahead window using `AudioContext.currentTime`. The audio
 * clock — not setTimeout/setInterval — determines exactly when each click
 * fires, which keeps timing rock-solid even when the main thread is busy.
 *
 * Click sounds are short buffers rendered once up front ("preloaded") and then
 * played via lightweight BufferSource nodes, so no per-beat synthesis cost and
 * no external audio files are required.
 *
 * Phase 5A extends the engine to schedule per *subdivision step* rather than per
 * *beat*, and adds swing, configurable accents, gap training, random measure
 * muting (seeded/deterministic), and a tempo ramp. All of these default to
 * values that reproduce the original quarter-note behavior exactly, so existing
 * callers are unaffected.
 */
const LOOKAHEAD_MS = 25 // how often the scheduler loop runs
const SCHEDULE_AHEAD_S = 0.1 // how far ahead (seconds) to schedule audio

// Steps-per-beat for each subdivision (used as the scheduling resolution).
export const SUBDIVISION_STEPS = {
  quarter: 1,
  eighth: 2,
  triplet: 3,
  sixteenth: 4
}

// How far the off-beats are pushed for each swing feel, as a fraction of a beat
// added to the first eighth and removed from the second. Heavy ≈ triplet feel
// (2/3, 1/3). Swing only applies to straight eighth notes.
export const SWING_OFFSETS = {
  straight: 0,
  light: 0.05,
  medium: 0.1,
  heavy: 1 / 6
}

// Probability that any given measure is muted, per difficulty level.
export const RANDOM_MUTE_PROBABILITY = {
  off: 0,
  low: 0.1,
  medium: 0.25,
  high: 0.4
}

/**
 * Deterministic [0,1) value for a given (seed, bar) pair. Lets random muting be
 * stable across a session (and reproducible) without storing per-bar state: the
 * same bar index always yields the same result. Based on a simple integer hash.
 */
function hashedRandom(seed, bar) {
  let h = (seed ^ (bar * 0x9e3779b1)) >>> 0
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b)
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b)
  h = (h ^ (h >>> 16)) >>> 0
  return h / 4294967296
}

export class MetronomeEngine {
  constructor() {
    this.audioContext = null
    this.accentBuffer = null
    this.normalBuffer = null
    this.subdivisionBuffer = null

    this.bpm = 120
    this.beatsPerMeasure = 4

    // Phase 5A config (defaults reproduce the original behavior).
    this.subdivision = 1 // steps per beat
    this.swing = 0 // swing offset fraction (eighths only)
    this.accentPattern = null // boolean[] per beat; null => accent beat 0 only
    this.gapTraining = null // { audibleBars, silentBars } or null
    this.randomMuteProbability = 0 // 0..1 chance a measure is muted
    this.tempoRamp = null // { startBpm, endBpm, durationSec } or null
    this.seed = 1 // seed for deterministic random muting

    this.isRunning = false
    this.currentBeat = 0 // beat index within the current measure
    this.currentStep = 0 // subdivision step within the current beat
    this.currentBar = 0 // measure counter since start
    this.barMuted = false // is the current measure silenced?
    this.startTime = 0 // audio-clock time the run started (for tempo ramp)
    this.nextNoteTime = 0 // audio-clock time of the next step
    this.timerId = null
    this.onBeat = null // visual callback: (info) => void
  }

  /** Lazily create the AudioContext and render click buffers. */
  async init() {
    if (this.audioContext) return
    const Ctx = window.AudioContext || window.webkitAudioContext
    this.audioContext = new Ctx()
    this.accentBuffer = this.renderClick(1500, 0.6)
    this.normalBuffer = this.renderClick(1000, 0.35)
    // Subdivision ticks sit between beats: higher and quieter so the pulse still
    // reads as the dominant accent.
    this.subdivisionBuffer = this.renderClick(2000, 0.18)
  }

  /**
   * Render a short percussive click into an AudioBuffer.
   * A sine tone with a fast exponential decay reads as a clean "tick".
   */
  renderClick(frequency, gain) {
    const ctx = this.audioContext
    const duration = 0.05
    const sampleRate = ctx.sampleRate
    const length = Math.floor(duration * sampleRate)
    const buffer = ctx.createBuffer(1, length, sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate
      const envelope = Math.exp(-t * 60) // fast decay
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * gain
    }
    return buffer
  }

  setBpm(bpm) {
    this.bpm = Math.min(300, Math.max(20, Math.round(bpm)))
  }

  setBeatsPerMeasure(beats) {
    this.beatsPerMeasure = Math.max(1, Math.round(beats))
  }

  setSubdivision(steps) {
    this.subdivision = Math.max(1, Math.round(steps))
  }

  setSwing(offset) {
    this.swing = Math.max(0, Math.min(0.25, offset || 0))
  }

  setAccentPattern(pattern) {
    this.accentPattern = Array.isArray(pattern) ? pattern : null
  }

  setGapTraining(config) {
    if (config && config.audibleBars > 0 && config.silentBars > 0) {
      this.gapTraining = {
        audibleBars: Math.round(config.audibleBars),
        silentBars: Math.round(config.silentBars)
      }
    } else {
      this.gapTraining = null
    }
  }

  setRandomMuteProbability(probability) {
    this.randomMuteProbability = Math.max(0, Math.min(1, probability || 0))
  }

  /** Configure (or clear) the tempo ramp. Duration is in minutes. */
  setTempoRamp(config) {
    if (config && config.durationMin > 0 && config.startBpm && config.endBpm) {
      this.tempoRamp = {
        startBpm: config.startBpm,
        endBpm: config.endBpm,
        durationSec: config.durationMin * 60
      }
    } else {
      this.tempoRamp = null
    }
  }

  /** Effective BPM at a given audio-clock time, accounting for any tempo ramp. */
  bpmAt(time) {
    if (!this.tempoRamp) return this.bpm
    const { startBpm, endBpm, durationSec } = this.tempoRamp
    const t = Math.min(1, Math.max(0, (time - this.startTime) / durationSec))
    return startBpm + (endBpm - startBpm) * t
  }

  /** True if the beat at the given index should be accented. */
  isAccented(beatIndex) {
    if (this.accentPattern && this.accentPattern.length > 0) {
      return !!this.accentPattern[beatIndex % this.accentPattern.length]
    }
    return beatIndex === 0
  }

  /** Decide whether a whole measure is silent (gap training or random mute). */
  computeBarMuted(bar) {
    if (this.gapTraining) {
      const { audibleBars, silentBars } = this.gapTraining
      const cycle = audibleBars + silentBars
      if (cycle > 0 && bar % cycle >= audibleBars) return true
    }
    if (this.randomMuteProbability > 0) {
      // Never mute the very first measure so the user always hears the tempo.
      if (bar > 0 && hashedRandom(this.seed, bar) < this.randomMuteProbability) {
        return true
      }
    }
    return false
  }

  /** Play one click at the given audio-clock time. */
  scheduleClick(buffer, time) {
    const ctx = this.audioContext
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.connect(ctx.destination)
    source.start(time)
  }

  /**
   * Advance bookkeeping by one subdivision step, rolling over beats and bars.
   * The duration added to `nextNoteTime` is computed from the *current* BPM
   * (so a tempo ramp stays drift-free) and the swing offset for the step we are
   * leaving behind.
   */
  advanceStep(time) {
    const secondsPerBeat = 60.0 / this.bpmAt(time)
    let stepDuration = secondsPerBeat / this.subdivision

    // Swing only applies to straight eighth notes (two steps per beat): the
    // first step is lengthened and the off-beat shortened by the same amount.
    if (this.subdivision === 2 && this.swing > 0) {
      stepDuration =
        this.currentStep === 0
          ? secondsPerBeat * (0.5 + this.swing)
          : secondsPerBeat * (0.5 - this.swing)
    }

    this.nextNoteTime += stepDuration

    this.currentStep += 1
    if (this.currentStep >= this.subdivision) {
      this.currentStep = 0
      this.currentBeat += 1
      if (this.currentBeat >= this.beatsPerMeasure) {
        this.currentBeat = 0
        this.currentBar += 1
        this.barMuted = this.computeBarMuted(this.currentBar)
      }
    }
  }

  /** Scheduler loop: schedule everything due within the lookahead window. */
  scheduler = () => {
    while (this.nextNoteTime < this.audioContext.currentTime + SCHEDULE_AHEAD_S) {
      const time = this.nextNoteTime
      const beat = this.currentBeat
      const step = this.currentStep
      const isDownbeat = step === 0
      const accented = isDownbeat && this.isAccented(beat)

      if (!this.barMuted) {
        let buffer
        if (!isDownbeat) buffer = this.subdivisionBuffer
        else if (accented) buffer = this.accentBuffer
        else buffer = this.normalBuffer
        this.scheduleClick(buffer, time)
      }

      if (this.onBeat) {
        const info = {
          bar: this.currentBar,
          beat,
          step,
          subdivision: this.subdivision,
          accented,
          muted: this.barMuted,
          bpm: Math.round(this.bpmAt(time))
        }
        // Fire the visual callback close to when the click is audible.
        const delayMs = Math.max(0, (time - this.audioContext.currentTime) * 1000)
        window.setTimeout(() => this.onBeat?.(info), delayMs)
      }

      this.advanceStep(time)
    }
    this.timerId = window.setTimeout(this.scheduler, LOOKAHEAD_MS)
  }

  async start(onBeat) {
    if (this.isRunning) return
    await this.init()
    // Browsers start AudioContexts suspended until a user gesture resumes them.
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume()
    }
    this.onBeat = onBeat
    this.isRunning = true
    this.currentBeat = 0
    this.currentStep = 0
    this.currentBar = 0
    this.barMuted = this.computeBarMuted(0)
    this.startTime = this.audioContext.currentTime + 0.05
    this.nextNoteTime = this.startTime
    this.scheduler()
  }

  stop() {
    this.isRunning = false
    if (this.timerId) {
      window.clearTimeout(this.timerId)
      this.timerId = null
    }
  }

  /** Release audio resources. Call on unmount. */
  dispose() {
    this.stop()
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
  }
}
