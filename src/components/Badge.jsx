/**
 * Small pill label. `tone` maps difficulty / category to a color accent; falls
 * back to a neutral chip.
 */
const TONES = {
  beginner: 'badge--ok',
  intermediate: 'badge--warn',
  advanced: 'badge--danger'
}

export function Badge({ children, tone }) {
  const cls = 'badge' + (tone && TONES[tone] ? ' ' + TONES[tone] : '')
  return <span className={cls}>{children}</span>
}
