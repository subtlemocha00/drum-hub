import { Navigate, Route, Routes } from 'react-router-dom'

import { useAuth } from '../features/auth/useAuth.js'
import { FullScreenLoader } from '../components/Loader.jsx'
import { AppLayout } from './AppLayout.jsx'
import { ProtectedRoute } from './ProtectedRoute.jsx'
import { PublicOnlyRoute } from './PublicOnlyRoute.jsx'
import { OnboardingGate } from './OnboardingGate.jsx'
import { OnboardingPage } from '../pages/OnboardingPage.jsx'
import { SearchPage } from '../pages/SearchPage.jsx'
import { DashboardPage } from '../pages/DashboardPage.jsx'
import { LoginPage } from '../pages/LoginPage.jsx'
import { MetronomePage } from '../pages/MetronomePage.jsx'
import { RegisterPage } from '../pages/RegisterPage.jsx'
import { SessionPage } from '../pages/SessionPage.jsx'
import { SettingsPage } from '../pages/SettingsPage.jsx'
import { LibraryPage } from '../pages/LibraryPage.jsx'
import { RudimentsPage } from '../pages/RudimentsPage.jsx'
import { RudimentDetailPage } from '../pages/RudimentDetailPage.jsx'
import { GroovesPage } from '../pages/GroovesPage.jsx'
import { GrooveDetailPage } from '../pages/GrooveDetailPage.jsx'
import { WarmupsPage } from '../pages/WarmupsPage.jsx'
import { WarmupDetailPage } from '../pages/WarmupDetailPage.jsx'
import { FavoritesPage } from '../pages/FavoritesPage.jsx'
import { ProgressPage } from '../pages/ProgressPage.jsx'
import { StatisticsPage } from '../pages/StatisticsPage.jsx'
import { PlansPage } from '../pages/PlansPage.jsx'
import { PlanDetailPage } from '../pages/PlanDetailPage.jsx'
import { PracticeLogsPage } from '../pages/PracticeLogsPage.jsx'
import { SkillTreePage } from '../pages/SkillTreePage.jsx'
import { GoalsPage } from '../pages/GoalsPage.jsx'

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

      {/* Authenticated app — onboarding gate first, then the shared shell. */}
      <Route element={<ProtectedRoute />}>
        <Route element={<OnboardingGate />}>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/metronome" element={<MetronomePage />} />
          <Route path="/session" element={<SessionPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* Phase 2 — library */}
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/rudiments" element={<RudimentsPage />} />
          <Route path="/rudiments/:id" element={<RudimentDetailPage />} />
          <Route path="/grooves" element={<GroovesPage />} />
          <Route path="/grooves/:id" element={<GrooveDetailPage />} />
          <Route path="/warmups" element={<WarmupsPage />} />
          <Route path="/warmups/:id" element={<WarmupDetailPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />

          {/* Phase 3 — progression */}
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/plans/:id" element={<PlanDetailPage />} />
          <Route path="/practice-logs" element={<PracticeLogsPage />} />
          <Route path="/skill-tree" element={<SkillTreePage />} />
          <Route path="/goals" element={<GoalsPage />} />

          {/* Phase 4 — global search */}
          <Route path="/search" element={<SearchPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
