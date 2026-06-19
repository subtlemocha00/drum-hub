import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { searchContent } from '../data/search.js'
import { Badge } from '../components/Badge.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

/** Global search across rudiments, grooves, warmups, and practice plans. */
export function SearchPage() {
  useDocumentTitle('Search')
  const [query, setQuery] = useState('')
  const results = useMemo(() => searchContent(query), [query])

  return (
    <div className="page">
      <header className="page__head">
        <h1 className="page__title">Search</h1>
        <p className="muted">Find rudiments, grooves, warmups, and plans.</p>
      </header>

      <input
        className="search-input"
        type="search"
        autoFocus
        placeholder="Search everything…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search all content"
      />

      {query.trim() === '' ? (
        <p className="muted">Type to search the whole library.</p>
      ) : results.length === 0 ? (
        <p className="empty">No results for “{query}”.</p>
      ) : (
        <>
          <p className="muted result-count">{results.length} results</p>
          <ul className="card-list">
            {results.map((r) => (
              <li key={`${r.type}-${r.id}`}>
                <Link to={r.route} className="card list-card">
                  <div className="list-card__main">
                    <span className="list-card__title">{r.name}</span>
                    <span className="muted">{r.subtitle}</span>
                  </div>
                  <Badge>{r.type}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
