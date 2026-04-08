import { useState, useRef, useEffect } from 'react'
import { STATUS_CYCLE, STATUS_CONFIG } from '../data/checks'

export default function StatusDot({ status = 'not-started', onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    function onClickOutside(e) {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  const cfg = STATUS_CONFIG[status]

  if (!onChange) {
    return <span className={`w-5 h-5 rounded-full ${cfg.dot} block mx-auto`} title={cfg.label} />
  }

  return (
    <div ref={ref} className="relative mx-auto w-fit">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o) }}
        className={`w-5 h-5 rounded-full ${cfg.dot} block hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1`}
        title={cfg.label}
        aria-label={`Status: ${cfg.label}`}
      />
      {open && (
        <div className="absolute z-50 left-1/2 -translate-x-1/2 top-7 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1 min-w-[110px]">
          {STATUS_CYCLE.map((s) => (
            <button
              key={s}
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(s); setOpen(false) }}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-gray-700 transition-colors text-left ${s === status ? 'text-white font-semibold' : 'text-gray-300'}`}
            >
              <span className={`w-3 h-3 rounded-full shrink-0 ${STATUS_CONFIG[s].dot}`} />
              {STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
      )}
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
