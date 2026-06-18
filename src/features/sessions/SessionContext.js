import { createContext } from 'react'

/**
 * Practice session context. Tracks a single in-progress session that survives
 * navigation and page reloads (persisted to localStorage for crash recovery).
 */
export const SessionContext = createContext(null)
