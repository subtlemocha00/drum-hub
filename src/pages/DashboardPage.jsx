import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../features/auth/useAuth.js'
import { useSession } from '../features/sessions/useSession.js'
import { useProfile } from '../features/profile/useProfile.js'
import { getRecentSessions } from '../features/sessions/sessionService.js'
import { computeCurrentStreak } from '../features/sessions/stats.js'
import { getAllRudimentProgress } from '../features/rudiments/rudimentService.js'
import { recentlyPracticed } from '../features/rudiments/rudimentStats.js'
import { getActivePlanProgress } from '../features/plans/planService.js'
import { getLastLog } from '../features/logs/logService.js'
import { getGoals, goalUnit } from '../features/goals/goalService.js'
import { getPlanById, nextTask } from '../data/practicePlans/index.js'
import { RUDIMENTS } from '../data/rudiments/index.js'
import { WARMUPS } from '../data/warmups/index.js'
import { recommendContent, recommendStartingPlan } from '../data/recommendations.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { formatDateTime, formatDuration } from '../lib/format.js'
import { Spinner } from '../components/Loader.jsx'

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)]

function RecCard({ kind, title, subtitle, to, cta }) {
  return (
    <Link to={to} className="card suggest-card">
      <div>
        <span className="muted">{kind}</span>
        <div className="list-card__title">{title}</div>
        {subtitle && <span className="muted">{subtitle}</span>}
      </div>
      <span className="suggest-card__cta">{cta} ›</span>
    </Link>
  )
}

/** Phase 4 dashboard: profile-aware recommendations + actionable guidance. */
export function DashboardPage() {
  useDocumentTitle('Home')
  const { user } = useAuth()
  const { profile } = useProfile()
  const { isActive, startSession } = useSession()
  const navigate = useNavigate()

  const [sessions, setSessions] = useState([])
  const [progressById, setProgressById] = useState({})
  const [activePlan, setActivePlan] = useState(null)
  const [lastLog, setLastLog] = useState(null)
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    setLoading(true)
    Promise.allSettled([
      getRecentSessions(user.uid, 10),
      getAllRudimentProgress(user.uid),
      getActivePlanProgress(user.uid),
      getLastLog(user.uid),
      getGoals(user.uid)
    ]).then(([s, p, plan, log, g]) => {
      if (cancelled) return
      if (s.status === 'fulfilled') setSessions(s.value)
      if (p.status === 'fulfilled') setProgressById(p.value)
      if (plan.status === 'fulfilled') setActivePlan(plan.value)
      if (log.status === 'fulfilled') setLastLog(log.value)
      if (g.status === 'fulfilled') setGoals(g.value)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [user])

  const streak = computeCurrentStreak(sessions)
  const firstName = (user?.displayName || user?.email || 'drummer').split(' ')[0]

  const recs = useMemo(() => recommendContent(profile, progressById), [profile, progressById])
  const planInfo = useMemo(() => {
    if (!activePlan) return null
    const plan = getPlanById(activePlan.id)
    if (!plan) return null
    return { plan, next: nextTask(plan, activePlan.completedTasks) }
  }, [activePlan])
  const recommendedPlan = useMemo(
    () => (!activePlan ? recommendStartingPlan(profile) : null),
    [activePlan, profile]
  )
  const lastRudiment = useMemo(() => {
    const recent = recentlyPracticed(RUDIMENTS, progressById, 1)
    return recent[0]?.rudiment ?? null
  }, [progressById])

  const openGoals = goals.filter((g) => !g.completed).slice(0, 3)
  const lastSession = sessions[0] ?? null

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
          <span className="stat__value">{Object.keys(progressById).length}</span>
          <span className="stat__label">Rudiments practiced</span>
        </div>
      </section>

      {/* Continue / start a plan */}
      {planInfo ? (
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
      ) : (
        recommendedPlan && (
          <section>
            <h2 className="section-title">Recommended plan</h2>
            <Link to={`/plans/${recommendedPlan.id}`} className="card continue-card">
              <div>
                <span className="list-card__title">{recommendedPlan.name}</span>
                <p className="continue-card__next muted">{recommendedPlan.summary}</p>
              </div>
              <span className="suggest-card__cta">Start ›</span>
            </Link>
          </section>
        )
      )}

      <section className="quick-grid">
        <button className="btn btn--primary btn--lg" onClick={handleStart}>
          {isActive ? 'Active session' : 'Start session'}
        </button>
        <button className="btn btn--lg" onClick={() => navigate('/metronome')}>
          Metronome
        </button>
        <button className="btn btn--lg" onClick={() => navigate(`/rudiments/${randomItem(RUDIMENTS).id}`)}>
          Random rudiment
        </button>
        <button className="btn btn--lg" onClick={() => navigate(`/warmups/${randomItem(WARMUPS).id}`)}>
          Random warmup
        </button>
      </section>

      {/* Recommended content */}
      <section className="recent">
        <h2 className="section-title">Recommended for you</h2>
        {recs.warmup && (
          <RecCard
            kind="Warmup"
            title={recs.warmup.name}
            subtitle={`${recs.warmup.category} · ${recs.warmup.durationMinutes} min`}
            to={`/warmups/${recs.warmup.id}`}
            cta="Start"
          />
        )}
        {recs.rudiment && (
          <RecCard
            kind="Rudiment"
            title={recs.rudiment.name}
            subtitle={recs.rudiment.category}
            to={`/rudiments/${recs.rudiment.id}`}
            cta="Practice"
          />
        )}
        {recs.groove && (
          <RecCard
            kind="Groove"
            title={recs.groove.name}
            subtitle={`${recs.groove.style} · ${recs.groove.bpm} BPM`}
            to={`/grooves/${recs.groove.id}`}
            cta="Play"
          />
        )}
      </section>

      {/* Current goals */}
      {openGoals.length > 0 && (
        <section className="recent">
          <div className="chart-head">
            <h2 className="section-title">Current goals</h2>
            <Link to="/goals" className="muted">All ›</Link>
          </div>
          <ul className="card-list">
            {openGoals.map((goal) => {
              const pct = goal.targetValue
                ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
                : 0
              return (
                <li key={goal.id} className="card goal-mini">
                  <div className="goal-mini__head">
                    <span className="list-card__title">{goal.title}</span>
                    <span className="muted">
                      {goal.currentValue}/{goal.targetValue} {goalUnit(goal.type)}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar__fill" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {/* Recent activity */}
      {!loading && (
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
      )}

      {loading && <div className="center-row"><Spinner /></div>}
    </div>
  )
}
