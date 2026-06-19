/**
 * Warmup catalog persistence — `users/{uid}/warmups/{id}`, seeded on first use.
 */
import { doc, getDoc } from 'firebase/firestore'

import { db } from '../../lib/firebase/firebase.js'
import { loadOrSeedCatalog } from '../../lib/firebase/seed.js'
import { WARMUPS } from './warmupData.js'

export function getWarmups(uid) {
  return loadOrSeedCatalog(uid, 'warmups', WARMUPS)
}

export async function getWarmup(uid, id) {
  const ref = doc(db, 'users', uid, 'warmups', id)
  const snap = await getDoc(ref)
  if (snap.exists()) return { id: snap.id, ...snap.data() }

  await loadOrSeedCatalog(uid, 'warmups', WARMUPS)
  const retry = await getDoc(ref)
  return retry.exists() ? { id: retry.id, ...retry.data() } : null
}
