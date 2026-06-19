import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { useAuth } from '../features/auth/useAuth.js'
import {
  getRudiment,
  getRudimentProgress,
  logRudimentPractice,
  setRudimentTarget
} from '../features/rudiments/rudimentService.js'
import { FavoriteButton } from '../components/FavoriteButton.jsx'
import { Badge } from '../components/Badge.jsx'
import { YouTubeEmbed } from '../components/YouTubeEmbed.jsx'
import { RelatedList } from '../components/RelatedList.jsx'
import { FullScreenLoader, Spinner } from '../components/Loader.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { formatDuration } from '../lib/format.js'
import {
  groovesForRudiment,
  warmupsForRudiment,
  plansForRudiment
} from '../data/relationships.js'

/** Rudiment detail + explicit, user-driven practice tracking. */
export function RudimentDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [rudiment, setRudiment] = useState(null)
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [bpm, setBpm] = useState('')
  const [target, setTarget] = useState('')
  const [practicing, setPracticing] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')
  const tickRef = useRef(null)

  useDocumentTitle(rudiment?.name)

  // Load rudiment + existing progress.
  useEffect(() => {
    if (!user) return
    let cancelled = false
    setLoading(true)
    setNotFound(false)
    Promise.all([getRudiment(user.uid, id), getRudimentProgress(user.uid, id)])
      .then(([r, p]) => {
        if (cancelled) return
        if (!r) {
          setNotFound(true)
          return
        }
        setRudiment(r)
        setProgress(p)
        setBpm(String(p?.currentBPM ?? r.bpmMin ?? ''))
        setTarget(String(p?.targetBPM ?? r.bpmMax ?? ''))
      })
      .catch(() => !cancelled && setNotFound(true))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [user, id])

  // Practice timer.
  useEffect(() => {
    if (!practicing) return
    tickRef.current = window.setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => window.clearInterval(tickRef.current)
  }, [practicing])

  if (loading) return <FullScreenLoader />
  if (notFound) {
    return (
      <div className="page">
        <p className="empty">Rudiment not found.</p>
        <Link className="btn btn--block" to="/rudiments">Back to rudiments</Link>
      </div>
    )
  }

  const startPractice = () => {
    setSavedMsg('')
    setElapsed(0)
    setPracticing(true)
  }

  const save = async (practiceSeconds) => {
    setSaving(true)
    try {
      const updated = await logRudimentPractice(user.uid, id, {
        bpm: Number(bpm) || null,
        practiceSeconds
      })
      setProgress(updated)
      setSavedMsg(
        practiceSeconds > 0
          ? `Logged ${formatDuration(practiceSeconds)} of practice.`
          : 'BPM logged.'
      )
    } finally {
      setSaving(false)
    }
  }

  const completePractice = async () => {
    setPracticing(false)
    window.clearInterval(tickRef.current)
    await save(elapsed)
    setElapsed(0)
  }

  const logBpmOnly = () => save(0)

  const saveTarget = async () => {
    const updated = await setRudimentTarget(user.uid, id, target)
    setProgress(updated)
  }

  const openMetronome = () => {
    const startBpm = Number(bpm) || rudiment.bpmMin || 120
    navigate('/metronome', { state: { bpm: startBpm } })
  }

  const current = progress?.currentBPM ?? null
  const best = progress?.bestBPM ?? null
  const goal = progress?.targetBPM ?? null
  const pctToBest = best ? Math.min(100, Math.round(((current ?? 0) / best) * 100)) : 0

  return (
    <div className="page">
      <div className="detail-head">
        <Link to="/rudiments" className="back-link">‹ Rudiments</Link>
        <FavoriteButton
          type="rudiment"
          refId={rudiment.id}
          name={rudiment.name}
          subtitle={rudiment.category}
          size="lg"
        />
      </div>

      <header className="page__head">
        <h1 className="page__title">{rudiment.name}</h1>
        <div className="badge-row">
          <Badge tone={rudiment.difficulty}>{rudiment.difficulty}</Badge>
          <Badge>{rudiment.category}</Badge>
          <span className="muted">
            {rudiment.bpmMin}–{rudiment.bpmMax} BPM
          </span>
        </div>
      </header>

      <p>{rudiment.description}</p>

      <section className="card notation-card">
        <h2 className="section-title">Sticking</h2>
        <pre className="notation">{rudiment.notation}</pre>
      </section>

      {/* Practice + progress */}
      <section className="card practice-card">
        <h2 className="section-title">Practice tracking</h2>

        <div className="progress-trio">
          <div className="progress-stat">
            <span className="progress-stat__value">{current ?? '—'}</span>
            <span className="progress-stat__label">Current</span>
          </div>
          <div className="progress-stat">
            <span className="progress-stat__value accent">{best ?? '—'}</span>
            <span className="progress-stat__label">Best</span>
          </div>
          <div className="progress-stat">
            <span className="progress-stat__value">{goal ?? '—'}</span>
            <span className="progress-stat__label">Target</span>
          </div>
        </div>

        {best != null && (
          <div className="progress-bar" aria-hidden="true">
            <div className="progress-bar__fill" style={{ width: `${pctToBest}%` }} />
          </div>
        )}

        <div className="field-row">
          <label className="field">
            <span>Today’s BPM</span>
            <input
              type="number"
              inputMode="numeric"
              min="20"
              max="400"
              value={bpm}
              onChange={(e) => setBpm(e.target.value)}
            />
          </label>
          <label className="field">
            <span>Target BPM</span>
            <span className="field-inline">
              <input
                type="number"
                inputMode="numeric"
                min="20"
                max="400"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              />
              <button type="button" className="btn btn--sm" onClick={saveTarget}>
                Set
              </button>
            </span>
          </label>
        </div>

        {!practicing ? (
          <div className="quick-actions">
            <button className="btn btn--primary btn--block" onClick={startPractice}>
              Start practice
            </button>
            <div className="btn-row">
              <button className="btn" onClick={logBpmOnly} disabled={saving}>
                {saving ? <Spinner /> : 'Log BPM'}
              </button>
              <button className="btn" onClick={openMetronome}>
                Practice with metronome
              </button>
            </div>
          </div>
        ) : (
          <div className="quick-actions">
            <div className="timer-inline">
              <span className="timer-inline__value">{formatDuration(elapsed)}</span>
              <span className="muted">practicing…</span>
            </div>
            <button
              className="btn btn--primary btn--block"
              onClick={completePractice}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Mark practice complete'}
            </button>
          </div>
        )}

        {savedMsg && <p className="notice notice--ok">{savedMsg}</p>}
        {progress?.totalPracticeTimeSeconds > 0 && (
          <p className="muted center-text">
            Total logged: {formatDuration(progress.totalPracticeTimeSeconds)}
          </p>
        )}
      </section>

      {rudiment.practiceNotes && (
        <section className="card">
          <h2 className="section-title">Practice notes</h2>
          <p>{rudiment.practiceNotes}</p>
        </section>
      )}

      {rudiment.commonUses && (
        <section className="card">
          <h2 className="section-title">Common uses</h2>
          <p>{rudiment.commonUses}</p>
        </section>
      )}

      <section>
        <h2 className="section-title">Video lesson</h2>
        <YouTubeEmbed url={rudiment.videoUrl} title={rudiment.name} />
      </section>

      <RelatedList
        title="Related grooves"
        items={groovesForRudiment(rudiment.id).map((g) => ({
          route: `/grooves/${g.id}`,
          name: g.name,
          subtitle: `${g.style} · ${g.bpm} BPM`
        }))}
      />
      <RelatedList
        title="Related warmups"
        items={warmupsForRudiment(rudiment.id).map((w) => ({
          route: `/warmups/${w.id}`,
          name: w.name,
          subtitle: `${w.category} · ${w.durationMinutes} min`
        }))}
      />
      <RelatedList
        title="Related plans"
        items={plansForRudiment(rudiment.id).map((p) => ({
          route: `/plans/${p.id}`,
          name: p.name,
          subtitle: `${p.level} · ${p.durationLabel}`
        }))}
      />
    </div>
  )
}
