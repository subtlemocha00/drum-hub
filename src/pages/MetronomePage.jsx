import { useMetronome } from '../features/metronome/useMetronome.js'

const TIME_SIGNATURES = [
  { label: '4/4', beats: 4 },
  { label: '3/4', beats: 3 },
  { label: '5/4', beats: 5 },
  { label: '7/4', beats: 7 }
]

const BPM_MIN = 40
const BPM_MAX = 240

/** Minimal, accurate metronome (Phase 1): BPM, time signature, start/stop. */
export function MetronomePage() {
  const {
    bpm,
    beatsPerMeasure,
    isPlaying,
    currentBeat,
    toggle,
    setBpm,
    setBeatsPerMeasure
  } = useMetronome()

  return (
    <div className="page page--center">
      <header className="page__head">
        <h1 className="page__title">Metronome</h1>
        <p className="muted">Web Audio scheduled for tight timing.</p>
      </header>

      {/* Beat indicator */}
      <div className="beats" aria-hidden="true">
        {Array.from({ length: beatsPerMeasure }).map((_, i) => (
          <span
            key={i}
            className={
              'beats__dot' +
              (i === 0 ? ' beats__dot--accent' : '') +
              (isPlaying && i === currentBeat ? ' beats__dot--on' : '')
            }
          />
        ))}
      </div>

      <div className="card bpm-card">
        <span className="bpm-card__value">{bpm}</span>
        <span className="bpm-card__unit">BPM</span>

        <input
          className="bpm-slider"
          type="range"
          min={BPM_MIN}
          max={BPM_MAX}
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          aria-label="Tempo in beats per minute"
        />

        <div className="bpm-stepper">
          <button className="btn btn--round" onClick={() => setBpm(bpm - 1)} aria-label="Decrease tempo">
            −
          </button>
          <button className="btn btn--round" onClick={() => setBpm(bpm - 5)}>
            −5
          </button>
          <button className="btn btn--round" onClick={() => setBpm(bpm + 5)}>
            +5
          </button>
          <button className="btn btn--round" onClick={() => setBpm(bpm + 1)} aria-label="Increase tempo">
            +
          </button>
        </div>
      </div>

      <div className="time-sigs" role="group" aria-label="Time signature">
        {TIME_SIGNATURES.map((ts) => (
          <button
            key={ts.label}
            className={
              'btn time-sig' +
              (ts.beats === beatsPerMeasure ? ' time-sig--active' : '')
            }
            onClick={() => setBeatsPerMeasure(ts.beats)}
          >
            {ts.label}
          </button>
        ))}
      </div>

      <button
        className={'btn btn--lg btn--block ' + (isPlaying ? 'btn--stop' : 'btn--primary')}
        onClick={toggle}
      >
        {isPlaying ? 'Stop' : 'Start'}
      </button>
    </div>
  )
}
