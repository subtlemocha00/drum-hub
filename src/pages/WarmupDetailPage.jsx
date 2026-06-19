import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { useAuth } from '../features/auth/useAuth.js'
import { getWarmup } from '../features/warmups/warmupService.js'
import { FavoriteButton } from '../components/FavoriteButton.jsx'
import { Badge } from '../components/Badge.jsx'
import { FullScreenLoader } from '../components/Loader.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { formatDuration } from '../lib/format.js'

/** Warmup detail with a simple count-down timer (no automation). */
export function WarmupDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()

  const [warmup, setWarmup] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [remaining, setRemaining] = useState(0)
  const [running, setRunning] = useState(false)
  const tickRef = useRef(null)

  useDocumentTitle(warmup?.name)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    setLoading(true)
    setNotFound(false)
    getWarmup(user.uid, id)
      .then((w) => {
        if (cancelled) return
        if (!w) {
          setNotFound(true)
          return
        }
        setWarmup(w)
        setRemaining((w.durationMinutes || 0) * 60)
      })
      .catch(() => !cancelled && setNotFound(true))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [user, id])

  // Count down while running; stop at zero.
  useEffect(() => {
    if (!running) return
    tickRef.current = window.setInterval(() => {
      setRemaining((s) => {
        if (s <= 1) {
          window.clearInterval(tickRef.current)
          setRunning(false)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => window.clearInterval(tickRef.current)
  }, [running])

  if (loading) return <FullScreenLoader />
  if (notFound) {
    return (
      <div className="page">
        <p className="empty">Warmup not found.</p>
        <Link className="btn btn--block" to="/warmups">Back to warmups</Link>
      </div>
    )
  }

  const total = (warmup.durationMinutes || 0) * 60
  const reset = () => {
    setRunning(false)
    setRemaining(total)
  }

  return (
    <div className="page">
      <div className="detail-head">
        <Link to="/warmups" className="back-link">‹ Warmups</Link>
        <FavoriteButton
          type="warmup"
          refId={warmup.id}
          name={warmup.name}
          subtitle={`${warmup.focus} · ${warmup.durationMinutes} min`}
          size="lg"
        />
      </div>

      <header className="page__head">
        <h1 className="page__title">{warmup.name}</h1>
        <div className="badge-row">
          <Badge>{warmup.focus}</Badge>
          <span className="muted">{warmup.durationMinutes} min</span>
        </div>
      </header>

      <p>{warmup.description}</p>

      <section className="card timer">
        <span className={'timer__value' + (running ? ' timer__value--live' : '')}>
          {formatDuration(remaining)}
        </span>
        <div className="btn-row">
          {!running ? (
            <button
              className="btn btn--primary"
              onClick={() => setRunning(true)}
              disabled={remaining === 0}
            >
              {remaining === total ? 'Start warmup' : 'Resume'}
            </button>
          ) : (
            <button className="btn" onClick={() => setRunning(false)}>
              Pause
            </button>
          )}
          <button className="btn btn--ghost" onClick={reset}>
            Reset
          </button>
        </div>
      </section>

      <section>
        <h2 className="section-title">Steps</h2>
        <ol className="steps">
          {(warmup.steps || []).map((step, i) => (
            <li key={i} className="card steps__item">
              {step}
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
