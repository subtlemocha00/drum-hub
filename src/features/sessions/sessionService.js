/**
 * Practice session persistence.
 *
 * Sessions live in Firestore at `users/{uid}/practiceSessions/{sessionId}` with
 * the minimal Phase 1 shape: startTime, endTime, durationSeconds. The active
 * (in-progress) session is tracked client-side; only completed sessions are
 * written to Firestore.
 */
import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'

import { db } from '../../lib/firebase/firebase.js'

function sessionsCollection(uid) {
  return collection(db, 'users', uid, 'practiceSessions')
}

/**
 * Persist a completed practice session.
 * @param {string} uid
 * @param {{ startTime: number, endTime: number, durationSeconds: number }} session
 *        startTime / endTime are epoch milliseconds.
 */
export async function saveSession(uid, { startTime, endTime, durationSeconds }) {
  const ref = await addDoc(sessionsCollection(uid), {
    startTime: Timestamp.fromMillis(startTime),
    endTime: Timestamp.fromMillis(endTime),
    durationSeconds,
    createdAt: serverTimestamp()
  })
  return ref.id
}

function mapSession(docSnap) {
  const data = docSnap.data()
  return {
    id: docSnap.id,
    startTime: data.startTime?.toDate?.() ?? null,
    endTime: data.endTime?.toDate?.() ?? null,
    durationSeconds: data.durationSeconds ?? 0
  }
}

/**
 * Load the most recent completed sessions, newest first.
 * @returns {Promise<Array<{ id, startTime: Date|null, endTime: Date|null, durationSeconds: number }>>}
 */
export async function getRecentSessions(uid, count = 5) {
  const q = query(sessionsCollection(uid), orderBy('startTime', 'desc'), limit(count))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(mapSession)
}

/**
 * Load all completed sessions (newest first) for statistics. Practice-session
 * volume per user is modest, so a single read is acceptable here; if it ever
 * grows we can switch to date-bounded queries.
 */
export async function getAllSessions(uid) {
  const q = query(sessionsCollection(uid), orderBy('startTime', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(mapSession)
}
