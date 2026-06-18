/**
 * MetronomeEngine — sample-accurate metronome built on the Web Audio API.
 *
 * Timing follows the well-known "A Tale of Two Clocks" pattern: a coarse
 * lookahead loop (setTimeout) wakes up periodically and schedules any beats due
 * within the next lookahead window using `AudioContext.currentTime`. The audio
 * clock — not setTimeout/setInterval — determines exactly when each click
 * fires, which keeps timing rock-solid even when the main thread is busy.
 *
 * Click sounds are short buffers rendered once up front ("preloaded") and then
 * played via lightweight BufferSource nodes, so no per-beat synthesis cost and
 * no external audio files are required. The structure makes it easy to swap in
 * recorded percussion samples later (replace `renderClick` with a decode).
 */
const LOOKAHEAD_MS = 25 // how often the scheduler loop runs
const SCHEDULE_AHEAD_S = 0.1 // how far ahead (seconds) to schedule audio

export class MetronomeEngine {
  constructor() {
    this.audioContext = null
    this.accentBuffer = null
    this.normalBuffer = null

    this.bpm = 120
    this.beatsPerMeasure = 4

    this.isRunning = false
    this.currentBeat = 0 // beat index within the current measure
    this.nextNoteTime = 0 // audio-clock time of the next beat
    this.timerId = null
    this.onBeat = null // optional visual callback: (beatIndex) => void
  }

  /** Lazily create the AudioContext and render click buffers. */
  async init() {
    if (this.audioContext) return
    const Ctx = window.AudioContext || window.webkitAudioContext
    this.audioContext = new Ctx()
    this.accentBuffer = this.renderClick(1500, 0.6)
    this.normalBuffer = this.renderClick(1000, 0.35)
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

  /** Play one click at the given audio-clock time. */
  scheduleClick(beatIndex, time) {
    const ctx = this.audioContext
    const source = ctx.createBufferSource()
    source.buffer = beatIndex === 0 ? this.accentBuffer : this.normalBuffer
    source.connect(ctx.destination)
    source.start(time)
  }

  /** Advance bookkeeping to the next beat based on the current BPM. */
  advanceNote() {
    const secondsPerBeat = 60.0 / this.bpm
    this.nextNoteTime += secondsPerBeat
    this.currentBeat = (this.currentBeat + 1) % this.beatsPerMeasure
  }

  /** Scheduler loop: schedule everything due within the lookahead window. */
  scheduler = () => {
    while (
      this.nextNoteTime <
      this.audioContext.currentTime + SCHEDULE_AHEAD_S
    ) {
      const beatIndex = this.currentBeat
      const time = this.nextNoteTime
      this.scheduleClick(beatIndex, time)

      if (this.onBeat) {
        // Fire the visual callback close to when the click is audible.
        const delayMs = Math.max(0, (time - this.audioContext.currentTime) * 1000)
        window.setTimeout(() => this.onBeat?.(beatIndex), delayMs)
      }

      this.advanceNote()
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
    this.nextNoteTime = this.audioContext.currentTime + 0.05
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
