/**
 * Subdivision Trainer progress — `users/{uid}/trainingProgress/subdivisions`.
 *
 * Intentionally a single document holding minimal, last-session state plus
 * lifetime totals. One read on the trainer/dashboard, one write per finished
 * session: no queries, no index, and it powers the "continue trainer" card.
 */
import { doc, getDoc, increment, serverTimestamp, setDoc } from 'firebase/firestore'

import { db } from '../../lib/firebase/firebase.js'

function subdivisionDoc(uid) {
  return doc(db, 'users', uid, 'trainingProgress', 'subdivisions')
}

export async function getSubdivisionProgress(uid) {
  const snap = await getDoc(subdivisionDoc(uid))
  if (!snap.exists()) return null
  const d = snap.data()
  return {
    lastMode: d.lastMode ?? null,
    lastSubdivision: d.lastSubdivision ?? null,
    totalSessions: d.totalSessions ?? 0,
    totalTimeSeconds: d.totalTimeSeconds ?? 0,
    updatedAt: d.updatedAt?.toDate?.() ?? null
  }
}

/**
 * Record one finished trainer session. `totalSessions`/`totalTimeSeconds` are
 * accumulated atomically with `increment()` so concurrent writes never clobber
 * the running totals.
 */
export async function recordSubdivisionSession(uid, { mode, subdivision, durationSeconds }) {
  await setDoc(
    subdivisionDoc(uid),
    {
      lastMode: mode,
      lastSubdivision: subdivision,
      totalSessions: increment(1),
      totalTimeSeconds: increment(Math.max(0, Math.round(durationSeconds))),
      updatedAt: serverTimestamp()
    },
    { merge: true }
  )
}
