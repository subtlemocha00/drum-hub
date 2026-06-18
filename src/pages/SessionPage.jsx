import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useSession } from '../features/sessions/useSession.js'
import { formatDuration } from '../lib/format.js'

/** Practice session view: start, run, and end a manually-tracked session. */
export function SessionPage() {
  const { isActive, elapsedSeconds, startSession, endSession, discardSession } =
    useSession()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)

  const handleEnd = async () => {
    setSaving(true)
    try {
      const summary = await endSession()
      setLastSaved(summary)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page page--center">
      <header className="page__head">
        <h1 className="page__title">Practice session</h1>
        <p className="muted">
          Sessions are tracked manually — start when you begin, end when you’re
          done.
        </p>
      </header>

      <div className="timer card">
        <span className={'timer__value' + (isActive ? ' timer__value--live' : '')}>
          {formatDuration(elapsedSeconds)}
        </span>
        <span className="timer__state">
          {isActive ? 'Recording…' : 'Not running'}
        </span>
      </div>

      {!isActive ? (
        <div className="quick-actions">
          <button
            className="btn btn--primary btn--lg btn--block"
            onClick={startSession}
          >
            Start session
          </button>
          {lastSaved && (
            <p className="notice notice--ok">
              Saved a {formatDuration(lastSaved.durationSeconds)} session. Nice
              work!
            </p>
          )}
          <button className="btn btn--ghost btn--block" onClick={() => navigate('/dashboard')}>
            Back to dashboard
          </button>
        </div>
      ) : (
        <div className="quick-actions">
          <button
            className="btn btn--primary btn--lg btn--block"
            onClick={handleEnd}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'End & save session'}
          </button>
          <button
            className="btn btn--ghost btn--block"
            onClick={discardSession}
            disabled={saving}
          >
            Discard
          </button>
          <p className="muted center-text">
            You can keep practicing — the timer follows you across the app.
          </p>
        </div>
      )}
    </div>
  )
}
