import { useCallback, useEffect, useRef, useState } from 'react'

import { useAuth } from '../features/auth/useAuth.js'
import { getLogs } from '../features/logs/logService.js'
import { Spinner } from '../components/Loader.jsx'
import { Badge } from '../components/Badge.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { formatDateTime, formatDuration } from '../lib/format.js'

const PAGE_SIZE = 10

/** Paginated list of practice logs, newest first. */
export function PracticeLogsPage() {
  useDocumentTitle('Practice Logs')
  const { user } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState('')
  const cursorRef = useRef(null)

  const loadPage = useCallback(
    async (initial) => {
      if (!user) return
      initial ? setLoading(true) : setLoadingMore(true)
      try {
        const res = await getLogs(user.uid, {
          pageSize: PAGE_SIZE,
          cursor: initial ? null : cursorRef.current
        })
        cursorRef.current = res.cursor
        setHasMore(res.hasMore)
        setLogs((prev) => (initial ? res.logs : [...prev, ...res.logs]))
      } catch {
        setError('Could not load practice logs.')
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [user]
  )

  useEffect(() => {
    cursorRef.current = null
    loadPage(true)
  }, [loadPage])

  return (
    <div className="page">
      <header className="page__head">
        <h1 className="page__title">Practice logs</h1>
        <p className="muted">Your notes from past sessions.</p>
      </header>

      {loading ? (
        <div className="center-row"><Spinner /></div>
      ) : error ? (
        <p className="notice notice--error">{error}</p>
      ) : logs.length === 0 ? (
        <p className="empty">
          No logs yet. After ending a session you can jot down what you worked on.
        </p>
      ) : (
        <>
          <ul className="card-list">
            {logs.map((log) => (
              <li key={log.id} className="card log-card">
                <div className="log-card__head">
                  <span className="log-card__date">{formatDateTime(log.createdAt)}</span>
                  {log.durationSeconds > 0 && (
                    <span className="muted">{formatDuration(log.durationSeconds)}</span>
                  )}
                </div>
                {log.notes && <p className="log-card__notes">{log.notes}</p>}
                {log.practicedItems.length > 0 && (
                  <div className="badge-row">
                    {log.practicedItems.map((item, i) => (
                      <Badge key={i}>{item}</Badge>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>

          {hasMore && (
            <button
              className="btn btn--block"
              onClick={() => loadPage(false)}
              disabled={loadingMore}
            >
              {loadingMore ? <Spinner /> : 'Load more'}
            </button>
          )}
        </>
      )}
    </div>
  )
}
