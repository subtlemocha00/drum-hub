import { collection, getDocs, writeBatch, doc } from 'firebase/firestore'

import { db } from './firebase.js'

/**
 * Load a per-user catalog collection, seeding it with default content the first
 * time it's accessed. The library content (rudiments, grooves, warmups) lives
 * under `users/{uid}/...` per the data architecture, so each account gets its
 * own copy of the starter catalog on first use.
 *
 * Seeding is idempotent: it only runs when the collection is empty, and items
 * are written with stable ids so progress/favorites can reference them.
 *
 * @param {string} uid
 * @param {string} collectionName  e.g. 'rudiments'
 * @param {Array<{ id: string }>} defaults  items to seed (each needs an `id`)
 * @returns {Promise<Array>} the catalog items (id + data)
 */
export async function loadOrSeedCatalog(uid, collectionName, defaults) {
  const col = collection(db, 'users', uid, collectionName)
  const snapshot = await getDocs(col)

  if (snapshot.empty) {
    const batch = writeBatch(db)
    defaults.forEach(({ id, ...data }) => {
      batch.set(doc(col, id), data)
    })
    await batch.commit()
    return defaults.map((item) => ({ ...item }))
  }

  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}
