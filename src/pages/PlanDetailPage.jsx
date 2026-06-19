import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { useAuth } from '../features/auth/useAuth.js'
import { getPlanById, nextTask, countCompleted } from '../features/plans/planData.js'
import { getPlanProgress, startPlan, toggleTask } from '../features/plans/planService.js'
import { Badge } from '../components/Badge.jsx'
import { FullScreenLoader } from '../components/Loader.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

/** Plan detail: start/resume, track per-task completion across weeks and days. */
export function PlanDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const plan = getPlanById(id)

  const [completed, setCompleted] = useState({})
  const [active, setActive] = useState(false)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [openWeek, setOpenWeek] = useState(1)

  useDocumentTitle(plan?.name)

  useEffect(() => {
    if (!user || !plan) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    getPlanProgress(user.uid, plan.id)
      .then((p) => {
        if (cancelled) return
        setCompleted(p?.completedTasks ?? {})
        setActive(p?.active ?? false)
        // Open the week containing the next task.
        if (p) {
          const nt = nextTask(plan, p.completedTasks)
          if (nt) setOpenWeek(nt.week)
        }
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [user, plan])

  if (!plan) {
    return (
      <div className="page">
        <p className="empty">Plan not found.</p>
        <Link className="btn btn--block" to="/plans">Back to plans</Link>
      </div>
    )
  }
  if (loading) return <FullScreenLoader />

  const done = countCompleted(plan, completed)
  const pct = Math.round((done / plan.totalTasks) * 100)
  const nt = nextTask(plan, completed)

  const handleStart = async () => {
    setStarting(true)
    try {
      await startPlan(user.uid, plan.id)
      setActive(true)
    } finally {
      setStarting(false)
    }
  }

  const handleToggle = async (taskId) => {
    const next = !completed[taskId]
    setCompleted((prev) => ({ ...prev, [taskId]: next }))
    try {
      await toggleTask(user.uid, plan.id, taskId, next)
    } catch {
      setCompleted((prev) => ({ ...prev, [taskId]: !next }))
    }
  }

  return (
    <div className="page">
      <div className="detail-head">
        <Link to="/plans" className="back-link">‹ Plans</Link>
        {active && <Badge tone="beginner">Active</Badge>}
      </div>

      <header className="page__head">
        <h1 className="page__title">{plan.name}</h1>
        <div className="badge-row">
          <span className="muted">{plan.durationLabel}</span>
          {plan.focus.map((f) => (
            <Badge key={f}>{f}</Badge>
          ))}
        </div>
      </header>

      <p>{plan.summary}</p>

      <section className="card">
        <div className="plan-progress">
          <div className="progress-bar">
            <div className="progress-bar__fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="muted">
            {done} / {plan.totalTasks} tasks · {pct}%
          </span>
        </div>
        {nt ? (
          <p className="plan-next">
            Next: <strong>Week {nt.week}, Day {nt.day}</strong> — {nt.task.label}
          </p>
        ) : (
          <p className="notice notice--ok">Plan complete — outstanding work! 🥁</p>
        )}
        <button
          className="btn btn--primary btn--block"
          onClick={handleStart}
          disabled={starting || active}
        >
          {active ? 'This is your active plan' : starting ? 'Starting…' : 'Start this plan'}
        </button>
      </section>

      {plan.weeks.map((week) => {
        const weekTasks = week.days.reduce((n, d) => n + d.tasks.length, 0)
        const weekDone = week.days.reduce(
          (n, d) => n + d.tasks.filter((t) => completed[t.id]).length,
          0
        )
        const isOpen = openWeek === week.week
        return (
          <section key={week.week} className="card week-card">
            <button
              className="week-card__head"
              onClick={() => setOpenWeek(isOpen ? 0 : week.week)}
              aria-expanded={isOpen}
            >
              <span>
                <strong>Week {week.week}</strong> · {week.title}
              </span>
              <span className="muted">
                {weekDone}/{weekTasks} {isOpen ? '▾' : '▸'}
              </span>
            </button>

            {isOpen && (
              <div className="week-card__body">
                {week.days.map((day) => (
                  <div key={day.day} className="plan-day">
                    <h3 className="plan-day__title">Day {day.day}</h3>
                    <ul className="task-list">
                      {day.tasks.map((task) => (
                        <li key={task.id}>
                          <label className="task">
                            <input
                              type="checkbox"
                              checked={!!completed[task.id]}
                              onChange={() => handleToggle(task.id)}
                            />
                            <span className="task__label">{task.label}</span>
                            <span className="task__min muted">{task.minutes}m</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
