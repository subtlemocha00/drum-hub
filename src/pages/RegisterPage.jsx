import { useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../features/auth/useAuth.js'
import { isFirebaseConfigured } from '../lib/firebase/firebase.js'
import { Spinner } from '../components/Loader.jsx'
import { GoogleButton } from '../components/GoogleButton.jsx'

/** Create an account with email/password (or Google). */
export function RegisterPage() {
  const { registerWithEmail, signInWithGoogle } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const run = async (action) => {
    setError('')
    setBusy(true)
    try {
      await action()
    } catch (err) {
      setError(err?.message ?? 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    run(() => registerWithEmail(email, password, displayName))
  }

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-card__head">
          <span className="auth-card__logo" aria-hidden="true">◉</span>
          <h1>Create your account</h1>
          <p className="muted">Your practice data syncs across devices.</p>
        </div>

        {!isFirebaseConfigured && (
          <p className="notice notice--warn">
            Firebase isn’t configured yet. Add your project credentials to{' '}
            <code>.env</code> to enable sign-up.
          </p>
        )}

        <GoogleButton
          disabled={busy}
          onClick={() => run(signInWithGoogle)}
          label="Sign up with Google"
        />

        <div className="divider"><span>or</span></div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Name</span>
            <input
              type="text"
              autoComplete="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error && <p className="notice notice--error">{error}</p>}

          <button className="btn btn--primary btn--block" disabled={busy}>
            {busy ? <Spinner /> : 'Create account'}
          </button>
        </form>

        <p className="auth-switch muted">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
