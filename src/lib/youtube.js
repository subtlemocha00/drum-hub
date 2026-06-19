/**
 * Helpers for working with YouTube links (the only video source in the MVP).
 */

/** Extract a YouTube video id from a watch / youtu.be / embed URL. */
export function youtubeId(url) {
  if (!url) return null
  try {
    const u = new URL(url)
    if (u.hostname === 'youtu.be') return u.pathname.slice(1) || null
    if (u.searchParams.get('v')) return u.searchParams.get('v')
    const parts = u.pathname.split('/')
    const idx = parts.findIndex((p) => p === 'embed' || p === 'shorts')
    if (idx !== -1 && parts[idx + 1]) return parts[idx + 1]
    return null
  } catch {
    return null
  }
}

/** Build an embeddable URL, or null if the link isn't a recognizable video. */
export function youtubeEmbedUrl(url) {
  const id = youtubeId(url)
  return id ? `https://www.youtube.com/embed/${id}` : null
}
