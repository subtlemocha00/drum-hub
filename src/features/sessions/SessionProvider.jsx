import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useAuth } from '../auth/useAuth.js'
import { SessionContext } from './SessionContext.js'
import { saveSession } from './sessionService.js'

const STORAGE_KEY = 'drumhub.activeSession'

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (typeof parsed?.startTime !== 'number') return null
    return parsed
  } catch {
    return null
  }
}

/**
 * Provides a single in-progress practice session. The active session persists
 * across navigation and reloads via localStorage. If a session is found on
 * startup, it is flagged as "recovered" so the UI can offer Resume / End /
 * Discard, per the app's session-recovery requirement.
 */
export function SessionProvider({ children }) {
  const { user } = useAuth()
  const [activeSession, setActiveSession] = useState(() => readStored())
  // A session restored from storage on load is a candidate for recovery.
  const [isRecovered, setIsRecovered] = useState(() => readStored() !== null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const tickRef = useRef(null)

  // Keep localStorage in sync with the active session.
  useEffect(() => {
    if (activeSession) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activeSession))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [activeSession])

  // Tick the elapsed counter once per second while a session is active.
  useEffect(() => {
    if (!activeSession) {
      setElapsedSeconds(0)
      return
    }
    const update = () =>
      setElapsedSeconds(Math.floor((Date.now() - activeSession.startTime) / 1000))
    update()
    tickRef.current = window.setInterval(update, 1000)
    return () => window.clearInterval(tickRef.current)
  }, [activeSession])

  const startSession = useCallback(() => {
    setActiveSession((current) => current ?? { startTime: Date.now() })
    setIsRecovered(false)
  }, [])

  // Resume a recovered session: just keep it running and dismiss the prompt.
  const resumeSession = useCallback(() => {
    setIsRecovered(false)
  }, [])

  const discardSession = useCallback(() => {
    setActiveSession(null)
    setIsRecovered(false)
  }, [])

  /**
   * End the active session and persist it to Firestore. Returns the saved
   * session summary, or null if there was nothing to save.
   */
  const endSession = useCallback(async () => {
    if (!activeSession) return null
    const endTime = Date.now()
    const durationSeconds = Math.max(
      0,
      Math.round((endTime - activeSession.startTime) / 1000)
    )
    const summary = {
      startTime: activeSession.startTime,
      endTime,
      durationSeconds
    }

    setActiveSession(null)
    setIsRecovered(false)

    let sessionId = null
    if (user) {
      sessionId = await saveSession(user.uid, summary)
    }
    // sessionId lets the caller attach a practice log to this session.
    return { ...summary, sessionId }
  }, [activeSession, user])

  const value = useMemo(
    () => ({
      activeSession,
      isActive: activeSession !== null,
      isRecovered,
      elapsedSeconds,
      startSession,
      resumeSession,
      endSession,
      discardSession
    }),
    [
      activeSession,
      isRecovered,
      elapsedSeconds,
      startSession,
      resumeSession,
      endSession,
      discardSession
    ]
  )

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  )
}
