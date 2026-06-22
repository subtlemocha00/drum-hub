import { useState } from 'react'

import { EXAMPLE_PRESETS } from '../../features/metronome/metronomeConfig.js'

/**
 * Preset management UI. Presentational: it owns only its local open/editing
 * state and delegates all persistence to the parent via callbacks. Shows the
 * user's saved presets plus the built-in example starters.
 */
export function PresetBar({ presets, loading, onSave, onApply, onRename, onDelete }) {
  const [open, setOpen] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')

  const handleSave = () => {
    const name = saveName.trim()
    if (!name) return
    onSave(name)
    setSaveName('')
  }

  const startRename = (preset) => {
    setEditingId(preset.id)
    setEditName(preset.name)
  }

  const commitRename = () => {
    if (editingId) onRename(editingId, editName)
    setEditingId(null)
    setEditName('')
  }

  return (
    <section className="preset-bar card">
      <button
        type="button"
        className="preset-bar__head"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="list-card__title">Presets</span>
        <span className="muted">{open ? '▾' : '▸'}</span>
      </button>

      {open && (
        <div className="preset-bar__body">
          <div className="preset-save">
            <input
              className="input"
              type="text"
              placeholder="Name this setup…"
              value={saveName}
              maxLength={40}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              aria-label="Preset name"
            />
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={handleSave}
              disabled={!saveName.trim()}
            >
              Save
            </button>
          </div>

          {loading ? (
            <p className="muted">Loading presets…</p>
          ) : presets.length === 0 ? (
            <p className="muted">No saved presets yet.</p>
          ) : (
            <ul className="preset-list">
              {presets.map((p) => (
                <li key={p.id} className="preset-row">
                  {editingId === p.id ? (
                    <>
                      <input
                        className="input"
                        type="text"
                        value={editName}
                        maxLength={40}
                        autoFocus
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && commitRename()}
                        aria-label="Rename preset"
                      />
                      <button className="btn btn--sm" type="button" onClick={commitRename}>
                        Done
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="preset-row__name"
                        onClick={() => onApply(p.config)}
                        title="Apply preset"
                      >
                        {p.name}
                        <span className="muted preset-row__meta">
                          {p.config.bpm} BPM · {p.config.beatsPerMeasure}/4
                        </span>
                      </button>
                      <div className="preset-row__actions">
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() => startRename(p)}
                          aria-label={`Rename ${p.name}`}
                        >
                          ✎
                        </button>
                        <button
                          type="button"
                          className="icon-btn icon-btn--danger"
                          onClick={() => onDelete(p.id)}
                          aria-label={`Delete ${p.name}`}
                        >
                          ✕
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}

          <div className="preset-examples">
            <span className="muted preset-examples__label">Starters</span>
            <div className="preset-examples__chips">
              {EXAMPLE_PRESETS.map((ex) => (
                <button
                  key={ex.name}
                  type="button"
                  className="chip"
                  onClick={() => onApply(ex.config)}
                >
                  {ex.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
