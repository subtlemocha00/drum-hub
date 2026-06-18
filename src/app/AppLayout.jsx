import { Link, Outlet, useLocation } from 'react-router-dom'

import { NavBar } from '../components/NavBar.jsx'
import { SessionRecoveryPrompt } from '../components/SessionRecoveryPrompt.jsx'
import { useSession } from '../features/sessions/useSession.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { formatDuration } from '../lib/format.js'

const TITLES = {
  '/dashboard': 'Home',
  '/metronome': 'Metronome',
  '/session': 'Session',
  '/settings': 'Settings'
}

/**
 * Shared application shell for authenticated routes: a top header, the routed
 * page content, and the primary navigation. Also hosts the global session
 * recovery prompt and an active-session banner that follows the user around.
 */
export function AppLayout() {
  const { isActive, isRecovered, elapsedSeconds } = useSession()
  const { pathname } = useLocation()
  useDocumentTitle(TITLES[pathname])

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/dashboard" className="app-header__brand">
          <span className="app-header__logo" aria-hidden="true">◉</span>
          Drum&nbsp;Hub
        </Link>
      </header>

      {isActive && !isRecovered && (
        <Link to="/session" className="active-banner">
          <span className="active-banner__pulse" aria-hidden="true" />
          Session in progress — {formatDuration(elapsedSeconds)}
        </Link>
      )}

      <main className="app-main">
        <Outlet />
      </main>

      <NavBar />
      <SessionRecoveryPrompt />
    </div>
  )
}
