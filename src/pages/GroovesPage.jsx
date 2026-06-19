import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../features/auth/useAuth.js'
import { getGrooves } from '../features/grooves/grooveService.js'
import { GROOVE_STYLES } from '../data/grooves/index.js'
import { DIFFICULTIES } from '../data/rudiments/index.js'
import { FilterChips } from '../components/FilterChips.jsx'
import { FavoriteButton } from '../components/FavoriteButton.jsx'
import { Badge } from '../components/Badge.jsx'
import { Spinner } from '../components/Loader.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

const BPM_RANGES = [
  { value: 'slow', label: '< 90', test: (b) => b < 90 },
  { value: 'mid', label: '90–130', test: (b) => b >= 90 && b <= 130 },
  { value: 'fast', label: '> 130', test: (b) => b > 130 }
]

/** Browse + filter the groove library by genre, difficulty, BPM, and meter. */
export function GroovesPage() {
  useDocumentTitle('Grooves')
  const { user } = useAuth()
  const [grooves, setGrooves] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [style, setStyle] = useState(null)
  const [difficulty, setDifficulty] = useState(null)
  const [bpmRange, setBpmRange] = useState(null)
  const [timeSig, setTimeSig] = useState(null)

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

  // Distinct time signatures present in the catalog.
  const timeSignatures = useMemo(
    () => [...new Set(grooves.map((g) => g.timeSignature))].sort(),
    [grooves]
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const range = BPM_RANGES.find((r) => r.value === bpmRange)
    return grooves.filter((g) => {
      if (style && g.style !== style) return false
      if (difficulty && g.difficulty !== difficulty) return false
      if (timeSig && g.timeSignature !== timeSig) return false
      if (range && !range.test(g.bpm)) return false
      if (q && !g.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [grooves, search, style, difficulty, bpmRange, timeSig])

  return (
    <div className="page">
      <header className="page__head">
        <h1 className="page__title">Grooves</h1>
        <p className="muted">Beats to practice, internalize, and steal.</p>
      </header>

      <input
        className="search-input"
        type="search"
        placeholder="Search grooves…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Search grooves"
      />

      <FilterChips options={GROOVE_STYLES} value={style} onChange={setStyle} />
      <FilterChips options={DIFFICULTIES} value={difficulty} onChange={setDifficulty} allLabel="Any level" />
      <div className="chips">
        <button className={'chip' + (bpmRange === null ? ' chip--active' : '')} onClick={() => setBpmRange(null)}>
          Any BPM
        </button>
        {BPM_RANGES.map((r) => (
          <button
            key={r.value}
            className={'chip' + (bpmRange === r.value ? ' chip--active' : '')}
            onClick={() => setBpmRange(r.value)}
          >
            {r.label}
          </button>
        ))}
      </div>
      {timeSignatures.length > 1 && (
        <FilterChips options={timeSignatures} value={timeSig} onChange={setTimeSig} allLabel="Any meter" />
      )}

      <p className="muted result-count">{filtered.length} grooves</p>

      {loading ? (
        <div className="center-row"><Spinner /></div>
      ) : error ? (
        <p className="notice notice--error">{error}</p>
      ) : filtered.length === 0 ? (
        <p className="empty">No grooves match these filters.</p>
      ) : (
        <ul className="card-list">
          {filtered.map((g) => (
            <li key={g.id}>
              <Link to={`/grooves/${g.id}`} className="card list-card">
                <div className="list-card__main">
                  <span className="list-card__title">{g.name}</span>
                  <span className="list-card__meta">
                    <Badge tone={g.difficulty}>{g.difficulty}</Badge>
                    <span className="muted">
                      {g.style} · {g.timeSignature} · {g.bpm} BPM
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
