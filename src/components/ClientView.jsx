import { useState, useRef, useCallback, useEffect } from 'react'
import Dashboard from './Dashboard'
import { CATEGORIES, STATUS_CONFIG } from '../data/checks'
import { categoryPageStats, pageStats } from '../utils/stats'
import StatusDot from './StatusDot'

const ALL_CATEGORY_IDS = CATEGORIES.map((c) => c.id)

const FILTERS = [
  { id: 'all', label: 'All pages' },
  { id: 'failures', label: 'Has failures' },
  { id: 'clear', label: 'All clear' },
]

export default function ClientView({ project }) {
  const [filter, setFilter] = useState('all')

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-950 transition-colors overflow-hidden">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center gap-3 shrink-0 flex-wrap">
        <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center text-white text-xs font-bold shrink-0">A</div>
        <h1 className="font-semibold text-gray-900 dark:text-gray-100 truncate flex-1 text-sm sm:text-base">
          {project.name}
        </h1>
        <span className="text-xs text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700 px-2.5 py-1 rounded-full">
          Read-only view
        </span>
      </header>

      <Dashboard project={project} />

      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-2 flex items-center gap-1 shrink-0">
        <span className="text-xs text-gray-400 dark:text-gray-500 mr-2 hidden sm:inline">Filter:</span>
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              filter === f.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-400 dark:text-gray-500 hidden sm:inline">
          {project.pages.length} page{project.pages.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        <ReadOnlyTable project={project} filter={filter} />
      </div>
    </div>
  )
}

