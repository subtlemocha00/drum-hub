/**
 * Practice plan progress — `users/{uid}/practicePlans/{planId}`.
 *
 * Stored per plan: { active, startedAt, completedTasks: { [taskId]: true } }.
 * Only one plan is active at a time. Plan definitions themselves are static
 * (planData) — Firestore only holds the user's progress.
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  writeBatch
} from 'firebase/firestore'

import { db } from '../../lib/firebase/firebase.js'

function plansCollection(uid) {
  return collection(db, 'users', uid, 'practicePlans')
}

function mapProgress(id, data) {
  return {
    id,
    active: data.active ?? false,
    startedAt: data.startedAt?.toDate?.() ?? null,
    completedTasks: data.completedTasks ?? {}
  }
}

export async function getPlanProgress(uid, planId) {
  const snap = await getDoc(doc(plansCollection(uid), planId))
  return snap.exists() ? mapProgress(snap.id, snap.data()) : null
}

/** Progress for every plan the user has touched, keyed by planId. */
export async function getAllPlanProgress(uid) {
  const snapshot = await getDocs(plansCollection(uid))
  const byId = {}
  snapshot.docs.forEach((d) => {
    byId[d.id] = mapProgress(d.id, d.data())
  })
  return byId
}

export async function getActivePlanProgress(uid) {
  const all = await getAllPlanProgress(uid)
  return Object.values(all).find((p) => p.active) ?? null
}

/**
 * Make a plan the active one (deactivating any other). Preserves existing
 * completed tasks if the plan was started before.
 */
export async function startPlan(uid, planId) {
  const snapshot = await getDocs(plansCollection(uid))
  const batch = writeBatch(db)

  // Deactivate every other plan.
  snapshot.docs.forEach((d) => {
    if (d.id !== planId && d.data().active) {
      batch.set(d.ref, { active: false }, { merge: true })
    }
  })

  const existing = snapshot.docs.find((d) => d.id === planId)
  const ref = doc(plansCollection(uid), planId)
  batch.set(
    ref,
    {
      active: true,
      startedAt: existing?.data().startedAt ?? serverTimestamp()
    },
    { merge: true }
  )
  await batch.commit()
  return getPlanProgress(uid, planId)
}

export async function setPlanActive(uid, planId, active) {
  await setDoc(doc(plansCollection(uid), planId), { active }, { merge: true })
}

/** Mark a single task done/undone. */
export async function toggleTask(uid, planId, taskId, done) {
  await setDoc(
    doc(plansCollection(uid), planId),
    { completedTasks: { [taskId]: done } },
    { merge: true }
  )
}
