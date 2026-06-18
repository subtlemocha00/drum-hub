import { useNavigate } from 'react-router-dom'

import { useSession } from '../features/sessions/useSession.js'
import { formatDuration } from '../lib/format.js'

/**
 * Shown when an in-progress session is restored from a previous visit (e.g. the
 * app was closed mid-session). Offers Resume / End / Discard, per the session
 * recovery requirement.
 */
export function SessionRecoveryPrompt() {
  const { isRecovered, elapsedSeconds, resumeSession, endSession, discardSession } =
    useSession()
  const navigate = useNavigate()

  if (!isRecovered) return null

  const handleResume = () => {
    resumeSession()
    navigate('/session')
  }

  const handleEnd = async () => {
    await endSession()
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="recovery-title">
      <div className="modal card">
        <h2 id="recovery-title" className="modal__title">
          Unfinished practice session
        </h2>
        <p className="modal__body">
          You have a session that was still running, currently at{' '}
          <strong>{formatDuration(elapsedSeconds)}</strong>. What would you like
          to do?
        </p>
        <div className="modal__actions">
          <button className="btn btn--primary" onClick={handleResume}>
            Resume
          </button>
          <button className="btn" onClick={handleEnd}>
            End &amp; Save
          </button>
          <button className="btn btn--ghost" onClick={discardSession}>
            Discard
          </button>
        </div>
      </div>
    </div>
  )
}
