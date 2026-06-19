import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../features/auth/useAuth.js'
import { getWarmups } from '../features/warmups/warmupService.js'
import { WARMUP_CATEGORIES, WARMUP_DURATIONS } from '../data/warmups/index.js'
import { FilterChips } from '../components/FilterChips.jsx'
import { FavoriteButton } from '../components/FavoriteButton.jsx'
import { Badge } from '../components/Badge.jsx'
import { Spinner } from '../components/Loader.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

const prettyCategory = (c) => c.replace('-', ' ')

/** Browse warmup routines, filtered by category and duration. */
export function WarmupsPage() {
  useDocumentTitle('Warmups')
  const { user } = useAuth()
  const [warmups, setWarmups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [category, setCategory] = useState(null)
  const [duration, setDuration] = useState(null)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    setLoading(true)
    getWarmups(user.uid)
      .then((data) => !cancelled && setWarmups(data))
      .catch(() => !cancelled && setError('Could not load warmups.'))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [user])

  const filtered = useMemo(
    () =>
      warmups.filter((w) => {
        if (category && w.category !== category) return false
        if (duration && w.durationMinutes !== duration) return false
        return true
      }),
    [warmups, category, duration]
  )

  return (
    <div className="page">
      <header className="page__head">
        <h1 className="page__title">Warmups</h1>
        <p className="muted">Short routines to get loose before you dig in.</p>
      </header>

      <FilterChips options={WARMUP_CATEGORIES} value={category} onChange={setCategory} />
      <div className="chips">
        <button className={'chip' + (duration === null ? ' chip--active' : '')} onClick={() => setDuration(null)}>
          Any length
        </button>
        {WARMUP_DURATIONS.map((d) => (
          <button
            key={d}
            className={'chip' + (duration === d ? ' chip--active' : '')}
            onClick={() => setDuration(d)}
          >
            {d} min
          </button>
        ))}
      </div>

      <p className="muted result-count">{filtered.length} warmups</p>

      {loading ? (
        <div className="center-row"><Spinner /></div>
      ) : error ? (
        <p className="notice notice--error">{error}</p>
      ) : filtered.length === 0 ? (
        <p className="empty">No warmups match these filters.</p>
      ) : (
        <ul className="card-list">
          {filtered.map((w) => (
            <li key={w.id}>
              <Link to={`/warmups/${w.id}`} className="card list-card">
                <div className="list-card__main">
                  <span className="list-card__title">{w.name}</span>
                  <span className="list-card__meta">
                    <Badge tone={w.difficulty}>{w.difficulty}</Badge>
                    <span className="muted">{prettyCategory(w.category)} · {w.durationMinutes} min</span>
                  </span>
                </div>
                <FavoriteButton
                  type="warmup"
                  refId={w.id}
                  name={w.name}
                  subtitle={`${prettyCategory(w.category)} · ${w.durationMinutes} min`}
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
