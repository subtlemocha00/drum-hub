import { Link } from 'react-router-dom'

import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

const SECTIONS = [
  {
    to: '/rudiments',
    icon: '✋',
    title: 'Rudiments',
    desc: 'Learn and track stickings, from singles to hybrids.'
  },
  {
    to: '/grooves',
    icon: '🥁',
    title: 'Grooves',
    desc: 'Beats across rock, funk, jazz, latin, and metal.'
  },
  {
    to: '/warmups',
    icon: '🔥',
    title: 'Warmups',
    desc: 'Short routines to get your hands and feet loose.'
  },
  {
    to: '/favorites',
    icon: '★',
    title: 'Favorites',
    desc: 'Everything you’ve starred, in one place.'
  }
]

/** Hub linking to the Phase 2 library sections. */
export function LibraryPage() {
  useDocumentTitle('Library')
  return (
    <div className="page">
      <header className="page__head">
        <h1 className="page__title">Library</h1>
        <p className="muted">Your practice material and saved items.</p>
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
