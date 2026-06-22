import { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { useAuth } from '../features/auth/useAuth.js'
import { useMetronome } from '../features/metronome/useMetronome.js'
import {
  BPM_MIN,
  BPM_MAX,
  SUBDIVISIONS,
  SWING_LEVELS,
  RANDOM_MUTE_LEVELS,
  TIME_SIGNATURES,
  defaultConfig
} from '../features/metronome/metronomeConfig.js'
import {
  createPreset,
  deletePreset,
  getPresets,
  renamePreset
} from '../features/metronome/presetService.js'
import { AccentEditor } from '../components/metronome/AccentEditor.jsx'
import { PresetBar } from '../components/metronome/PresetBar.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

/** A compact segmented control for choosing one option from a list. */
function Segmented({ label, options, value, onChange, disabled }) {
  return (
    <div className="seg" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          disabled={disabled}
          className={'seg__btn' + (o.value === value ? ' seg__btn--active' : '')}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/** Phase 5A: professional metronome — subdivisions, swing, accents, gap
 *  training, random mute, tempo ramp, and savable presets. */
export function MetronomePage() {
  useDocumentTitle('Metronome')
  const { user } = useAuth()
  const location = useLocation()

  // A rudiment/groove page can hand off a starting tempo; the dashboard can hand
  // off a whole preset config via router state.
  const initial = (() => {
    const base = defaultConfig()
    if (location.state?.config) return location.state.config
    if (location.state?.bpm) return { ...base, bpm: Number(location.state.bpm) }
    return base
  })()

  const { config, isPlaying, beatInfo, toggle, updateConfig, applyConfig } =
    useMetronome(initial)

  const [presets, setPresets] = useState([])
  const [presetsLoading, setPresetsLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    setPresetsLoading(true)
    getPresets(user.uid)
      .then((list) => !cancelled && setPresets(list))
      .catch(() => {})
      .finally(() => !cancelled && setPresetsLoading(false))
    return () => {
      cancelled = true
    }
  }, [user])

  const setBpm = (value) => {
    const next = Math.min(300, Math.max(20, Math.round(value) || 0))
    updateConfig({ bpm: next })
  }

  const swingDisabled = config.subdivision !== 'eighth'
  const rampActive = isPlaying && config.tempoRamp.enabled
  const displayBpm = rampActive && beatInfo ? beatInfo.bpm : config.bpm

  // Preset persistence — optimistic local updates over the Firestore calls.
  const handleSave = useCallback(
    async (name) => {
      if (!user) return
      const id = await createPreset(user.uid, name, config)
      setPresets((prev) => [
        { id, name, config, createdAt: new Date() },
        ...prev
      ])
    },
    [user, config]
  )

  const handleRename = useCallback(
    async (id, name) => {
      setPresets((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)))
      if (user) await renamePreset(user.uid, id, name)
    },
    [user]
  )

  const handleDelete = useCallback(
    async (id) => {
      setPresets((prev) => prev.filter((p) => p.id !== id))
      if (user) await deletePreset(user.uid, id)
    },
    [user]
  )

  return (
    <div className="page metronome">
      <header className="page__head">
        <h1 className="page__title">Metronome</h1>
        <p className="muted">Web Audio scheduled for tight, drift-free timing.</p>
      </header>

      {/* Beat indicator — one dot per beat, accents highlighted, dimmed when the
          current measure is silent (gap training / random mute). */}
      <div
        className={'beats' + (beatInfo?.muted ? ' beats--muted' : '')}
        aria-hidden="true"
      >
        {Array.from({ length: config.beatsPerMeasure }).map((_, i) => (
          <span
            key={i}
            className={
              'beats__dot' +
              (config.accentPattern[i] ? ' beats__dot--accent' : '') +
              (isPlaying && beatInfo?.beat === i ? ' beats__dot--on' : '')
            }
          />
        ))}
      </div>

      <div className="card bpm-card">
        <span className="bpm-card__value">{displayBpm}</span>
        <span className="bpm-card__unit">{rampActive ? 'BPM (ramping)' : 'BPM'}</span>

        <input
          className="bpm-slider"
          type="range"
          min={BPM_MIN}
          max={BPM_MAX}
          value={config.bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          aria-label="Tempo in beats per minute"
        />

        <div className="bpm-stepper">
          <button className="btn btn--round" onClick={() => setBpm(config.bpm - 1)} aria-label="Decrease tempo">
            −
          </button>
          <button className="btn btn--round" onClick={() => setBpm(config.bpm - 5)}>
            −5
          </button>
          <button className="btn btn--round" onClick={() => setBpm(config.bpm + 5)}>
            +5
          </button>
          <button className="btn btn--round" onClick={() => setBpm(config.bpm + 1)} aria-label="Increase tempo">
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
              (ts.beats === config.beatsPerMeasure ? ' time-sig--active' : '')
            }
            onClick={() => updateConfig({ beatsPerMeasure: ts.beats })}
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

      <PresetBar
        presets={presets}
        loading={presetsLoading}
        onSave={handleSave}
        onApply={applyConfig}
        onRename={handleRename}
        onDelete={handleDelete}
      />

      {/* ---- Advanced controls ---- */}
      <section className="control-block">
        <h2 className="control-block__title">Subdivision</h2>
        <Segmented
          label="Subdivision"
          options={SUBDIVISIONS}
          value={config.subdivision}
          onChange={(v) => updateConfig({ subdivision: v })}
        />
      </section>

      <section className="control-block">
        <h2 className="control-block__title">
          Swing {swingDisabled && <span className="muted">· eighth notes only</span>}
        </h2>
        <Segmented
          label="Swing"
          options={SWING_LEVELS}
          value={config.swing}
          onChange={(v) => updateConfig({ swing: v })}
          disabled={swingDisabled}
        />
      </section>

      <section className="control-block">
        <h2 className="control-block__title">Accents</h2>
        <AccentEditor
          mode={config.accentMode}
          pattern={config.accentPattern}
          beats={config.beatsPerMeasure}
          onChange={({ mode, pattern }) =>
            updateConfig({ accentMode: mode, accentPattern: pattern })
          }
        />
      </section>

      <section className="control-block">
        <div className="control-block__head">
          <h2 className="control-block__title">Gap training</h2>
          <label className="switch">
            <input
              type="checkbox"
              checked={config.gapTraining.enabled}
              onChange={(e) =>
                updateConfig({
                  gapTraining: { ...config.gapTraining, enabled: e.target.checked }
                })
              }
            />
            <span className="switch__track" aria-hidden="true" />
          </label>
        </div>
        {config.gapTraining.enabled && (
          <div className="gap-controls">
            <Stepper
              label="Bars audible"
              value={config.gapTraining.audibleBars}
              min={1}
              max={16}
              onChange={(v) =>
                updateConfig({ gapTraining: { ...config.gapTraining, audibleBars: v } })
              }
            />
            <Stepper
              label="Bars silent"
              value={config.gapTraining.silentBars}
              min={1}
              max={16}
              onChange={(v) =>
                updateConfig({ gapTraining: { ...config.gapTraining, silentBars: v } })
              }
            />
            <p className="muted control-hint">
              Timing keeps running through the silent bars — keep the pulse, then
              check yourself when the click returns.
            </p>
          </div>
        )}
      </section>

      <section className="control-block">
        <h2 className="control-block__title">Random mute</h2>
        <Segmented
          label="Random mute"
          options={RANDOM_MUTE_LEVELS}
          value={config.randomMute}
          onChange={(v) => updateConfig({ randomMute: v })}
        />
      </section>

      <section className="control-block">
        <div className="control-block__head">
          <h2 className="control-block__title">Tempo ramp</h2>
          <label className="switch">
            <input
              type="checkbox"
              checked={config.tempoRamp.enabled}
              onChange={(e) =>
                updateConfig({
                  tempoRamp: { ...config.tempoRamp, enabled: e.target.checked }
                })
              }
            />
            <span className="switch__track" aria-hidden="true" />
          </label>
        </div>
        {config.tempoRamp.enabled && (
          <div className="ramp-controls">
            <Stepper
              label="Start BPM"
              value={config.tempoRamp.startBpm}
              min={BPM_MIN}
              max={BPM_MAX}
              step={5}
              onChange={(v) =>
                updateConfig({ tempoRamp: { ...config.tempoRamp, startBpm: v } })
              }
            />
            <Stepper
              label="End BPM"
              value={config.tempoRamp.endBpm}
              min={BPM_MIN}
              max={BPM_MAX}
              step={5}
              onChange={(v) =>
                updateConfig({ tempoRamp: { ...config.tempoRamp, endBpm: v } })
              }
            />
            <Stepper
              label="Minutes"
              value={config.tempoRamp.durationMin}
              min={1}
              max={60}
              onChange={(v) =>
                updateConfig({ tempoRamp: { ...config.tempoRamp, durationMin: v } })
              }
            />
            <p className="muted control-hint">
              Smoothly moves from start to end tempo over the duration. The big
              readout shows the live BPM while playing.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}

/** Small +/- numeric stepper used by the gap-training and ramp controls. */
function Stepper({ label, value, min, max, step = 1, onChange }) {
  const clamp = (v) => Math.min(max, Math.max(min, v))
  return (
    <div className="stepper">
      <span className="stepper__label muted">{label}</span>
      <div className="stepper__controls">
        <button
          type="button"
          className="btn btn--round"
          onClick={() => onChange(clamp(value - step))}
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <span className="stepper__value">{value}</span>
        <button
          type="button"
          className="btn btn--round"
          onClick={() => onChange(clamp(value + step))}
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  )
}
