/**
 * Warmup access. The catalog is static content (src/data/warmups) — no
 * Firestore.
 */
import { WARMUPS, getWarmupById } from '../../data/warmups/index.js'

export async function getWarmups() {
  return WARMUPS
}

export async function getWarmup(uid, id) {
  return getWarmupById(id)
}
