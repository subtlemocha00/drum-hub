import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../features/auth/useAuth.js'
import { getRudiments } from '../features/rudiments/rudimentService.js'
import { RUDIMENT_CATEGORIES } from '../features/rudiments/rudimentData.js'
import { FilterChips } from '../components/FilterChips.jsx'
import { FavoriteButton } from '../components/FavoriteButton.jsx'
import { Badge } from '../components/Badge.jsx'
import { Spinner } from '../components/Loader.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

/** Searchable, filterable rudiment library. */
export function RudimentsPage() {
  useDocumentTitle('Rudiments')
  const { user } = useAuth()
  const [rudiments, setRudiments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(null)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    setLoading(true)
    getRudiments(user.uid)
      .then((data) => !cancelled && setRudiments(data))
      .catch(() => !cancelled && setError('Could not load rudiments.'))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [user])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rudiments.filter((r) => {
      if (category && r.category !== category) return false
      if (q && !r.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [rudiments, search, category])

  return (
    <div className="page">
      <header className="page__head">
        <h1 className="page__title">Rudiments</h1>
        <p className="muted">Build your vocabulary one sticking at a time.</p>
      </header>

      <input
        className="search-input"
        type="search"
        placeholder="Search rudiments…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Search rudiments"
      />

      <FilterChips options={RUDIMENT_CATEGORIES} value={category} onChange={setCategory} />

      {loading ? (
        <div className="center-row"><Spinner /></div>
      ) : error ? (
        <p className="notice notice--error">{error}</p>
      ) : filtered.length === 0 ? (
        <p className="empty">No rudiments match your search.</p>
      ) : (
        <ul className="card-list">
          {filtered.map((r) => (
            <li key={r.id}>
              <Link to={`/rudiments/${r.id}`} className="card list-card">
                <div className="list-card__main">
                  <span className="list-card__title">{r.name}</span>
                  <span className="list-card__meta">
                    <Badge tone={r.difficulty}>{r.difficulty}</Badge>
                    <span className="muted">{r.category}</span>
                  </span>
                </div>
                <FavoriteButton
                  type="rudiment"
                  refId={r.id}
                  name={r.name}
                  subtitle={r.category}
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
