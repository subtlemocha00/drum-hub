import { Link } from 'react-router-dom'

import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

const SECTIONS = [
  { to: '/statistics', icon: '📊', title: 'Statistics', desc: 'Practice time, sessions, streaks, and rudiment stats.' },
  { to: '/plans', icon: '🗺️', title: 'Practice Plans', desc: 'Structured multi-week training routines.' },
  { to: '/skill-tree', icon: '🌱', title: 'Skill Tree', desc: 'See what to learn next as you progress.' },
  { to: '/goals', icon: '🎯', title: 'Goals', desc: 'Set targets and track progress toward them.' },
  { to: '/practice-logs', icon: '📓', title: 'Practice Logs', desc: 'Notes from your past sessions.' }
]

/** Hub linking to the Phase 3 progression features. */
export function ProgressPage() {
  useDocumentTitle('Progress')
  return (
    <div className="page">
      <header className="page__head">
        <h1 className="page__title">Progress</h1>
        <p className="muted">Track improvement and plan what’s next.</p>
      </header>

      <div className="hub-grid">
        {SECTIONS.map((s) => (
          <Link key={s.to} to={s.to} className="card hub-card">
            <span className="hub-card__icon" aria-hidden="true">{s.icon}</span>
            <span className="hub-card__title">{s.title}</span>
            <span className="hub-card__desc muted">{s.desc}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
