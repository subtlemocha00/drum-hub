import { useEffect, useState } from 'react'

import { useAuth } from '../features/auth/useAuth.js'
import {
  GOAL_TYPES,
  createGoal,
  deleteGoal,
  getGoals,
  goalUnit,
  setGoalCompleted,
  updateGoalProgress
} from '../features/goals/goalService.js'
import { Spinner } from '../components/Loader.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

/** Create and track personal practice goals with manual progress entry. */
export function GoalsPage() {
  useDocumentTitle('Goals')
  const { user } = useAuth()
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [type, setType] = useState('minutes')
  const [target, setTarget] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    setLoading(true)
    getGoals(user.uid)
      .then((data) => !cancelled && setGoals(data))
      .catch(() => !cancelled && setGoals([]))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [user])

  const refresh = async () => setGoals(await getGoals(user.uid))

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!title.trim() || !Number(target)) return
    setCreating(true)
    try {
      await createGoal(user.uid, { title, type, targetValue: target })
      setTitle('')
      setTarget('')
      await refresh()
    } finally {
      setCreating(false)
    }
  }

  const handleProgress = async (goal, value) => {
    const v = Number(value) || 0
    setGoals((prev) => prev.map((g) => (g.id === goal.id ? { ...g, currentValue: v } : g)))
    await updateGoalProgress(user.uid, goal.id, v)
  }

  const handleComplete = async (goal) => {
    const next = !goal.completed
    setGoals((prev) => prev.map((g) => (g.id === goal.id ? { ...g, completed: next } : g)))
    await setGoalCompleted(user.uid, goal.id, next)
  }

  const handleDelete = async (goal) => {
    setGoals((prev) => prev.filter((g) => g.id !== goal.id))
    await deleteGoal(user.uid, goal.id)
  }

  return (
    <div className="page">
      <header className="page__head">
        <h1 className="page__title">Goals</h1>
        <p className="muted">Set targets and track your progress toward them.</p>
      </header>

      <form className="card goal-form" onSubmit={handleCreate}>
        <label className="field">
          <span>Goal</span>
          <input
            type="text"
            placeholder="e.g. Reach 160 BPM paradiddles"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>
        <div className="field-row">
          <label className="field">
            <span>Measure</span>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              {GOAL_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Target</span>
            <input
              type="number"
              min="1"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              required
            />
          </label>
        </div>
        <button className="btn btn--primary btn--block" disabled={creating}>
          {creating ? 'Adding…' : 'Add goal'}
        </button>
      </form>

      {loading ? (
        <div className="center-row"><Spinner /></div>
      ) : goals.length === 0 ? (
        <p className="empty">No goals yet. Add one above to start tracking.</p>
      ) : (
        <ul className="card-list">
          {goals.map((goal) => {
            const pct = goal.targetValue
              ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
              : 0
            const unit = goalUnit(goal.type)
            return (
              <li key={goal.id} className={'card goal-card' + (goal.completed ? ' goal-card--done' : '')}>
                <div className="goal-card__head">
                  <span className="list-card__title">{goal.title}</span>
                  <button
                    className="icon-btn"
                    onClick={() => handleDelete(goal)}
                    aria-label="Delete goal"
                    title="Delete goal"
                  >
                    ✕
                  </button>
                </div>

                <div className="progress-bar">
                  <div className="progress-bar__fill" style={{ width: `${pct}%` }} />
                </div>
                <span className="muted">
                  {goal.currentValue} / {goal.targetValue} {unit} · {pct}%
                </span>

                <div className="goal-card__actions">
                  <label className="field-inline">
                    <input
                      type="number"
                      min="0"
                      defaultValue={goal.currentValue}
                      onBlur={(e) => handleProgress(goal, e.target.value)}
                      aria-label="Update current progress"
                    />
                    <span className="muted goal-card__unit">{unit}</span>
                  </label>
                  <button
                    className={'btn btn--sm' + (goal.completed ? ' btn--primary' : '')}
                    onClick={() => handleComplete(goal)}
                  >
                    {goal.completed ? '✓ Completed' : 'Mark complete'}
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
