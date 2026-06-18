import { useContext } from 'react'

import { AuthContext } from './AuthContext.js'

/** Access the current auth state and actions. */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error('useAuth must be used within an <AuthProvider>')
  }
  return context
}
