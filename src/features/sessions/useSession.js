import { useContext } from 'react'

import { SessionContext } from './SessionContext.js'

/** Access the active practice session state and controls. */
export function useSession() {
  const context = useContext(SessionContext)
  if (context === null) {
    throw new Error('useSession must be used within a <SessionProvider>')
  }
  return context
}
