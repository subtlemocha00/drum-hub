/**
 * Minimal CSS bar chart — no charting dependency. `data` is [{ label, value }].
 * `formatValue` renders the tooltip/label for a bar's value.
 */
export function BarChart({ data, formatValue = (v) => String(v) }) {
  const max = Math.max(1, ...data.map((d) => d.value))

  return (
    <div className="bar-chart" role="img" aria-label="Practice time chart">
      {data.map((d, i) => {
        const pct = Math.round((d.value / max) * 100)
        return (
          <div className="bar-chart__col" key={i} title={`${d.label}: ${formatValue(d.value)}`}>
            <div className="bar-chart__track">
              <div
                className={'bar-chart__bar' + (d.value === 0 ? ' bar-chart__bar--empty' : '')}
                style={{ height: `${pct}%` }}
              />
            </div>
            <span className="bar-chart__label">{d.label}</span>
          </div>
        )
      })}
    </div>
  )
}
