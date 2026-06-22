import { useCallback, useEffect, useRef, useState } from 'react'

import { MetronomeEngine } from '../../lib/audio/metronomeEngine.js'
import {
  defaultConfig,
  normalizeConfig,
  subdivisionSteps,
  swingOffset,
  randomMuteProbability
} from './metronomeConfig.js'

/**
 * Push a full config object onto the engine. Pure translation from the UI-facing
 * config (string subdivision/swing, level names) to the engine's numeric inputs.
 * Safe to call live while playing — the engine picks up changes at the next step.
 */
function applyConfigToEngine(engine, config) {
  engine.setBpm(config.bpm)
  engine.setBeatsPerMeasure(config.beatsPerMeasure)
  engine.setSubdivision(subdivisionSteps(config.subdivision))
  engine.setSwing(swingOffset(config.swing))
  engine.setAccentPattern(config.accentPattern)
  engine.setGapTraining(
    config.gapTraining?.enabled
      ? {
          audibleBars: config.gapTraining.audibleBars,
          silentBars: config.gapTraining.silentBars
        }
      : null
  )
  engine.setRandomMuteProbability(randomMuteProbability(config.randomMute))
  engine.setTempoRamp(config.tempoRamp?.enabled ? config.tempoRamp : null)
}

/**
 * React binding for the MetronomeEngine. Owns a single engine instance for the
 * lifetime of the component and exposes the full config + controls. The same
 * hook backs both the Metronome page and the Subdivision Trainer.
 */
export function useMetronome(initialConfig) {
  const engineRef = useRef(null)
  const [config, setConfigState] = useState(() =>
    normalizeConfig(initialConfig || defaultConfig())
  )
  const [isPlaying, setIsPlaying] = useState(false)
  // Latest scheduled beat (drives all visuals and the live BPM readout).
  const [beatInfo, setBeatInfo] = useState(null)

  // Create the engine once, dispose on unmount.
  if (engineRef.current === null) {
    engineRef.current = new MetronomeEngine()
    // Per-session seed so random muting is stable within a run but varies
    // between runs.
    engineRef.current.seed = (Math.random() * 0xffffffff) >>> 0
  }
  useEffect(() => {
    const engine = engineRef.current
    return () => engine.dispose()
  }, [])

  const start = useCallback(async () => {
    const engine = engineRef.current
    applyConfigToEngine(engine, config)
    await engine.start((info) => setBeatInfo(info))
    setIsPlaying(true)
  }, [config])

  const stop = useCallback(() => {
    engineRef.current.stop()
    setIsPlaying(false)
    setBeatInfo(null)
  }, [])

  const toggle = useCallback(() => {
    if (isPlaying) stop()
    else start()
  }, [isPlaying, start, stop])

  /** Merge a partial config and apply it live to the engine. */
  const updateConfig = useCallback((patch) => {
    setConfigState((prev) => {
      const next = normalizeConfig({ ...prev, ...patch })
      applyConfigToEngine(engineRef.current, next)
      return next
    })
  }, [])

  /** Replace the whole config (e.g. when loading a preset). */
  const applyConfig = useCallback((newConfig) => {
    const next = normalizeConfig(newConfig)
    setConfigState(next)
    applyConfigToEngine(engineRef.current, next)
  }, [])

  return {
    config,
    isPlaying,
    beatInfo,
    start,
    stop,
    toggle,
    updateConfig,
    applyConfig
  }
}
