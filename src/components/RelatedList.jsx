import { Link } from 'react-router-dom'

/**
 * A titled list of cross-links to related content. `items` are
 * { route, name, subtitle }. Renders nothing when empty.
 */
export function RelatedList({ title, items }) {
  if (!items || items.length === 0) return null
  return (
    <section>
      <h2 className="section-title">{title}</h2>
      <ul className="card-list">
        {items.map((it) => (
          <li key={it.route}>
            <Link to={it.route} className="card list-card">
              <div className="list-card__main">
                <span className="list-card__title">{it.name}</span>
                {it.subtitle && <span className="muted">{it.subtitle}</span>}
              </div>
              <span className="muted">›</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
