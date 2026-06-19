/**
 * Personal goals — `users/{uid}/goals/{id}`.
 * Progress is entered manually (no automatic evaluation), matching the app's
 * explicit, user-driven philosophy.
 */
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc
} from 'firebase/firestore'

import { db } from '../../lib/firebase/firebase.js'

// Goal "types" mainly drive the unit label shown in the UI.
export const GOAL_TYPES = [
  { value: 'minutes', label: 'Minutes', unit: 'min' },
  { value: 'bpm', label: 'Tempo (BPM)', unit: 'BPM' },
  { value: 'days', label: 'Days', unit: 'days' },
  { value: 'tasks', label: 'Count', unit: '' }
]

export function goalUnit(type) {
  return GOAL_TYPES.find((t) => t.value === type)?.unit ?? ''
}

function goalsCollection(uid) {
  return collection(db, 'users', uid, 'goals')
}

export async function createGoal(uid, { title, type, targetValue }) {
  const ref = await addDoc(goalsCollection(uid), {
    title: title.trim(),
    type,
    targetValue: Number(targetValue) || 0,
    currentValue: 0,
    completed: false,
    createdAt: serverTimestamp()
  })
  return ref.id
}

function mapGoal(docSnap) {
  const data = docSnap.data()
  return {
    id: docSnap.id,
    title: data.title ?? '',
    type: data.type ?? 'tasks',
    targetValue: data.targetValue ?? 0,
    currentValue: data.currentValue ?? 0,
    completed: data.completed ?? false,
    createdAt: data.createdAt?.toDate?.() ?? null
  }
}

export async function getGoals(uid) {
  const snapshot = await getDocs(query(goalsCollection(uid), orderBy('createdAt', 'desc')))
  return snapshot.docs.map(mapGoal)
}

export async function updateGoalProgress(uid, goalId, currentValue) {
  await setDoc(
    doc(goalsCollection(uid), goalId),
    { currentValue: Number(currentValue) || 0 },
    { merge: true }
  )
}

export async function setGoalCompleted(uid, goalId, completed) {
  await setDoc(doc(goalsCollection(uid), goalId), { completed }, { merge: true })
}

export async function deleteGoal(uid, goalId) {
  await deleteDoc(doc(goalsCollection(uid), goalId))
}
