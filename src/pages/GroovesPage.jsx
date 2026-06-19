import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../features/auth/useAuth.js'
import { getGrooves } from '../features/grooves/grooveService.js'
import { GROOVE_STYLES } from '../features/grooves/grooveData.js'
import { FilterChips } from '../components/FilterChips.jsx'
import { FavoriteButton } from '../components/FavoriteButton.jsx'
import { Badge } from '../components/Badge.jsx'
import { Spinner } from '../components/Loader.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

/** Browse + filter playable grooves. */
export function GroovesPage() {
  useDocumentTitle('Grooves')
  const { user } = useAuth()
  const [grooves, setGrooves] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [style, setStyle] = useState(null)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    setLoading(true)
    getGrooves(user.uid)
      .then((data) => !cancelled && setGrooves(data))
      .catch(() => !cancelled && setError('Could not load grooves.'))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [user])

  const filtered = useMemo(
    () => (style ? grooves.filter((g) => g.style === style) : grooves),
    [grooves, style]
  )

  return (
    <div className="page">
      <header className="page__head">
        <h1 className="page__title">Grooves</h1>
        <p className="muted">Beats to practice, internalize, and steal.</p>
      </header>

      <FilterChips options={GROOVE_STYLES} value={style} onChange={setStyle} />

      {loading ? (
        <div className="center-row"><Spinner /></div>
      ) : error ? (
        <p className="notice notice--error">{error}</p>
      ) : filtered.length === 0 ? (
        <p className="empty">No grooves in this style yet.</p>
      ) : (
        <ul className="card-list">
          {filtered.map((g) => (
            <li key={g.id}>
              <Link to={`/grooves/${g.id}`} className="card list-card">
                <div className="list-card__main">
                  <span className="list-card__title">{g.name}</span>
                  <span className="list-card__meta">
                    <Badge>{g.style}</Badge>
                    <span className="muted">
                      {g.timeSignature} · {g.bpm} BPM
                    </span>
                  </span>
                </div>
                <FavoriteButton
                  type="groove"
                  refId={g.id}
                  name={g.name}
                  subtitle={`${g.style} · ${g.bpm} BPM`}
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
