import { NavLink } from 'react-router-dom'

import { useSession } from '../features/sessions/useSession.js'

const LINKS = [
  { to: '/dashboard', label: 'Home', icon: '◎' },
  { to: '/metronome', label: 'Metronome', icon: '𝅘𝅥' },
  { to: '/session', label: 'Session', icon: '⏱' },
  { to: '/settings', label: 'Settings', icon: '⚙' }
]

/**
 * Primary navigation. Renders as a bottom tab bar on mobile and a top bar on
 * wider screens (see global.css). A dot marks the Session tab while a practice
 * session is running.
 */
export function NavBar() {
  const { isActive } = useSession()

  return (
    <nav className="navbar" aria-label="Primary">
      <ul className="navbar__list">
        {LINKS.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive: active }) =>
                'navbar__link' + (active ? ' navbar__link--active' : '')
              }
            >
              <span className="navbar__icon" aria-hidden="true">
                {link.icon}
                {link.to === '/session' && isActive && (
                  <span className="navbar__dot" aria-hidden="true" />
                )}
              </span>
              <span className="navbar__label">{link.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
