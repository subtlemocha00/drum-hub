import { useFavorites } from '../features/favorites/useFavorites.js'

/**
 * Star toggle used on cards and detail pages. `meta` ({ name, subtitle }) is
 * stored alongside the favorite so the Favorites page can render without
 * re-fetching catalogs.
 */
export function FavoriteButton({ type, refId, name, subtitle, size = 'md' }) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const active = isFavorite(type, refId)

  const handleClick = (e) => {
    // Prevent triggering a parent link/card navigation.
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(type, refId, { name, subtitle })
  }

  return (
    <button
      type="button"
      className={
        'fav-btn' + (active ? ' fav-btn--active' : '') + (size === 'lg' ? ' fav-btn--lg' : '')
      }
      onClick={handleClick}
      aria-pressed={active}
      aria-label={active ? 'Remove from favorites' : 'Add to favorites'}
      title={active ? 'Remove from favorites' : 'Add to favorites'}
    >
      {active ? '★' : '☆'}
    </button>
  )
}
