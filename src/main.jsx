import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from './app/App.jsx'
import { AuthProvider } from './features/auth/AuthProvider.jsx'
import { ProfileProvider } from './features/profile/ProfileProvider.jsx'
import { SessionProvider } from './features/sessions/SessionProvider.jsx'
import { FavoritesProvider } from './features/favorites/FavoritesProvider.jsx'
import './styles/global.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ProfileProvider>
          <SessionProvider>
            <FavoritesProvider>
              <App />
            </FavoritesProvider>
          </SessionProvider>
        </ProfileProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
