/**
 * Horizontal filter chips with an "All" option. Controlled: pass `value`
 * (null = All) and `onChange`. Options are strings; labels are title-cased.
 */
export function FilterChips({ options, value, onChange, allLabel = 'All' }) {
  const chip = (val, label) => (
    <button
      key={label}
      type="button"
      className={'chip' + (value === val ? ' chip--active' : '')}
      onClick={() => onChange(val)}
    >
      {label}
    </button>
  )

  return (
    <div className="chips" role="group" aria-label="Filter">
      {chip(null, allLabel)}
      {options.map((opt) => chip(opt, opt[0].toUpperCase() + opt.slice(1)))}
    </div>
  )
}
