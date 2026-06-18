import { Navigate, Route, Routes } from 'react-router-dom'

import { useAuth } from '../features/auth/useAuth.js'
import { FullScreenLoader } from '../components/Loader.jsx'
import { AppLayout } from './AppLayout.jsx'
import { ProtectedRoute } from './ProtectedRoute.jsx'
import { PublicOnlyRoute } from './PublicOnlyRoute.jsx'
import { DashboardPage } from '../pages/DashboardPage.jsx'
import { LoginPage } from '../pages/LoginPage.jsx'
import { MetronomePage } from '../pages/MetronomePage.jsx'
import { RegisterPage } from '../pages/RegisterPage.jsx'
import { SessionPage } from '../pages/SessionPage.jsx'
import { SettingsPage } from '../pages/SettingsPage.jsx'

/** Root "/" — sends users to the dashboard or login based on auth state. */
function Index() {
  const { user, loading } = useAuth()
  if (loading) return <FullScreenLoader />
  return <Navigate to={user ? '/dashboard' : '/login'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />

      {/* Public routes — redirect away if already signed in. */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Authenticated app, wrapped in the shared shell. */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/metronome" element={<MetronomePage />} />
          <Route path="/session" element={<SessionPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
