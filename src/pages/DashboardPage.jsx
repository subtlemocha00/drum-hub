import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../features/auth/useAuth.js'
import { useSession } from '../features/sessions/useSession.js'
import { getRecentSessions } from '../features/sessions/sessionService.js'
import { computeCurrentStreak } from '../features/sessions/stats.js'
import { getRudiments, getAllRudimentProgress } from '../features/rudiments/rudimentService.js'
import { recentlyPracticed, suggestNextRudiment } from '../features/rudiments/rudimentStats.js'
import { getGrooves } from '../features/grooves/grooveService.js'
import { getWarmups } from '../features/warmups/warmupService.js'
import { getRecentIds } from '../lib/recentlyViewed.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { formatDuration } from '../lib/format.js'
import { Spinner } from '../components/Loader.jsx'
import { Badge } from '../components/Badge.jsx'

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)]

/** Phase 2 dashboard: streak, quick actions, light personalization. */
export function DashboardPage() {
  useDocumentTitle('Home')
  const { user } = useAuth()
  const { isActive, startSession } = useSession()
  const navigate = useNavigate()

  const [sessions, setSessions] = useState([])
  const [rudiments, setRudiments] = useState([])
  const [progressById, setProgressById] = useState({})
  const [grooves, setGrooves] = useState([])
  const [warmups, setWarmups] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    setLoading(true)
    Promise.allSettled([
      getRecentSessions(user.uid, 20),
      getRudiments(user.uid),
      getAllRudimentProgress(user.uid),
      getGrooves(user.uid),
      getWarmups(user.uid)
    ]).then(([s, r, p, g, w]) => {
      if (cancelled) return
      if (s.status === 'fulfilled') setSessions(s.value)
      if (r.status === 'fulfilled') setRudiments(r.value)
      if (p.status === 'fulfilled') setProgressById(p.value)
      if (g.status === 'fulfilled') setGrooves(g.value)
      if (w.status === 'fulfilled') setWarmups(w.value)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [user])

  const streak = computeCurrentStreak(sessions)
  const firstName = (user?.displayName || user?.email || 'drummer').split(' ')[0]

  const practiced = useMemo(
    () => recentlyPracticed(rudiments, progressById, 4),
    [rudiments, progressById]
  )
  const suggestion = useMemo(
    () => suggestNextRudiment(rudiments, progressById),
    [rudiments, progressById]
  )
  const recentGrooves = useMemo(() => {
    if (!grooves.length) return []
    const ids = getRecentIds('grooves')
    return ids.map((id) => grooves.find((g) => g.id === id)).filter(Boolean).slice(0, 4)
  }, [grooves])

  const handleStart = () => {
    startSession()
    navigate('/session')
  }
  const randomRudiment = () => {
    if (rudiments.length) navigate(`/rudiments/${randomItem(rudiments).id}`)
  }
  const randomWarmup = () => {
    if (warmups.length) navigate(`/warmups/${randomItem(warmups).id}`)
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
          <span className="stat__value">{Object.keys(progressById).length}</span>
          <span className="stat__label">Rudiments practiced</span>
        </div>
      </section>

      <section className="quick-grid">
        <button className="btn btn--primary btn--lg" onClick={handleStart}>
          {isActive ? 'Active session' : 'Start session'}
        </button>
        <button className="btn btn--lg" onClick={() => navigate('/metronome')}>
          Metronome
        </button>
        <button className="btn btn--lg" onClick={randomRudiment} disabled={!rudiments.length}>
          Random rudiment
        </button>
        <button className="btn btn--lg" onClick={randomWarmup} disabled={!warmups.length}>
          Random warmup
        </button>
      </section>

      {loading ? (
        <div className="center-row"><Spinner /></div>
      ) : (
        <>
          {suggestion && (
            <section className="suggest">
              <h2 className="section-title">Suggested next</h2>
              <Link to={`/rudiments/${suggestion.id}`} className="card suggest-card">
                <div>
                  <span className="list-card__title">{suggestion.name}</span>
                  <div className="badge-row">
                    <Badge tone={suggestion.difficulty}>{suggestion.difficulty}</Badge>
                    <span className="muted">{suggestion.category}</span>
                  </div>
                </div>
                <span className="suggest-card__cta">Practice ›</span>
              </Link>
            </section>
          )}

          {practiced.length > 0 && (
            <section className="recent">
              <h2 className="section-title">Recently practiced</h2>
              <ul className="card-list">
                {practiced.map(({ rudiment, progress }) => (
                  <li key={rudiment.id}>
                    <Link to={`/rudiments/${rudiment.id}`} className="card list-card">
                      <div className="list-card__main">
                        <span className="list-card__title">{rudiment.name}</span>
                        <span className="muted">
                          {progress.bestBPM ? `Best ${progress.bestBPM} BPM` : '—'}
                        </span>
                      </div>
                      <span className="muted">›</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {recentGrooves.length > 0 && (
            <section className="recent">
              <h2 className="section-title">Recently viewed grooves</h2>
              <ul className="card-list">
                {recentGrooves.map((g) => (
                  <li key={g.id}>
                    <Link to={`/grooves/${g.id}`} className="card list-card">
                      <div className="list-card__main">
                        <span className="list-card__title">{g.name}</span>
                        <span className="muted">{g.style} · {g.bpm} BPM</span>
                      </div>
                      <span className="muted">›</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="recent">
            <h2 className="section-title">Recent sessions</h2>
            {sessions.length === 0 ? (
              <p className="empty">No sessions yet. Start your first one above.</p>
            ) : (
              <ul className="session-list">
                {sessions.slice(0, 3).map((s) => (
                  <li key={s.id} className="card session-list__item">
                    <span className="session-list__date">
                      {s.startTime ? s.startTime.toLocaleDateString() : '—'}
                    </span>
                    <span className="session-list__duration">
                      {formatDuration(s.durationSeconds)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  )
}
