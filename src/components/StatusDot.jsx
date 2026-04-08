import { STATUS_CYCLE, STATUS_CONFIG } from '../data/checks'

export default function StatusDot({ status = 'not-started', onChange }) {
  if (!onChange) {
    const cfg = STATUS_CONFIG[status]
    return <span className={`w-5 h-5 rounded-full ${cfg.dot} block mx-auto`} title={cfg.label} />
  }

  return (
    <div className="relative mx-auto w-fit">
      <select
        value={status}
        onChange={(e) => onChange(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        className="appearance-none cursor-pointer rounded-full w-5 h-5 border-0 bg-transparent p-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 absolute inset-0 opacity-0 z-10"
        aria-label={`Status: ${STATUS_CONFIG[status].label}`}
      >
        {STATUS_CYCLE.map((s) => (
          <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
        ))}
      </select>
      <span
        className={`w-5 h-5 rounded-full ${STATUS_CONFIG[status].dot} block hover:scale-110 transition-transform`}
        title={STATUS_CONFIG[status].label}
      />
    </div>
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
