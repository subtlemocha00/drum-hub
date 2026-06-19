import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { useAuth } from '../features/auth/useAuth.js'
import { getGroove } from '../features/grooves/grooveService.js'
import { FavoriteButton } from '../components/FavoriteButton.jsx'
import { Badge } from '../components/Badge.jsx'
import { YouTubeEmbed } from '../components/YouTubeEmbed.jsx'
import { FullScreenLoader } from '../components/Loader.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { recordView } from '../lib/recentlyViewed.js'

/** Groove detail page. Records a "recently viewed" entry for the dashboard. */
export function GrooveDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [groove, setGroove] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useDocumentTitle(groove?.name)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    setLoading(true)
    setNotFound(false)
    getGroove(user.uid, id)
      .then((g) => {
        if (cancelled) return
        if (!g) {
          setNotFound(true)
          return
        }
        setGroove(g)
        recordView('grooves', g.id)
      })
      .catch(() => !cancelled && setNotFound(true))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [user, id])

  if (loading) return <FullScreenLoader />
  if (notFound) {
    return (
      <div className="page">
        <p className="empty">Groove not found.</p>
        <Link className="btn btn--block" to="/grooves">Back to grooves</Link>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="detail-head">
        <Link to="/grooves" className="back-link">‹ Grooves</Link>
        <FavoriteButton
          type="groove"
          refId={groove.id}
          name={groove.name}
          subtitle={`${groove.style} · ${groove.bpm} BPM`}
          size="lg"
        />
      </div>

      <header className="page__head">
        <h1 className="page__title">{groove.name}</h1>
        <div className="badge-row">
          <Badge>{groove.style}</Badge>
          <span className="muted">
            {groove.timeSignature} · {groove.bpm} BPM
          </span>
        </div>
      </header>

      <p>{groove.description}</p>

      <button
        className="btn btn--primary btn--block"
        onClick={() => navigate('/metronome', { state: { bpm: groove.bpm } })}
      >
        Practice at {groove.bpm} BPM
      </button>

      {groove.notes && (
        <section className="card">
          <h2 className="section-title">Notes</h2>
          <p>{groove.notes}</p>
        </section>
      )}

      <section>
        <h2 className="section-title">Video</h2>
        <YouTubeEmbed url={groove.youtubeUrl} title={groove.name} />
      </section>
    </div>
  )
}
