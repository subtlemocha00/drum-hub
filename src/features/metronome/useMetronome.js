import { useCallback, useEffect, useRef, useState } from 'react'

import { MetronomeEngine } from '../../lib/audio/metronomeEngine.js'

/**
 * React binding for the MetronomeEngine. Owns a single engine instance for the
 * lifetime of the component and exposes simple state + controls.
 */
export function useMetronome({ initialBpm = 120, initialBeats = 4 } = {}) {
  const engineRef = useRef(null)
  const [bpm, setBpmState] = useState(initialBpm)
  const [beatsPerMeasure, setBeatsState] = useState(initialBeats)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentBeat, setCurrentBeat] = useState(-1)

  // Create the engine once, dispose on unmount.
  if (engineRef.current === null) {
    engineRef.current = new MetronomeEngine()
  }
  useEffect(() => {
    const engine = engineRef.current
    return () => engine.dispose()
  }, [])

  const start = useCallback(async () => {
    const engine = engineRef.current
    engine.setBpm(bpm)
    engine.setBeatsPerMeasure(beatsPerMeasure)
    await engine.start((beatIndex) => setCurrentBeat(beatIndex))
    setIsPlaying(true)
  }, [bpm, beatsPerMeasure])

  const stop = useCallback(() => {
    engineRef.current.stop()
    setIsPlaying(false)
    setCurrentBeat(-1)
  }, [])

  const toggle = useCallback(() => {
    if (isPlaying) stop()
    else start()
  }, [isPlaying, start, stop])

  // Live tempo changes apply immediately while playing.
  const setBpm = useCallback((value) => {
    const next = Math.min(300, Math.max(20, Math.round(value) || 0))
    setBpmState(next)
    engineRef.current.setBpm(next)
  }, [])

  const setBeatsPerMeasure = useCallback((value) => {
    setBeatsState(value)
    engineRef.current.setBeatsPerMeasure(value)
  }, [])

  return {
    bpm,
    beatsPerMeasure,
    isPlaying,
    currentBeat,
    start,
    stop,
    toggle,
    setBpm,
    setBeatsPerMeasure
  }
}
