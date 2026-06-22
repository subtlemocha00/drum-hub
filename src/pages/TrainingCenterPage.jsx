import { Link } from 'react-router-dom'

import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

// The one shipping tool, plus placeholders for tools planned in later phases.
const ACTIVE_TOOLS = [
  {
    to: '/training/subdivisions',
    icon: '𝅘𝅥𝅮',
    name: 'Subdivision Trainer',
    desc: 'Lock in your internal clock across quarter, eighth, triplet, and sixteenth feels.'
  }
]

const COMING_SOON = [
  { icon: '🏁', name: 'Tempo Challenge', desc: 'Push your top clean tempo.' },
  { icon: '✋', name: 'Stick Control Trainer', desc: 'Sticking patterns and consistency.' },
  { icon: '🥁', name: 'Practice Pad Mode', desc: 'Focused pad routines.' },
  { icon: '🧠', name: 'Independence Trainer', desc: 'Limb independence drills.' },
  { icon: '🔀', name: 'Polyrhythm Trainer', desc: 'Layered rhythmic ratios.' },
  { icon: '📖', name: 'Reading Drills', desc: 'Sight-read rhythmic notation.' }
]

/** Phase 5A: the Training Center hub — the home for all training tools. */
export function TrainingCenterPage() {
  useDocumentTitle('Training Center')

  return (
    <div className="page">
      <header className="page__head">
        <h1 className="page__title">Training Center</h1>
        <p className="muted">Focused tools to sharpen specific skills.</p>
      </header>

      <section>
        <h2 className="section-title">Available now</h2>
        <ul className="card-list">
          {ACTIVE_TOOLS.map((tool) => (
            <li key={tool.to}>
              <Link to={tool.to} className="card tool-card">
                <span className="tool-card__icon" aria-hidden="true">{tool.icon}</span>
                <div className="list-card__main">
                  <span className="list-card__title">{tool.name}</span>
                  <span className="muted">{tool.desc}</span>
                </div>
                <span className="suggest-card__cta">Open ›</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="recent">
        <h2 className="section-title">Coming soon</h2>
        <ul className="tool-grid">
          {COMING_SOON.map((tool) => (
            <li key={tool.name} className="card tool-card tool-card--soon" aria-disabled="true">
              <span className="tool-card__icon" aria-hidden="true">{tool.icon}</span>
              <div className="list-card__main">
                <span className="list-card__title">{tool.name}</span>
                <span className="muted">{tool.desc}</span>
              </div>
              <span className="badge badge--soon">Soon</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
