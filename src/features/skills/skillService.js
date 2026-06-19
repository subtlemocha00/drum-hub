/**
 * Skill tree completion — `users/{uid}/skillTree/{nodeId}`.
 * Only completed nodes are stored ({ completed: true }); locked/available is
 * derived client-side from prerequisites (see skillData.deriveStatuses).
 */
import { collection, doc, getDocs, setDoc } from 'firebase/firestore'

import { db } from '../../lib/firebase/firebase.js'

function skillCollection(uid) {
  return collection(db, 'users', uid, 'skillTree')
}

/** Set of node ids the user has marked complete. */
export async function getCompletedSkills(uid) {
  const snapshot = await getDocs(skillCollection(uid))
  const set = new Set()
  snapshot.docs.forEach((d) => {
    if (d.data().completed) set.add(d.id)
  })
  return set
}

export async function setSkillCompleted(uid, nodeId, completed) {
  await setDoc(doc(skillCollection(uid), nodeId), { completed }, { merge: true })
}
