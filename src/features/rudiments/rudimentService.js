/**
 * Rudiment access + progress persistence.
 *
 * The rudiment CATALOG is static content (src/data/rudiments) — no Firestore
 * reads/writes for the library itself. Only per-rudiment PROGRESS is stored:
 *
 *   users/{uid}/rudimentProgress/{id}
 *
 * Progress is explicit, user-driven logging — no automatic detection.
 */
import { doc, getDoc, getDocs, collection, serverTimestamp, setDoc } from 'firebase/firestore'

import { db } from '../../lib/firebase/firebase.js'
import { RUDIMENTS, getRudimentById } from '../../data/rudiments/index.js'

/** All rudiments (static). */
export async function getRudiments() {
  return RUDIMENTS
}

/** A single rudiment by id (static). */
export async function getRudiment(uid, id) {
  return getRudimentById(id)
}

function mapProgress(id, data) {
  return {
    id,
    currentBPM: data.currentBPM ?? null,
    bestBPM: data.bestBPM ?? null,
    targetBPM: data.targetBPM ?? null,
    totalPracticeTimeSeconds: data.totalPracticeTimeSeconds ?? 0,
    lastPracticedAt: data.lastPracticedAt?.toDate?.() ?? null
  }
}

/** Progress for a single rudiment, or null if never practiced. */
export async function getRudimentProgress(uid, id) {
  const snap = await getDoc(doc(db, 'users', uid, 'rudimentProgress', id))
  return snap.exists() ? mapProgress(snap.id, snap.data()) : null
}

/** Progress for every practiced rudiment, keyed object: { [id]: progress }. */
export async function getAllRudimentProgress(uid) {
  const snapshot = await getDocs(collection(db, 'users', uid, 'rudimentProgress'))
  const byId = {}
  snapshot.docs.forEach((d) => {
    byId[d.id] = mapProgress(d.id, d.data())
  })
  return byId
}

/**
 * Log a completed practice rep. Updates currentBPM, raises bestBPM, accumulates
 * total practice time, and stamps lastPracticedAt.
 */
export async function logRudimentPractice(uid, rudimentId, { bpm = null, practiceSeconds = 0 }) {
  const ref = doc(db, 'users', uid, 'rudimentProgress', rudimentId)
  const snap = await getDoc(ref)
  const prev = snap.exists() ? snap.data() : {}

  const update = {
    lastPracticedAt: serverTimestamp(),
    totalPracticeTimeSeconds:
      (prev.totalPracticeTimeSeconds ?? 0) + Math.max(0, Math.round(practiceSeconds))
  }
  if (bpm != null && Number(bpm) > 0) {
    update.currentBPM = Number(bpm)
    update.bestBPM = Math.max(prev.bestBPM ?? 0, Number(bpm))
  }

  await setDoc(ref, update, { merge: true })
  return getRudimentProgress(uid, rudimentId)
}

/** Set the user's target BPM goal for a rudiment. */
export async function setRudimentTarget(uid, rudimentId, targetBPM) {
  const ref = doc(db, 'users', uid, 'rudimentProgress', rudimentId)
  await setDoc(ref, { targetBPM: Number(targetBPM) || null }, { merge: true })
  return getRudimentProgress(uid, rudimentId)
}
