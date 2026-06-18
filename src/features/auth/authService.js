/**
 * Auth service — thin wrapper around Firebase Auth + the `users/{uid}` profile
 * document. Keeping these calls in one place keeps React components clean and
 * makes the auth surface easy to evolve later.
 */
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'

import { auth, db, googleProvider } from '../../lib/firebase/firebase.js'

/** Guard so auth actions fail with a clear message when Firebase is unconfigured. */
function requireAuth() {
  if (!auth) {
    throw new Error(
      'Firebase is not configured. Add your credentials to .env to enable sign-in.'
    )
  }
}

/**
 * Create the user's Firestore profile document if it does not already exist.
 * Stored at `users/{uid}` with displayName, email and createdAt.
 */
export async function ensureUserProfile(user) {
  if (!user) return
  const ref = doc(db, 'users', user.uid)
  const snapshot = await getDoc(ref)
  if (snapshot.exists()) return

  await setDoc(ref, {
    displayName: user.displayName || '',
    email: user.email || '',
    createdAt: serverTimestamp()
  })
}

export async function signInWithGoogle() {
  requireAuth()
  const { user } = await signInWithPopup(auth, googleProvider)
  await ensureUserProfile(user)
  return user
}

export async function signInWithEmail(email, password) {
  requireAuth()
  const { user } = await signInWithEmailAndPassword(auth, email, password)
  await ensureUserProfile(user)
  return user
}

export async function registerWithEmail(email, password, displayName) {
  requireAuth()
  const { user } = await createUserWithEmailAndPassword(auth, email, password)
  if (displayName) {
    await updateProfile(user, { displayName })
  }
  await ensureUserProfile(user)
  return user
}

export function logout() {
  return signOut(auth)
}
