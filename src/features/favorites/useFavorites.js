import { useContext } from 'react'

import { FavoritesContext } from './FavoritesContext.js'

/** Access app-wide favorites state and the toggle action. */
export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === null) {
    throw new Error('useFavorites must be used within a <FavoritesProvider>')
  }
  return context
}
