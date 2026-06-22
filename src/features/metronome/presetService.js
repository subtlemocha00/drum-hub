/**
 * Metronome presets — `users/{uid}/metronomePresets/{presetId}`.
 *
 * A preset stores a full metronome configuration so a user can recall a complete
 * setup (tempo, subdivision, swing, accents, gap training, random mute, tempo
 * ramp) in one tap. Reads are ordered by `createdAt` (single-field, auto-indexed)
 * so no composite index is required.
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
import { normalizeConfig } from './metronomeConfig.js'

function presetsCollection(uid) {
  return collection(db, 'users', uid, 'metronomePresets')
}

// Flatten a normalized config into the documented preset fields.
function configToFields(config) {
  const c = normalizeConfig(config)
  return {
    bpm: c.bpm,
    timeSignature: `${c.beatsPerMeasure}/4`,
    beatsPerMeasure: c.beatsPerMeasure,
    subdivision: c.subdivision,
    swing: c.swing,
    accentMode: c.accentMode,
    accentPattern: c.accentPattern,
    gapTraining: c.gapTraining,
    randomMute: c.randomMute,
    tempoRamp: c.tempoRamp
  }
}

export async function createPreset(uid, name, config) {
  const ref = await addDoc(presetsCollection(uid), {
    name: name.trim() || 'Untitled preset',
    ...configToFields(config),
    createdAt: serverTimestamp()
  })
  return ref.id
}

function mapPreset(docSnap) {
  const d = docSnap.data()
  return {
    id: docSnap.id,
    name: d.name ?? 'Untitled preset',
    createdAt: d.createdAt?.toDate?.() ?? null,
    // Rehydrate a full, normalized config from the stored fields.
    config: normalizeConfig({
      bpm: d.bpm,
      beatsPerMeasure: d.beatsPerMeasure,
      subdivision: d.subdivision,
      swing: d.swing,
      accentMode: d.accentMode,
      accentPattern: d.accentPattern,
      gapTraining: d.gapTraining,
      randomMute: d.randomMute,
      tempoRamp: d.tempoRamp
    })
  }
}

export async function getPresets(uid) {
  const snapshot = await getDocs(
    query(presetsCollection(uid), orderBy('createdAt', 'desc'))
  )
  return snapshot.docs.map(mapPreset)
}

export async function renamePreset(uid, presetId, name) {
  await setDoc(
    doc(presetsCollection(uid), presetId),
    { name: name.trim() || 'Untitled preset' },
    { merge: true }
  )
}

export async function updatePreset(uid, presetId, config) {
  await setDoc(doc(presetsCollection(uid), presetId), configToFields(config), {
    merge: true
  })
}

export async function deletePreset(uid, presetId) {
  await deleteDoc(doc(presetsCollection(uid), presetId))
}
