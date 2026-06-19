import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { useFavorites } from '../features/favorites/useFavorites.js'
import { FAVORITE_TYPES } from '../features/favorites/favoritesService.js'
import { FavoriteButton } from '../components/FavoriteButton.jsx'
import { Badge } from '../components/Badge.jsx'
import { FilterChips } from '../components/FilterChips.jsx'
import { Spinner } from '../components/Loader.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

const ROUTE_BY_TYPE = {
  rudiment: '/rudiments',
  groove: '/grooves',
  warmup: '/warmups'
}

/** Unified, filterable list of bookmarked rudiments, grooves, and warmups. */
export function FavoritesPage() {
  useDocumentTitle('Favorites')
  const { favorites, loading } = useFavorites()
  const [type, setType] = useState(null)

  const filtered = useMemo(() => {
    const list = type ? favorites.filter((f) => f.type === type) : favorites
    return [...list].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
  }, [favorites, type])

  return (
    <div className="page">
      <header className="page__head">
        <h1 className="page__title">Favorites</h1>
        <p className="muted">Everything you’ve starred, in one place.</p>
      </header>

      <FilterChips options={FAVORITE_TYPES} value={type} onChange={setType} />

      {loading ? (
        <div className="center-row"><Spinner /></div>
      ) : filtered.length === 0 ? (
        <p className="empty">
          No favorites yet. Tap the ☆ on any rudiment, groove, or warmup.
        </p>
      ) : (
        <ul className="card-list">
          {filtered.map((f) => (
            <li key={f.id}>
              <Link to={`${ROUTE_BY_TYPE[f.type]}/${f.refId}`} className="card list-card">
                <div className="list-card__main">
                  <span className="list-card__title">{f.name || f.refId}</span>
                  <span className="list-card__meta">
                    <Badge>{f.type}</Badge>
                    {f.subtitle && <span className="muted">{f.subtitle}</span>}
                  </span>
                </div>
                <FavoriteButton
                  type={f.type}
                  refId={f.refId}
                  name={f.name}
                  subtitle={f.subtitle}
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
