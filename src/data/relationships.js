/**
 * Derived content relationships — pure functions over the static catalogs, so
 * detail pages can cross-link without storing bidirectional references.
 */
import { getRudimentById } from './rudiments/index.js'
import { GROOVES } from './grooves/index.js'
import { WARMUPS } from './warmups/index.js'
import { PLANS } from './practicePlans/index.js'

function plansReferencing(type, id) {
  return PLANS.filter((plan) =>
    plan.weeks.some((w) =>
      w.days.some((d) => d.tasks.some((t) => t.ref && t.ref.type === type && t.ref.id === id))
    )
  )
}

// ---- For a rudiment ----
export function groovesForRudiment(rudimentId) {
  return GROOVES.filter((g) => g.relatedRudiments?.includes(rudimentId))
}
export function warmupsForRudiment(rudimentId) {
  return WARMUPS.filter((w) => w.relatedRudiments?.includes(rudimentId))
}
export function plansForRudiment(rudimentId) {
  return plansReferencing('rudiment', rudimentId)
}

// ---- For a groove ----
export function rudimentsForGroove(groove) {
  return (groove?.relatedRudiments || []).map(getRudimentById).filter(Boolean)
}
export function warmupsForGroove(groove) {
  const rids = new Set(groove?.relatedRudiments || [])
  return WARMUPS.filter((w) => (w.relatedRudiments || []).some((r) => rids.has(r))).slice(0, 3)
}
export function plansForGroove(grooveId) {
  return plansReferencing('groove', grooveId)
}

// ---- For a warmup ----
export function rudimentsForWarmup(warmup) {
  return (warmup?.relatedRudiments || []).map(getRudimentById).filter(Boolean)
}
export function plansForWarmup(warmupId) {
  return plansReferencing('warmup', warmupId)
}
