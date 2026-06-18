import { Navigate, Outlet } from 'react-router-dom'

import { useAuth } from '../features/auth/useAuth.js'
import { FullScreenLoader } from '../components/Loader.jsx'

/** Inverse of ProtectedRoute: keeps signed-in users out of /login & /register. */
export function PublicOnlyRoute() {
  const { user, loading } = useAuth()

  if (loading) return <FullScreenLoader />
  if (user) return <Navigate to="/dashboard" replace />
  return <Outlet />
}
