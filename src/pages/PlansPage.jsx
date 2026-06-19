import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../features/auth/useAuth.js'
import { PLANS, countCompleted, PLAN_LEVELS } from '../data/practicePlans/index.js'
import { getAllPlanProgress } from '../features/plans/planService.js'
import { Badge } from '../components/Badge.jsx'
import { Spinner } from '../components/Loader.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

/** Browse built-in practice plans and see your progress on each. */
export function PlansPage() {
  useDocumentTitle('Practice Plans')
  const { user } = useAuth()
  const [progressById, setProgressById] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    setLoading(true)
    getAllPlanProgress(user.uid)
      .then((data) => !cancelled && setProgressById(data))
      .catch(() => !cancelled && setProgressById({}))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [user])

  return (
    <div className="page">
      <header className="page__head">
        <h1 className="page__title">Practice plans</h1>
        <p className="muted">Structured, multi-week routines to follow.</p>
      </header>

      {loading ? (
        <div className="center-row"><Spinner /></div>
      ) : (
        PLAN_LEVELS.map((level) => {
          const plans = PLANS.filter((p) => p.level === level)
          if (!plans.length) return null
          return (
            <section key={level} className="plan-level">
              <h2 className="section-title">{level}</h2>
              <ul className="card-list">
                {plans.map((plan) => {
                  const progress = progressById[plan.id]
                  const done = progress ? countCompleted(plan, progress.completedTasks) : 0
                  const pct = Math.round((done / plan.totalTasks) * 100)
                  return (
                    <li key={plan.id}>
                      <Link to={`/plans/${plan.id}`} className="card plan-card">
                        <div className="plan-card__head">
                          <span className="list-card__title">{plan.name}</span>
                          {progress?.active && <Badge tone="beginner">Active</Badge>}
                        </div>
                        <span className="muted">{plan.durationLabel}</span>
                        <p className="plan-card__summary muted">{plan.summary}</p>
                        <div className="badge-row">
                          {plan.focus.map((f) => (
                            <Badge key={f}>{f}</Badge>
                          ))}
                        </div>
                        {progress && (
                          <div className="plan-card__progress">
                            <div className="progress-bar">
                              <div className="progress-bar__fill" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="muted">{pct}% complete</span>
                          </div>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })
      )}
    </div>
  )
}
