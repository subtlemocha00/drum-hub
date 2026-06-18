import { createContext } from 'react'

/**
 * Auth context value shape:
 *   { user, loading, ... auth actions }
 *
 * Kept in its own module (no component export) so fast-refresh stays happy.
 */
export const AuthContext = createContext(null)
