import { useEffect } from 'react'

/**
 * Set the document title while a component is mounted, restoring the previous
 * title on unmount. Shared across pages so the browser tab / PWA reflects the
 * current screen.
 */
export function useDocumentTitle(title) {
  useEffect(() => {
    const previous = document.title
    document.title = title ? `${title} · Drum Hub` : 'Drum Hub'
    return () => {
      document.title = previous
    }
  }, [title])
}
