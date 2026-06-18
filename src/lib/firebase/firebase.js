/**
 * Centralized Firebase initialization.
 *
 * Everything Firebase-related is initialized here exactly once and exported for
 * the rest of the app to consume. Feature code should import `auth` and `db`
 * from this module rather than initializing Firebase itself.
 */
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

import { firebaseConfig, isFirebaseConfigured } from './config.js'

// When Firebase isn't configured we deliberately skip initialization so the app
// still boots (showing a setup notice on the auth screens) instead of throwing
// `auth/invalid-api-key` at import time and white-screening. Once `.env` is
// filled in, real instances are created below.
let app = null
let auth = null
let db = null
let googleProvider = null

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  googleProvider = new GoogleAuthProvider()
} else {
  console.warn(
    '[Drum Hub] Firebase is not configured. Copy .env.example to .env and add ' +
      'your Firebase project credentials to enable authentication and Firestore.'
  )
}

export { app, auth, db, googleProvider, isFirebaseConfigured }
export default app
