import { useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'

import { auth } from '../../lib/firebase/firebase.js'
import { AuthContext } from './AuthContext.js'
import {
  logout,
  registerWithEmail,
  signInWithEmail,
  signInWithGoogle
} from './authService.js'

/**
 * Subscribes to Firebase auth state and exposes the current user plus auth
 * actions to the rest of the app. `loading` is true until the first auth state
 * resolves, which lets protected routes avoid flashing the login screen.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Without Firebase config there is no auth instance — resolve to signed-out
    // so the app renders the login screen (with its setup notice).
    if (!auth) {
      setLoading(false)
      return
    }
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      signInWithGoogle,
      signInWithEmail,
      registerWithEmail,
      logout
    }),
    [user, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
