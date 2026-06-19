/**
 * User profile + onboarding. The onboarding answers are merged into the user's
 * profile document `users/{uid}` (which already holds displayName/email/createdAt
 * from sign-up), so reading the profile is a single document read.
 *
 * Fields added by onboarding: experienceLevel, primaryGoal, practiceFrequency,
 * onboardedAt.
 */
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'

import { db } from '../../lib/firebase/firebase.js'

export async function getProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  const d = snap.data()
  return {
    displayName: d.displayName ?? '',
    email: d.email ?? '',
    experienceLevel: d.experienceLevel ?? null,
    primaryGoal: d.primaryGoal ?? null,
    practiceFrequency: d.practiceFrequency ?? null,
    onboardedAt: d.onboardedAt?.toDate?.() ?? null
  }
}

export async function saveOnboarding(uid, { experienceLevel, primaryGoal, practiceFrequency }) {
  await setDoc(
    doc(db, 'users', uid),
    { experienceLevel, primaryGoal, practiceFrequency, onboardedAt: serverTimestamp() },
    { merge: true }
  )
}
