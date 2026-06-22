import { ACCENT_MODES, accentPatternForMode } from '../../features/metronome/metronomeConfig.js'

/**
 * Accent configuration: a row of mode buttons plus, in Custom mode, a tappable
 * per-beat grid. Emits `{ mode, pattern }` so the parent stores both the chosen
 * mode and the resulting boolean array.
 */
export function AccentEditor({ mode, pattern, beats, onChange }) {
  const selectMode = (nextMode) => {
    if (nextMode === 'custom') {
      // Seed custom editing from whatever is currently sounding.
      onChange({ mode: 'custom', pattern: [...pattern] })
    } else {
      onChange({ mode: nextMode, pattern: accentPatternForMode(nextMode, beats) })
    }
  }

  const toggleBeat = (i) => {
    const next = pattern.slice()
    next[i] = !next[i]
    onChange({ mode: 'custom', pattern: next })
  }

  return (
    <div className="accent-editor">
      <div className="seg" role="group" aria-label="Accent pattern">
        {ACCENT_MODES.map((m) => (
          <button
            key={m.value}
            type="button"
            className={'seg__btn' + (m.value === mode ? ' seg__btn--active' : '')}
            onClick={() => selectMode(m.value)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === 'custom' && (
        <div className="accent-grid" role="group" aria-label="Custom accents">
          {Array.from({ length: beats }).map((_, i) => (
            <button
              key={i}
              type="button"
              className={'accent-cell' + (pattern[i] ? ' accent-cell--on' : '')}
              aria-pressed={!!pattern[i]}
              onClick={() => toggleBeat(i)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
