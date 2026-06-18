import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '../features/auth/useAuth.js'
import { FullScreenLoader } from '../components/Loader.jsx'

/**
 * Gate for authenticated routes. Waits for the initial auth check, then either
 * renders the nested routes or bounces to /login (remembering where the user
 * was headed so we could redirect back later).
 */
export function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <FullScreenLoader />
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return <Outlet />
}
