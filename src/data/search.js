/**
 * Global content search across rudiments, grooves, warmups, and practice plans.
 * Pure client-side over static catalogs — fast and free of Firestore reads.
 */
import { RUDIMENTS } from './rudiments/index.js'
import { GROOVES } from './grooves/index.js'
import { WARMUPS } from './warmups/index.js'
import { PLANS } from './practicePlans/index.js'

export function searchContent(query) {
  const term = query.trim().toLowerCase()
  if (!term) return []

  const results = []
  const add = (type, route, items, subtitleFn) => {
    for (const it of items) {
      const name = it.name || ''
      const subtitle = subtitleFn(it)
      if (
        name.toLowerCase().includes(term) ||
        subtitle.toLowerCase().includes(term)
      ) {
        results.push({ type, id: it.id, name, subtitle, route: `${route}/${it.id}` })
      }
    }
  }

  add('Rudiment', '/rudiments', RUDIMENTS, (r) => `${r.category} · ${r.difficulty}`)
  add('Groove', '/grooves', GROOVES, (g) => `${g.style} · ${g.bpm} BPM · ${g.timeSignature}`)
  add('Warmup', '/warmups', WARMUPS, (w) => `${w.category} · ${w.durationMinutes} min`)
  add('Plan', '/plans', PLANS, (p) => `${p.level} · ${p.durationLabel}`)

  return results
}
