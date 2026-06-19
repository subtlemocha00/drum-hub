/**
 * Groove catalog persistence — `users/{uid}/grooves/{id}`, seeded on first use.
 * Style filtering is done client-side (the catalog is small), so no Firestore
 * composite indexes are required.
 */
import { doc, getDoc } from 'firebase/firestore'

import { db } from '../../lib/firebase/firebase.js'
import { loadOrSeedCatalog } from '../../lib/firebase/seed.js'
import { GROOVES } from './grooveData.js'

export function getGrooves(uid) {
  return loadOrSeedCatalog(uid, 'grooves', GROOVES)
}

export async function getGroove(uid, id) {
  const ref = doc(db, 'users', uid, 'grooves', id)
  const snap = await getDoc(ref)
  if (snap.exists()) return { id: snap.id, ...snap.data() }

  await loadOrSeedCatalog(uid, 'grooves', GROOVES)
  const retry = await getDoc(ref)
  return retry.exists() ? { id: retry.id, ...retry.data() } : null
}
