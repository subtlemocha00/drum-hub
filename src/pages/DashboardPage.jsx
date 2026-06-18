import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../features/auth/useAuth.js'
import { useSession } from '../features/sessions/useSession.js'
import { getRecentSessions } from '../features/sessions/sessionService.js'
import { computeCurrentStreak } from '../features/sessions/stats.js'
import { formatDateTime, formatDuration } from '../lib/format.js'
import { Spinner } from '../components/Loader.jsx'

/** Phase 1 dashboard: greeting, streak, quick actions, recent sessions. */
export function DashboardPage() {
  const { user } = useAuth()
  const { isActive, startSession } = useSession()
  const navigate = useNavigate()

  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    let cancelled = false
    setLoading(true)
    getRecentSessions(user.uid, 20)
      .then((data) => {
        if (!cancelled) setSessions(data)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load your recent sessions.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user])

  const streak = computeCurrentStreak(sessions)
  const recent = sessions.slice(0, 5)
  const firstName = (user?.displayName || user?.email || 'drummer').split(' ')[0]

  const handleStart = () => {
    startSession()
    navigate('/session')
  }

  return (
    <div className="page">
      <header className="page__head">
        <p className="muted">Welcome back,</p>
        <h1 className="page__title">{firstName}</h1>
      </header>

      <section className="stat-row">
        <div className="card stat">
          <span className="stat__value">{streak}🔥</span>
          <span className="stat__label">Day streak</span>
        </div>
        <div className="card stat">
          <span className="stat__value">{sessions.length}</span>
          <span className="stat__label">Recent sessions</span>
        </div>
      </section>

      <section className="quick-actions">
        <button
          className="btn btn--primary btn--lg btn--block"
          onClick={handleStart}
        >
          {isActive ? 'Go to active session' : 'Start practice session'}
        </button>
        <button
          className="btn btn--lg btn--block"
          onClick={() => navigate('/metronome')}
        >
          Open metronome
        </button>
      </section>

      <section className="recent">
        <h2 className="section-title">Recent sessions</h2>
        {loading ? (
          <div className="center-row"><Spinner /></div>
        ) : error ? (
          <p className="notice notice--error">{error}</p>
        ) : recent.length === 0 ? (
          <p className="empty">
            No sessions yet. Start your first practice session above.
          </p>
        ) : (
          <ul className="session-list">
            {recent.map((s) => (
              <li key={s.id} className="card session-list__item">
                <span className="session-list__date">
                  {formatDateTime(s.startTime)}
                </span>
                <span className="session-list__duration">
                  {formatDuration(s.durationSeconds)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
