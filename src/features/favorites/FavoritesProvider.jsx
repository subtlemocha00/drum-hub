import { useCallback, useEffect, useMemo, useState } from 'react'

import { useAuth } from '../auth/useAuth.js'
import { FavoritesContext } from './FavoritesContext.js'
import {
  addFavorite,
  favoriteId,
  getFavorites,
  removeFavorite
} from './favoritesService.js'

/**
 * Loads the user's favorites once and exposes lookup + optimistic toggling.
 * Keeping this app-wide means stars stay in sync across list pages, detail
 * pages, and the Favorites page.
 */
export function FavoritesProvider({ children }) {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setFavorites([])
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    getFavorites(user.uid)
      .then((data) => {
        if (!cancelled) setFavorites(data)
      })
      .catch(() => {
        if (!cancelled) setFavorites([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user])

  const isFavorite = useCallback(
    (type, refId) => favorites.some((f) => f.type === type && f.refId === refId),
    [favorites]
  )

  /** Toggle a favorite. `meta` carries name/subtitle for denormalized display. */
  const toggleFavorite = useCallback(
    async (type, refId, meta = {}) => {
      if (!user) return
      const exists = isFavorite(type, refId)
      // Optimistic update — revert on failure.
      if (exists) {
        setFavorites((prev) => prev.filter((f) => !(f.type === type && f.refId === refId)))
      } else {
        setFavorites((prev) => [
          ...prev,
          {
            id: favoriteId(type, refId),
            type,
            refId,
            name: meta.name ?? '',
            subtitle: meta.subtitle ?? '',
            createdAt: new Date()
          }
        ])
      }
      try {
        if (exists) await removeFavorite(user.uid, type, refId)
        else await addFavorite(user.uid, { type, refId, ...meta })
      } catch {
        // Reload from source of truth if the write failed.
        const fresh = await getFavorites(user.uid).catch(() => [])
        setFavorites(fresh)
      }
    },
    [user, isFavorite]
  )

  const value = useMemo(
    () => ({ favorites, loading, isFavorite, toggleFavorite }),
    [favorites, loading, isFavorite, toggleFavorite]
  )

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}