function ReadOnlyTable({ project, filter }) {
  const [expanded, setExpanded] = useState(new Set())
  const scrollRef = useRef(null)
  const topScrollRef = useRef(null)
  const topScrollInnerRef = useRef(null)
  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 })

  const syncFromMain = useCallback(() => {
    if (topScrollRef.current && scrollRef.current)
      topScrollRef.current.scrollLeft = scrollRef.current.scrollLeft
  }, [])
  const syncFromTop = useCallback(() => {
    if (scrollRef.current && topScrollRef.current)
      scrollRef.current.scrollLeft = topScrollRef.current.scrollLeft
  }, [])

  const onMouseDown = useCallback((e) => {
    if (e.button !== 0) return
    isDragging.current = true
    dragStart.current = {
      x: e.clientX, y: e.clientY,
      scrollLeft: scrollRef.current.scrollLeft,
      scrollTop: scrollRef.current.scrollTop,
    }
    scrollRef.current.style.cursor = 'grabbing'
    e.preventDefault()
  }, [])
  const onMouseMove = useCallback((e) => {
    if (!isDragging.current) return
    scrollRef.current.scrollLeft = dragStart.current.scrollLeft - (e.clientX - dragStart.current.x)
    scrollRef.current.scrollTop = dragStart.current.scrollTop - (e.clientY - dragStart.current.y)
  }, [])
  const onMouseUp = useCallback(() => {
    isDragging.current = false
    if (scrollRef.current) scrollRef.current.style.cursor = 'grab'
  }, [])

  useEffect(() => {
    const update = () => {
      if (topScrollInnerRef.current && scrollRef.current)
        topScrollInnerRef.current.style.width = scrollRef.current.scrollWidth + 'px'
    }
    update()
    const ro = new ResizeObserver(update)
    if (scrollRef.current) ro.observe(scrollRef.current)
    return () => ro.disconnect()
  }, [expanded])

  const pages = project.pages.filter((page) => {
    if (filter === 'failures') return pageStats(page).fail > 0
    if (filter === 'clear') { const s = pageStats(page); return s.fail === 0 && s.inProgress === 0 }
    return true
  })

  function toggleCategory(id) {
    setExpanded((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })
  }
  function toggleAll() {
    setExpanded((prev) => prev.size === CATEGORIES.length ? new Set() : new Set(ALL_CATEGORY_IDS))
  }

  if (pages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-20 text-gray-500 dark:text-gray-600">
        <div className="text-center">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-sm">{filter !== 'all' ? 'No pages match this filter.' : 'No pages yet.'}</p>
        </div>
      </div>
    )
  }

  const columns = CATEGORIES.flatMap((cat) =>
    expanded.has(cat.id)
      ? cat.checks.map((check) => ({ type: 'check', cat, check }))
      : [{ type: 'summary', cat }]
  )

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-800 bg-gray-900 shrink-0 flex-wrap">
        <button onClick={toggleAll} className="text-xs text-blue-400 hover:text-blue-300 font-medium">
          {expanded.size === CATEGORIES.length ? '⇧ Collapse all categories' : '⇦ Expand all categories'}
        </button>
        <div className="ml-auto flex items-center gap-3">
          {Object.entries(STATUS_CONFIG).map(([key, { label, dot }]) => (
            <span key={key} className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className={`w-3 h-3 rounded-full shrink-0 ${dot}`} />
              <span className="hidden lg:inline">{label}</span>
            </span>
          ))}
        </div>
      </div>

      <div
        ref={topScrollRef}
        onScroll={syncFromTop}
        className="overflow-x-auto table-scroll shrink-0"
        style={{ height: 12 }}
      >
        <div ref={topScrollInnerRef} style={{ height: 1 }} />
      </div>

      <div
        ref={scrollRef}
        onScroll={syncFromMain}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        className="overflow-auto flex-1 bg-gray-950 table-scroll"
        style={{ cursor: 'grab' }}
      >
        <table className="border-collapse text-xs w-max min-w-full">
          <thead>
            <tr className="sticky top-0 z-20">
              <th
                rowSpan={2}
                className="sticky left-0 z-30 bg-gray-900 border-b-2 border-b-gray-700 border-r border-r-gray-700 text-left px-3 py-2 font-semibold text-gray-300 align-bottom min-w-[200px] max-w-[220px]"
              >
                Page
              </th>
              {CATEGORIES.map((cat) => {
                const isOpen = expanded.has(cat.id)
                const colSpan = isOpen ? cat.checks.length : 1
                return (
                  <th
                    key={cat.id}
                    colSpan={colSpan}
                    className={`border-b border-r border-gray-700 text-center align-middle px-0 overflow-hidden max-w-0 ${cat.headerBg} ${cat.accentBorder}`}
                  >
                    <button
                      onClick={() => toggleCategory(cat.id)}
                      className={`w-full flex items-center justify-center gap-1.5 px-2 py-1.5 hover:opacity-80 transition-opacity font-semibold text-xs ${cat.colorClass} border-0`}
                    >
                      <span className="text-[10px] shrink-0">{isOpen ? '⇮' : '⇰'}</span>
                      <span className="truncate">{cat.name}</span>
                      <span className="opacity-50 text-[10px] whitespace-nowrap">
                        {isOpen ? `${cat.checks.length} checks` : `${cat.checks.length}`}
                      </span>
                    </button>
                  </th>
                )
              })}
              <th
                rowSpan={2}
                className="sticky right-0 z-30 bg-gray-900 border-b-2 border-b-gray-700 border-l border-l-gray-700 px-2 py-2 font-semibold text-gray-300 text-center align-bottom min-w-[60px] whitespace-nowrap"
              >
                Score
              </th>
            </tr>
            <tr className="sticky top-[33px] z-20">
              {columns.map((col) => {
                if (col.type === 'summary') {
                  return (
                    <th
                      key={`summary-${col.cat.id}`}
                      className={`border-b-2 border-b-gray-700 border-r border-r-gray-700 px-1.5 py-1 text-center ${col.cat.headerBg} ${col.cat.accentBorder}`}
                    >
                      <button
                        onClick={() => toggleCategory(col.cat.id)}
                        className="text-[10px] text-gray-400 hover:text-gray-200 transition-colors whitespace-nowrap"
                      >
                        ⇦ expand to see checks
                      </button>
                    </th>
                  )
                }
                return (
                  <th
                    key={`check-${col.check.id}`}
                    className={`border-b-2 border-b-gray-700 border-r border-r-gray-700 px-1.5 py-1 font-normal text-center ${col.cat.headerBg} ${col.cat.accentBorder}`}
                    title={col.check.description}
                  >
                    <div
                      className="text-[11px] text-gray-300 leading-tight min-w-[64px] max-w-[88px] mx-auto"
                      style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                    >
                      {col.check.name}
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {pages.map((page, rowIdx) => {
              const pStats = pageStats(page)
              const rowBg = rowIdx % 2 === 0 ? 'bg-gray-950' : 'bg-gray-900'
              return (
                <tr key={page.id} className={`${rowBg} hover:bg-blue-950/30 group`}>
                  <td className={`sticky left-0 z-10 ${rowBg} group-hover:bg-blue-950/30 border-b border-r border-gray-800 px-3 py-2 min-w-[200px] max-w-[220px]`}>
                    <div className="flex items-start gap-1">
                      <span className="font-medium text-gray-200 text-xs text-left truncate block leading-tight max-w-[170px]">
                        {page.name}
                      </span>
                      {page.url && (
                        <a href={page.url} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-400 shrink-0 mt-px text-xs" title={page.url}>⇗</a>
                      )}
                    </div>
                    {page.screenshots?.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {page.screenshots.slice(0, 3).map((shot) => (
                          <a key={shot.id} href={shot.url} target="_blank" rel="noopener noreferrer" title={shot.name}>
                            <img src={shot.url} alt={shot.name} className="w-6 h-6 object-cover rounded border border-gray-700" />
                          </a>
                        ))}
                        {page.screenshots.length > 3 && (
                          <span className="text-[10px] text-gray-500 leading-6">+{page.screenshots.length - 3}</span>
                        )}
                      </div>
                    )}
                    {page.notes && (
                      <div className="text-gray-500 text-[10px] truncate mt-0.5" title={page.notes}>
                        <span>📝</span> <span className="truncate">{page.notes}</span>
                      </div>
                    )}
                  </td>

                  {columns.map((col) => {
                    if (col.type === 'summary') {
                      const cs = categoryPageStats(page, col.cat)
                      const active = cs.total - cs.na
                      const score = active > 0 ? Math.round((cs.pass / active) * 100) : 100
                      const colour = cs.fail > 0 ? 'text-red-400' : cs.inProgress > 0 ? 'text-amber-400' : score === 100 && active > 0 ? 'text-green-400' : 'text-gray-500'
                      return (
                        <td key={`summary-${col.cat.id}`} className="border-b border-r border-gray-800 px-2 py-2 text-center align-middle">
                          <div className={`text-xs font-semibold ${colour}`}>
                            {cs.pass}/{active > 0 ? active : cs.total}
                          </div>
                          {cs.fail > 0 && <div className="text-[10px] text-red-500 leading-none mt-0.5">{cs.fail} fail</div>}
                        </td>
                      )
                    }
                    const status = page.checks[col.check.id] || 'not-started'
                    return (
                      <td key={`check-${col.check.id}`} className="border-b border-r border-gray-800 px-1 py-2 text-center align-middle">
                        <StatusDot status={status} readOnly />
                      </td>
                    )
                  })}

                  <td className={`sticky right-0 z-10 ${rowBg} group-hover:bg-blue-950/30 border-b border-l border-gray-800 px-2 py-2 text-center min-w-[60px]`}>
                    {pStats.active === 0
                      ? <span className="text-gray-600 text-xs">—</span>
                      : <span className={`text-xs font-bold ${pStats.score === 100 ? 'text-green-400' : pStats.score >= 80 ? 'text-amber-400' : 'text-red-400'}`}>{pStats.score}%</span>
                    }
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
