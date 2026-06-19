/**
 * Groove access. The catalog is static content (src/data/grooves) — no
 * Firestore. Favorites (stored elsewhere) reference grooves by id.
 */
import { GROOVES, getGrooveById } from '../../data/grooves/index.js'

export async function getGrooves() {
  return GROOVES
}

export async function getGroove(uid, id) {
  return getGrooveById(id)
}
