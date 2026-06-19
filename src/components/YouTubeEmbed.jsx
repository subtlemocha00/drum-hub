import { youtubeEmbedUrl } from '../lib/youtube.js'

/**
 * Embeds a YouTube player when `url` is a real watch/embed link. When it's a
 * search link (the seeded default) or unparseable, it falls back to a clear
 * "open on YouTube" button so the UI is never broken.
 */
export function YouTubeEmbed({ url, title = 'Video' }) {
  if (!url) return null
  const embed = youtubeEmbedUrl(url)

  if (!embed) {
    return (
      <a className="btn btn--block" href={url} target="_blank" rel="noopener noreferrer">
        Find a lesson on YouTube ↗
      </a>
    )
  }

  return (
    <div className="video-embed">
      <iframe
        src={embed}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}
