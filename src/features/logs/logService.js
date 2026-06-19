/**
 * Practice logs — `users/{uid}/practiceLogs/{id}`.
 *
 * A short note the user writes after a session: what they worked on. Listed
 * newest first and loaded in pages (no need to pull the whole history at once).
 */
import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter
} from 'firebase/firestore'

import { db } from '../../lib/firebase/firebase.js'

function logsCollection(uid) {
  return collection(db, 'users', uid, 'practiceLogs')
}

export async function saveLog(uid, { sessionId = null, notes = '', practicedItems = [], durationSeconds = 0 }) {
  const ref = await addDoc(logsCollection(uid), {
    sessionId,
    notes: notes.trim(),
    practicedItems,
    durationSeconds,
    createdAt: serverTimestamp()
  })
  return ref.id
}

function mapLog(docSnap) {
  const data = docSnap.data()
  return {
    id: docSnap.id,
    sessionId: data.sessionId ?? null,
    notes: data.notes ?? '',
    practicedItems: data.practicedItems ?? [],
    durationSeconds: data.durationSeconds ?? 0,
    createdAt: data.createdAt?.toDate?.() ?? null
  }
}

/**
 * Page through logs, newest first.
 * @param {object} opts
 * @param {number} opts.pageSize
 * @param {import('firebase/firestore').QueryDocumentSnapshot|null} opts.cursor
 * @returns {Promise<{ logs, cursor, hasMore }>}
 */
export async function getLogs(uid, { pageSize = 10, cursor = null } = {}) {
  const constraints = [orderBy('createdAt', 'desc')]
  if (cursor) constraints.push(startAfter(cursor))
  constraints.push(limit(pageSize))

  const snapshot = await getDocs(query(logsCollection(uid), ...constraints))
  const docs = snapshot.docs
  return {
    logs: docs.map(mapLog),
    cursor: docs.length ? docs[docs.length - 1] : null,
    hasMore: docs.length === pageSize
  }
}

/** The single most recent log (for the dashboard's recent activity). */
export async function getLastLog(uid) {
  const snapshot = await getDocs(
    query(logsCollection(uid), orderBy('createdAt', 'desc'), limit(1))
  )
  return snapshot.docs.length ? mapLog(snapshot.docs[0]) : null
}
