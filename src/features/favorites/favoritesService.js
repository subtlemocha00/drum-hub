/**
 * Cross-entity favorites — `users/{uid}/favorites/{itemId}`.
 *
 * A favorite stores its `type` (rudiment | groove | warmup) and `refId` (the
 * referenced item's id), plus a denormalized `name`/`subtitle` so the Favorites
 * page can render without re-fetching every catalog. The doc id is
 * `{type}_{refId}` to keep one favorite per item and make toggling cheap.
 */
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc
} from 'firebase/firestore'

import { db } from '../../lib/firebase/firebase.js'

export const FAVORITE_TYPES = ['rudiment', 'groove', 'warmup']

export function favoriteId(type, refId) {
  return `${type}_${refId}`
}

export async function addFavorite(uid, { type, refId, name = '', subtitle = '' }) {
  const ref = doc(db, 'users', uid, 'favorites', favoriteId(type, refId))
  await setDoc(ref, { type, refId, name, subtitle, createdAt: serverTimestamp() })
}

export async function removeFavorite(uid, type, refId) {
  await deleteDoc(doc(db, 'users', uid, 'favorites', favoriteId(type, refId)))
}

export async function getFavorites(uid) {
  const snapshot = await getDocs(collection(db, 'users', uid, 'favorites'))
  return snapshot.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      type: data.type,
      refId: data.refId,
      name: data.name ?? '',
      subtitle: data.subtitle ?? '',
      createdAt: data.createdAt?.toDate?.() ?? null
    }
  })
}
