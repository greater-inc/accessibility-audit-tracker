import { STATUS_CYCLE, STATUS_CONFIG } from '../data/checks'

export default function StatusDot({ status = 'not-started', onChange, size = 'md' }) {
  const cfg = STATUS_CONFIG[status]
  const sz = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5'

  function handleClick(e) {
    e.stopPropagation()
    const idx = STATUS_CYCLE.indexOf(status)
    onChange(STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length])
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick(e)
    }
  }

  return (
    <button
      type="button"
      onClick={onChange ? handleClick : undefined}
      onKeyDown={onChange ? handleKeyDown : undefined}
      title={cfg.label}
      aria-label={`Status: ${cfg.label}${onChange ? '. Click to change.' : ''}`}
      className={`${sz} rounded-full ${cfg.dot} ${onChange ? 'cursor-pointer hover:opacity-80 hover:scale-110 active:scale-95' : 'cursor-default'} transition-transform block mx-auto focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500`}
    />
  )
}

export function StatusBadge({ status = 'not-started' }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${cfg.text}`}>
      <span className={`w-2 h-2 rounded-full ${cfg.dot} inline-block`} />
      {cfg.label}
    </span>
  )
}
