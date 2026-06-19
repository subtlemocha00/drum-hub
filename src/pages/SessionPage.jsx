import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../features/auth/useAuth.js'
import { useSession } from '../features/sessions/useSession.js'
import { saveLog } from '../features/logs/logService.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { formatDuration } from '../lib/format.js'

/** Practice session view: start, run, end, and log what you worked on. */
export function SessionPage() {
  useDocumentTitle('Session')
  const { user } = useAuth()
  const { isActive, elapsedSeconds, startSession, endSession, discardSession } =
    useSession()
  const navigate = useNavigate()

  const [saving, setSaving] = useState(false)
  // When set, the just-ended session is awaiting an optional practice log.
  const [pendingLog, setPendingLog] = useState(null)
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState('')
  const [savedMsg, setSavedMsg] = useState('')

  const handleEnd = async () => {
    setSaving(true)
    try {
      const summary = await endSession()
      setPendingLog(summary)
      setNotes('')
      setItems('')
      setSavedMsg('')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveLog = async () => {
    setSaving(true)
    try {
      const practicedItems = items
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      await saveLog(user.uid, {
        sessionId: pendingLog.sessionId,
        notes,
        practicedItems,
        durationSeconds: pendingLog.durationSeconds
      })
      setSavedMsg(
        `Saved a ${formatDuration(pendingLog.durationSeconds)} session and your log.`
      )
      setPendingLog(null)
    } finally {
      setSaving(false)
    }
  }

  const skipLog = () => {
    setSavedMsg(`Saved a ${formatDuration(pendingLog.durationSeconds)} session.`)
    setPendingLog(null)
  }

  // Post-session log prompt.
  if (pendingLog) {
    return (
      <div className="page">
        <header className="page__head">
          <h1 className="page__title">Nice work!</h1>
          <p className="muted">
            {formatDuration(pendingLog.durationSeconds)} practiced. What did you
            work on today?
          </p>
        </header>

        <div className="card practice-card">
          <label className="field">
            <span>Notes (optional)</span>
            <textarea
              className="textarea"
              rows={4}
              placeholder="e.g. Worked on paradiddles and a shuffle groove. Need cleaner fills."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
          <label className="field">
            <span>Practiced items (comma separated)</span>
            <input
              type="text"
              placeholder="Paradiddles, Shuffle Groove"
              value={items}
              onChange={(e) => setItems(e.target.value)}
            />
          </label>
          <div className="btn-row">
            <button className="btn btn--ghost" onClick={skipLog} disabled={saving}>
              Skip
            </button>
            <button className="btn btn--primary" onClick={handleSaveLog} disabled={saving}>
              {saving ? 'Saving…' : 'Save log'}
            </button>
          </div>
        </div>
      </div>
    )
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
        <span className="timer__state">{isActive ? 'Recording…' : 'Not running'}</span>
      </div>

      {!isActive ? (
        <div className="quick-actions">
          <button className="btn btn--primary btn--lg btn--block" onClick={startSession}>
            Start session
          </button>
          {savedMsg && <p className="notice notice--ok">{savedMsg}</p>}
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
