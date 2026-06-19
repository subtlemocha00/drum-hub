import { useState } from 'react'

import { useAuth } from '../features/auth/useAuth.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { formatDateTime } from '../lib/format.js'

/** Account settings (Phase 1): profile summary + sign out. */
export function SettingsPage() {
  useDocumentTitle('Settings')
  const { user, logout } = useAuth()
  const [busy, setBusy] = useState(false)

  const created = user?.metadata?.creationTime
    ? formatDateTime(new Date(user.metadata.creationTime))
    : '—'

  const handleLogout = async () => {
    setBusy(true)
    try {
      await logout()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page">
      <header className="page__head">
        <h1 className="page__title">Settings</h1>
      </header>

      <section className="card profile">
        <h2 className="section-title">Profile</h2>
        <dl className="profile__list">
          <div>
            <dt>Name</dt>
            <dd>{user?.displayName || '—'}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{user?.email || '—'}</dd>
          </div>
          <div>
            <dt>Member since</dt>
            <dd>{created}</dd>
          </div>
        </dl>
      </section>

      <button
        className="btn btn--stop btn--block"
        onClick={handleLogout}
        disabled={busy}
      >
        {busy ? 'Signing out…' : 'Sign out'}
      </button>
    </div>
  )
}
