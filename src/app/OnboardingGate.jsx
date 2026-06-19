import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useProfile } from '../features/profile/useProfile.js'
import { FullScreenLoader } from '../components/Loader.jsx'

/**
 * Sends first-time users through the onboarding flow before the rest of the
 * app. Once onboarded (answers saved), they pass straight through.
 */
export function OnboardingGate() {
  const { loading, onboarded } = useProfile()
  const location = useLocation()

  if (loading) return <FullScreenLoader />
  if (!onboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }
  return <Outlet />
}
