/** Small inline spinner. */
export function Spinner() {
  return <span className="spinner" aria-hidden="true" />
}

/** Full-viewport loading state used while auth/routing resolves. */
export function FullScreenLoader({ label = 'Loading…' }) {
  return (
    <div className="full-screen-loader" role="status" aria-live="polite">
      <Spinner />
      <p>{label}</p>
    </div>
  )
}
