import { useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../features/auth/useAuth.js'
import { isFirebaseConfigured } from '../lib/firebase/firebase.js'
import { Spinner } from '../components/Loader.jsx'
import { GoogleButton } from '../components/GoogleButton.jsx'

/** Email/password + Google sign-in. Routing redirects on successful auth. */
export function LoginPage() {
  const { signInWithEmail, signInWithGoogle } = useAuth()
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
    run(() => signInWithEmail(email, password))
  }

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-card__head">
          <span className="auth-card__logo" aria-hidden="true">◉</span>
          <h1>Drum Hub</h1>
          <p className="muted">Sign in to start practicing.</p>
        </div>

        {!isFirebaseConfigured && (
          <p className="notice notice--warn">
            Firebase isn’t configured yet. Add your project credentials to{' '}
            <code>.env</code> to enable sign-in.
          </p>
        )}

        <GoogleButton
          disabled={busy}
          onClick={() => run(signInWithGoogle)}
          label="Continue with Google"
        />

        <div className="divider"><span>or</span></div>

        <form className="auth-form" onSubmit={handleSubmit}>
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
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error && <p className="notice notice--error">{error}</p>}

          <button className="btn btn--primary btn--block" disabled={busy}>
            {busy ? <Spinner /> : 'Sign in'}
          </button>
        </form>

        <p className="auth-switch muted">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  )
}
