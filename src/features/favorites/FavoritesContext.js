import { createContext } from 'react'

/**
 * Favorites context: app-wide bookmark state so any card can show/toggle a star
 * without each one hitting Firestore.
 */
export const FavoritesContext = createContext(null)
