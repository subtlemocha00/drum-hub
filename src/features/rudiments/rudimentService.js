/**
 * Rudiment catalog + progress persistence.
 *
 *   users/{uid}/rudiments/{id}          -> catalog (seeded from rudimentData)
 *   users/{uid}/rudimentProgress/{id}   -> per-rudiment progress
 *
 * Progress is explicit, user-driven logging — no automatic detection.
 */
import { doc, getDoc, getDocs, collection, serverTimestamp, setDoc } from 'firebase/firestore'

import { db } from '../../lib/firebase/firebase.js'
import { loadOrSeedCatalog } from '../../lib/firebase/seed.js'
import { RUDIMENTS } from './rudimentData.js'

/** All rudiments (seeds the catalog on first use). */
export function getRudiments(uid) {
  return loadOrSeedCatalog(uid, 'rudiments', RUDIMENTS)
}

/** A single rudiment by id, seeding the catalog if deep-linked before browsing. */
export async function getRudiment(uid, id) {
  const ref = doc(db, 'users', uid, 'rudiments', id)
  const snap = await getDoc(ref)
  if (snap.exists()) return { id: snap.id, ...snap.data() }

  await loadOrSeedCatalog(uid, 'rudiments', RUDIMENTS)
  const retry = await getDoc(ref)
  return retry.exists() ? { id: retry.id, ...retry.data() } : null
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
