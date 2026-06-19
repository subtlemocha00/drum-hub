import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../features/auth/useAuth.js'
import { getWarmups } from '../features/warmups/warmupService.js'
import { WARMUP_FOCUS } from '../features/warmups/warmupData.js'
import { FilterChips } from '../components/FilterChips.jsx'
import { FavoriteButton } from '../components/FavoriteButton.jsx'
import { Badge } from '../components/Badge.jsx'
import { Spinner } from '../components/Loader.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

/** Browse short structured warmup routines. */
export function WarmupsPage() {
  useDocumentTitle('Warmups')
  const { user } = useAuth()
  const [warmups, setWarmups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [focus, setFocus] = useState(null)

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
    () => (focus ? warmups.filter((w) => w.focus === focus) : warmups),
    [warmups, focus]
  )

  return (
    <div className="page">
      <header className="page__head">
        <h1 className="page__title">Warmups</h1>
        <p className="muted">Short routines to get loose before you dig in.</p>
      </header>

      <FilterChips options={WARMUP_FOCUS} value={focus} onChange={setFocus} />

      {loading ? (
        <div className="center-row"><Spinner /></div>
      ) : error ? (
        <p className="notice notice--error">{error}</p>
      ) : filtered.length === 0 ? (
        <p className="empty">No warmups in this focus area yet.</p>
      ) : (
        <ul className="card-list">
          {filtered.map((w) => (
            <li key={w.id}>
              <Link to={`/warmups/${w.id}`} className="card list-card">
                <div className="list-card__main">
                  <span className="list-card__title">{w.name}</span>
                  <span className="list-card__meta">
                    <Badge>{w.focus}</Badge>
                    <span className="muted">{w.durationMinutes} min</span>
                  </span>
                </div>
                <FavoriteButton
                  type="warmup"
                  refId={w.id}
                  name={w.name}
                  subtitle={`${w.focus} · ${w.durationMinutes} min`}
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
