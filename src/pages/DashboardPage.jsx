import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../features/auth/useAuth.js'
import { useSession } from '../features/sessions/useSession.js'
import { getRecentSessions } from '../features/sessions/sessionService.js'
import { computeCurrentStreak } from '../features/sessions/stats.js'
import { getRudiments, getAllRudimentProgress } from '../features/rudiments/rudimentService.js'
import { recentlyPracticed, suggestNextRudiment } from '../features/rudiments/rudimentStats.js'
import { getWarmups } from '../features/warmups/warmupService.js'
import { getActivePlanProgress } from '../features/plans/planService.js'
import { getPlanById, nextTask } from '../features/plans/planData.js'
import { getLastLog } from '../features/logs/logService.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { formatDateTime, formatDuration } from '../lib/format.js'
import { Spinner } from '../components/Loader.jsx'
import { Badge } from '../components/Badge.jsx'

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)]

/** Phase 3 dashboard: actionable guidance — what to practice and what's next. */
export function DashboardPage() {
  useDocumentTitle('Home')
  const { user } = useAuth()
  const { isActive, startSession } = useSession()
  const navigate = useNavigate()

  const [sessions, setSessions] = useState([])
  const [rudiments, setRudiments] = useState([])
  const [progressById, setProgressById] = useState({})
  const [warmups, setWarmups] = useState([])
  const [activePlan, setActivePlan] = useState(null)
  const [lastLog, setLastLog] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    setLoading(true)
    Promise.allSettled([
      getRecentSessions(user.uid, 10),
      getRudiments(user.uid),
      getAllRudimentProgress(user.uid),
      getWarmups(user.uid),
      getActivePlanProgress(user.uid),
      getLastLog(user.uid)
    ]).then(([s, r, p, w, plan, log]) => {
      if (cancelled) return
      if (s.status === 'fulfilled') setSessions(s.value)
      if (r.status === 'fulfilled') setRudiments(r.value)
      if (p.status === 'fulfilled') setProgressById(p.value)
      if (w.status === 'fulfilled') setWarmups(w.value)
      if (plan.status === 'fulfilled') setActivePlan(plan.value)
      if (log.status === 'fulfilled') setLastLog(log.value)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [user])

  const streak = computeCurrentStreak(sessions)
  const firstName = (user?.displayName || user?.email || 'drummer').split(' ')[0]

  const suggestion = useMemo(
    () => suggestNextRudiment(rudiments, progressById),
    [rudiments, progressById]
  )
  const suggestedWarmup = useMemo(
    () => (warmups.length ? randomItem(warmups) : null),
    [warmups]
  )
  const lastRudiment = useMemo(() => {
    const recent = recentlyPracticed(rudiments, progressById, 1)
    return recent[0]?.rudiment ?? null
  }, [rudiments, progressById])

  // Resolve the active plan's static definition + next task.
  const planInfo = useMemo(() => {
    if (!activePlan) return null
    const plan = getPlanById(activePlan.id)
    if (!plan) return null
    return { plan, next: nextTask(plan, activePlan.completedTasks) }
  }, [activePlan])

  const lastSession = sessions[0] ?? null

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

      {/* Continue practice plan */}
      {planInfo && (
        <section>
          <h2 className="section-title">Continue your plan</h2>
          <Link to={`/plans/${planInfo.plan.id}`} className="card continue-card">
            <div>
              <span className="list-card__title">{planInfo.plan.name}</span>
              {planInfo.next ? (
                <p className="continue-card__next muted">
                  Week {planInfo.next.week}, Day {planInfo.next.day} — {planInfo.next.task.label}
                </p>
              ) : (
                <p className="continue-card__next muted">Plan complete 🎉</p>
              )}
            </div>
            <span className="suggest-card__cta">Continue ›</span>
          </Link>
        </section>
      )}

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
          {/* Suggestions */}
          {(suggestion || suggestedWarmup) && (
            <section className="recent">
              <h2 className="section-title">Suggested for today</h2>
              {suggestion && (
                <Link to={`/rudiments/${suggestion.id}`} className="card suggest-card">
                  <div>
                    <span className="muted">Rudiment</span>
                    <div className="list-card__title">{suggestion.name}</div>
                    <div className="badge-row">
                      <Badge tone={suggestion.difficulty}>{suggestion.difficulty}</Badge>
                      <span className="muted">{suggestion.category}</span>
                    </div>
                  </div>
                  <span className="suggest-card__cta">Practice ›</span>
                </Link>
              )}
              {suggestedWarmup && (
                <Link to={`/warmups/${suggestedWarmup.id}`} className="card suggest-card">
                  <div>
                    <span className="muted">Warmup</span>
                    <div className="list-card__title">{suggestedWarmup.name}</div>
                    <span className="muted">
                      {suggestedWarmup.focus} · {suggestedWarmup.durationMinutes} min
                    </span>
                  </div>
                  <span className="suggest-card__cta">Start ›</span>
                </Link>
              )}
            </section>
          )}

          {/* Recent activity */}
          <section className="recent">
            <h2 className="section-title">Recent activity</h2>
            <ul className="card-list">
              <li className="card activity-row">
                <span className="activity-row__icon" aria-hidden="true">⏱</span>
                <div className="list-card__main">
                  <span className="activity-row__label muted">Last session</span>
                  <span>
                    {lastSession
                      ? `${formatDuration(lastSession.durationSeconds)} · ${formatDateTime(lastSession.startTime)}`
                      : 'No sessions yet'}
                  </span>
                </div>
              </li>
              <li>
                <Link to="/practice-logs" className="card activity-row">
                  <span className="activity-row__icon" aria-hidden="true">📓</span>
                  <div className="list-card__main">
                    <span className="activity-row__label muted">Last log</span>
                    <span>
                      {lastLog
                        ? lastLog.notes || lastLog.practicedItems.join(', ') || 'Logged'
                        : 'No logs yet'}
                    </span>
                  </div>
                  <span className="muted">›</span>
                </Link>
              </li>
              <li>
                {lastRudiment ? (
                  <Link to={`/rudiments/${lastRudiment.id}`} className="card activity-row">
                    <span className="activity-row__icon" aria-hidden="true">✋</span>
                    <div className="list-card__main">
                      <span className="activity-row__label muted">Last rudiment</span>
                      <span>{lastRudiment.name}</span>
                    </div>
                    <span className="muted">›</span>
                  </Link>
                ) : (
                  <div className="card activity-row">
                    <span className="activity-row__icon" aria-hidden="true">✋</span>
                    <div className="list-card__main">
                      <span className="activity-row__label muted">Last rudiment</span>
                      <span>Nothing practiced yet</span>
                    </div>
                  </div>
                )}
              </li>
            </ul>
          </section>
        </>
      )}
    </div>
  )
}
