import { NavLink, useLocation } from 'react-router-dom'

import { useSession } from '../features/sessions/useSession.js'

// `match` lists path prefixes that should light up a tab (so library detail
// pages keep the Library tab active).
const LINKS = [
  { to: '/dashboard', label: 'Home', icon: '◎', match: ['/dashboard'] },
  {
    to: '/library',
    label: 'Library',
    icon: '▤',
    match: ['/library', '/rudiments', '/grooves', '/warmups', '/favorites']
  },
  { to: '/metronome', label: 'Metronome', icon: '𝅘𝅥', match: ['/metronome'] },
  { to: '/session', label: 'Session', icon: '⏱', match: ['/session'] },
  { to: '/settings', label: 'Settings', icon: '⚙', match: ['/settings'] }
]

/**
 * Primary navigation. Renders as a bottom tab bar on mobile and a top bar on
 * wider screens (see global.css). A dot marks the Session tab while a practice
 * session is running.
 */
export function NavBar() {
  const { isActive } = useSession()
  const { pathname } = useLocation()

  const isLinkActive = (link) =>
    link.match.some((p) => pathname === p || pathname.startsWith(p + '/'))

  return (
    <nav className="navbar" aria-label="Primary">
      <ul className="navbar__list">
        {LINKS.map((link) => {
          const active = isLinkActive(link)
          return (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={'navbar__link' + (active ? ' navbar__link--active' : '')}
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
          )
        })}
      </ul>
    </nav>
  )
}
