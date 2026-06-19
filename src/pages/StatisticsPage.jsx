import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../features/auth/useAuth.js'
import { getAllSessions } from '../features/sessions/sessionService.js'
import {
  computeStreaks,
  monthlyBuckets,
  sessionStats,
  timeTotals,
  weeklyBuckets
} from '../features/sessions/stats.js'
import { getRudiments, getAllRudimentProgress } from '../features/rudiments/rudimentService.js'
import { recentlyPracticed } from '../features/rudiments/rudimentStats.js'
import { BarChart } from '../components/BarChart.jsx'
import { Spinner } from '../components/Loader.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { formatHm } from '../lib/format.js'

function StatCard({ value, label }) {
  return (
    <div className="card stat">
      <span className="stat__value">{value}</span>
      <span className="stat__label">{label}</span>
    </div>
  )
}

/** Practice statistics: time, sessions, streaks, rudiments, and charts. */
export function StatisticsPage() {
  useDocumentTitle('Statistics')
  const { user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [rudiments, setRudiments] = useState([])
  const [progressById, setProgressById] = useState({})
  const [loading, setLoading] = useState(true)
  const [chartMode, setChartMode] = useState('week')

  useEffect(() => {
    if (!user) return
    let cancelled = false
    setLoading(true)
    Promise.allSettled([
      getAllSessions(user.uid),
      getRudiments(user.uid),
      getAllRudimentProgress(user.uid)
    ]).then(([s, r, p]) => {
      if (cancelled) return
      if (s.status === 'fulfilled') setSessions(s.value)
      if (r.status === 'fulfilled') setRudiments(r.value)
      if (p.status === 'fulfilled') setProgressById(p.value)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [user])

  const totals = useMemo(() => timeTotals(sessions), [sessions])
  const sStats = useMemo(() => sessionStats(sessions), [sessions])
  const streaks = useMemo(() => computeStreaks(sessions), [sessions])
  const chartData = useMemo(() => {
    const buckets = chartMode === 'week' ? weeklyBuckets(sessions, 8) : monthlyBuckets(sessions, 6)
    return buckets.map((b) => ({ label: b.label, value: b.seconds }))
  }, [sessions, chartMode])

  const rudimentStats = useMemo(() => {
    const practicedIds = Object.keys(progressById)
    let mostPracticed = null
    let mostSeconds = -1
    let highestBpm = 0
    for (const r of rudiments) {
      const p = progressById[r.id]
      if (!p) continue
      if ((p.totalPracticeTimeSeconds ?? 0) > mostSeconds) {
        mostSeconds = p.totalPracticeTimeSeconds ?? 0
        mostPracticed = r
      }
      if ((p.bestBPM ?? 0) > highestBpm) highestBpm = p.bestBPM
    }
    return {
      totalPracticed: practicedIds.length,
      mostPracticed,
      highestBpm,
      recent: recentlyPracticed(rudiments, progressById, 5)
    }
  }, [rudiments, progressById])

  if (loading) return <Spinner />

  return (
    <div className="page">
      <header className="page__head">
        <h1 className="page__title">Statistics</h1>
        <p className="muted">Your practice, by the numbers.</p>
      </header>

      <section>
        <h2 className="section-title">Practice time</h2>
        <div className="stat-grid">
          <StatCard value={formatHm(totals.today)} label="Today" />
          <StatCard value={formatHm(totals.week)} label="This week" />
          <StatCard value={formatHm(totals.month)} label="This month" />
          <StatCard value={formatHm(totals.lifetime)} label="Lifetime" />
        </div>
      </section>

      <section>
        <div className="chart-head">
          <h2 className="section-title">Practice time by {chartMode}</h2>
          <div className="chips">
            <button
              className={'chip' + (chartMode === 'week' ? ' chip--active' : '')}
              onClick={() => setChartMode('week')}
            >
              Weekly
            </button>
            <button
              className={'chip' + (chartMode === 'month' ? ' chip--active' : '')}
              onClick={() => setChartMode('month')}
            >
              Monthly
            </button>
          </div>
        </div>
        <div className="card">
          <BarChart data={chartData} formatValue={formatHm} />
        </div>
      </section>

      <section>
        <h2 className="section-title">Sessions</h2>
        <div className="stat-grid">
          <StatCard value={sStats.count} label="Total sessions" />
          <StatCard value={formatHm(sStats.averageSeconds)} label="Average length" />
          <StatCard value={formatHm(sStats.longestSeconds)} label="Longest session" />
        </div>
      </section>

      <section>
        <h2 className="section-title">Streaks</h2>
        <div className="stat-row">
          <StatCard value={`${streaks.current}🔥`} label="Current streak" />
          <StatCard value={`${streaks.longest}`} label="Longest streak" />
        </div>
        <p className="muted center-text">A practice day counts at 10+ minutes.</p>
      </section>

      <section>
        <h2 className="section-title">Rudiments</h2>
        <div className="stat-row">
          <StatCard value={rudimentStats.totalPracticed} label="Rudiments practiced" />
          <StatCard value={rudimentStats.highestBpm || '—'} label="Highest BPM" />
        </div>
        {rudimentStats.mostPracticed && (
          <Link to={`/rudiments/${rudimentStats.mostPracticed.id}`} className="card list-card">
            <div className="list-card__main">
              <span className="muted">Most practiced</span>
              <span className="list-card__title">{rudimentStats.mostPracticed.name}</span>
            </div>
            <span className="muted">›</span>
          </Link>
        )}
        {rudimentStats.recent.length > 0 && (
          <>
            <h3 className="section-title" style={{ marginTop: '0.5rem' }}>
              Recently practiced
            </h3>
            <ul className="card-list">
              {rudimentStats.recent.map(({ rudiment, progress }) => (
                <li key={rudiment.id}>
                  <Link to={`/rudiments/${rudiment.id}`} className="card list-card">
                    <div className="list-card__main">
                      <span className="list-card__title">{rudiment.name}</span>
                      <span className="muted">
                        {progress.bestBPM ? `Best ${progress.bestBPM} BPM` : '—'}
                      </span>
                    </div>
                    <span className="muted">›</span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  )
}
