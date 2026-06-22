import { useEffect, useMemo, useRef, useState } from 'react'

import { useAuth } from '../features/auth/useAuth.js'
import { useMetronome } from '../features/metronome/useMetronome.js'
import {
  BPM_MIN,
  BPM_MAX,
  SUBDIVISIONS,
  SUBDIVISION_BY_VALUE,
  defaultConfig
} from '../features/metronome/metronomeConfig.js'
import {
  getSubdivisionProgress,
  recordSubdivisionSession
} from '../features/metronome/trainingService.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { formatDuration } from '../lib/format.js'

const MODES = [
  { value: 'fixed', label: 'Fixed' },
  { value: 'alternating', label: 'Alternating' },
  { value: 'random', label: 'Random' }
]

const INTERVALS = [
  { value: 1, label: '1 bar' },
  { value: 2, label: '2 bars' },
  { value: 4, label: '4 bars' }
]

const randomSubdivision = (exclude) => {
  const options = SUBDIVISIONS.filter((s) => s.value !== exclude)
  return options[Math.floor(Math.random() * options.length)].value
}

/** Phase 5A: Subdivision Trainer — trains internal timing using the shared
 *  metronome engine (no second timing system). */
export function SubdivisionTrainerPage() {
  useDocumentTitle('Subdivision Trainer')
  const { user } = useAuth()

  const [mode, setMode] = useState('fixed')
  const [interval, setIntervalBars] = useState(2)
  const [progress, setProgress] = useState(null)

  const { config, isPlaying, beatInfo, toggle, updateConfig } = useMetronome({
    ...defaultConfig(),
    bpm: 100,
    beatsPerMeasure: 4,
    subdivision: 'eighth',
    accentMode: 'first'
  })

  // Track switching across the alternating/random modes without re-rendering.
  const lastBarRef = useRef(-1)
  const altIndexRef = useRef(0)
  const sessionStartRef = useRef(0)

  // Load last session to seed defaults + show the "continue" line.
  useEffect(() => {
    if (!user) return
    let cancelled = false
    getSubdivisionProgress(user.uid)
      .then((p) => {
        if (cancelled || !p) return
        setProgress(p)
        if (p.lastMode) setMode(p.lastMode)
        if (p.lastSubdivision && SUBDIVISION_BY_VALUE[p.lastSubdivision]) {
          updateConfig({ subdivision: p.lastSubdivision })
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [user, updateConfig])

  // Drive alternating/random subdivision switches off bar boundaries reported by
  // the engine — so the trainer reuses the engine's clock rather than its own.
  useEffect(() => {
    if (!isPlaying || !beatInfo || mode === 'fixed') return
    const bar = beatInfo.bar
    if (bar === lastBarRef.current) return
    lastBarRef.current = bar
    if (bar === 0 || bar % interval !== 0) return

    if (mode === 'alternating') {
      altIndexRef.current = (altIndexRef.current + 1) % SUBDIVISIONS.length
      updateConfig({ subdivision: SUBDIVISIONS[altIndexRef.current].value })
    } else {
      updateConfig({ subdivision: randomSubdivision(config.subdivision) })
    }
  }, [beatInfo, isPlaying, mode, interval, config.subdivision, updateConfig])

  const handleToggle = () => {
    if (isPlaying) {
      // Finishing — persist a minimal record of the session.
      const duration = (Date.now() - sessionStartRef.current) / 1000
      if (user && duration > 1) {
        recordSubdivisionSession(user.uid, {
          mode,
          subdivision: config.subdivision,
          durationSeconds: duration
        }).catch(() => {})
      }
      toggle()
    } else {
      // Starting — reset switch bookkeeping and align the alternating index.
      lastBarRef.current = -1
      altIndexRef.current = SUBDIVISIONS.findIndex((s) => s.value === config.subdivision)
      sessionStartRef.current = Date.now()
      toggle()
    }
  }

  const active = SUBDIVISION_BY_VALUE[config.subdivision]

  // The big read-aloud grid: a token per subdivision step across the measure.
  const tokens = useMemo(() => {
    const counts = active?.counts ?? ['']
    const rows = []
    for (let beat = 0; beat < config.beatsPerMeasure; beat++) {
      for (let step = 0; step < counts.length; step++) {
        rows.push({
          key: `${beat}-${step}`,
          beat,
          step,
          text: step === 0 ? String(beat + 1) : counts[step],
          downbeat: step === 0
        })
      }
    }
    return rows
  }, [active, config.beatsPerMeasure])

  return (
    <div className="page subtrainer">
      <header className="page__head">
        <h1 className="page__title">Subdivision Trainer</h1>
        <p className="muted">Internalize the grid — feel every subdivision.</p>
      </header>

      {progress?.totalSessions > 0 && (
        <p className="muted center-text">
          {progress.totalSessions} sessions · {formatDuration(progress.totalTimeSeconds)} trained
        </p>
      )}

      {/* Current subdivision badge */}
      <div className="subtrainer__now">
        <span className="subtrainer__now-label muted">Now playing</span>
        <span className="subtrainer__now-value">{active?.label}</span>
      </div>

      {/* Large count display */}
      <div className={'count-display' + (beatInfo?.muted ? ' count-display--muted' : '')}>
        {tokens.map((t) => (
          <span
            key={t.key}
            className={
              'count-token' +
              (t.downbeat ? ' count-token--beat' : '') +
              (isPlaying && beatInfo?.beat === t.beat && beatInfo?.step === t.step
                ? ' count-token--on'
                : '')
            }
          >
            {t.text || '·'}
          </span>
        ))}
      </div>

      <div className="card bpm-card">
        <span className="bpm-card__value">{config.bpm}</span>
        <span className="bpm-card__unit">BPM</span>
        <input
          className="bpm-slider"
          type="range"
          min={BPM_MIN}
          max={BPM_MAX}
          value={config.bpm}
          onChange={(e) => updateConfig({ bpm: Number(e.target.value) })}
          aria-label="Tempo in beats per minute"
        />
      </div>

      <button
        className={'btn btn--lg btn--block ' + (isPlaying ? 'btn--stop' : 'btn--primary')}
        onClick={handleToggle}
      >
        {isPlaying ? 'Stop' : 'Start'}
      </button>

      {/* Mode */}
      <section className="control-block">
        <h2 className="control-block__title">Mode</h2>
        <div className="seg" role="group" aria-label="Trainer mode">
          {MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              className={'seg__btn' + (m.value === mode ? ' seg__btn--active' : '')}
              onClick={() => setMode(m.value)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </section>

      {/* Fixed: pick the subdivision. */}
      {mode === 'fixed' && (
        <section className="control-block">
          <h2 className="control-block__title">Subdivision</h2>
          <div className="seg" role="group" aria-label="Subdivision">
            {SUBDIVISIONS.map((s) => (
              <button
                key={s.value}
                type="button"
                className={'seg__btn' + (s.value === config.subdivision ? ' seg__btn--active' : '')}
                onClick={() => updateConfig({ subdivision: s.value })}
              >
                {s.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Alternating / Random: how often to switch. */}
      {mode !== 'fixed' && (
        <section className="control-block">
          <h2 className="control-block__title">
            {mode === 'alternating' ? 'Switch every' : 'Change every'}
          </h2>
          <div className="seg" role="group" aria-label="Switch interval">
            {INTERVALS.map((iv) => (
              <button
                key={iv.value}
                type="button"
                className={'seg__btn' + (iv.value === interval ? ' seg__btn--active' : '')}
                onClick={() => setIntervalBars(iv.value)}
              >
                {iv.label}
              </button>
            ))}
          </div>
          <p className="muted control-hint">
            {mode === 'alternating'
              ? 'Cycles through quarter → eighth → triplet → sixteenth.'
              : 'Subdivision jumps unpredictably — stay locked to the pulse.'}
          </p>
        </section>
      )}
    </div>
  )
}
