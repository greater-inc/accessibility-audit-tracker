import { useState } from 'react'
import { CATEGORIES, STATUS_CONFIG } from '../data/checks'
import { categoryPageStats, pageStats } from '../utils/stats'
import StatusDot from './StatusDot'

const ALL_CATEGORY_IDS = CATEGORIES.map((c) => c.id)

export default function AuditTable({
  project, filter, onUpdateCheck, onUpdateNotes, onDeletePage, onRenamePage,
}) {
  const [expanded, setExpanded] = useState(new Set())
  const [editingNotes, setEditingNotes] = useState(null)
  const [editingPageId, setEditingPageId] = useState(null)
  const [editingPageName, setEditingPageName] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

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
  function startRename(page) { setEditingPageId(page.id); setEditingPageName(page.name) }
  function commitRename() {
    if (editingPageName.trim()) onRenamePage(editingPageId, editingPageName.trim())
    setEditingPageId(null)
  }

  if (pages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-20 text-gray-500 dark:text-gray-600">
        <div className="text-center">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-sm">{filter !== 'all' ? 'No pages match this filter.' : 'No pages yet — add one above.'}</p>
        </div>
      </div>
    )
  }

  // Build flat column list from expanded/collapsed state
  const columns = CATEGORIES.flatMap((cat) =>
    expanded.has(cat.id)
      ? cat.checks.map((check) => ({ type: 'check', cat, check }))
      : [{ type: 'summary', cat }]
  )

  return (
    <>
      {/* Notes modal */}
      {editingNotes !== null && (() => {
        const page = project.pages.find((p) => p.id === editingNotes)
        return (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setEditingNotes(null)}>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Notes — {page?.name}</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">Internal notes, issues, links, etc.</p>
              <textarea
                autoFocus
                defaultValue={page?.notes || ''}
                rows={6}
                className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add notes here…"
                onChange={(e) => onUpdateNotes(editingNotes, e.target.value)}
              />
              <div className="flex justify-end mt-4">
                <button onClick={() => setEditingNotes(null)} className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg font-medium">Done</button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-800 bg-gray-900 shrink-0 flex-wrap">
        <button onClick={toggleAll} className="text-xs text-blue-400 hover:text-blue-300 font-medium">
          {expanded.size === CATEGORIES.length ? '↙ Collapse all categories' : '↗ Expand all categories'}
        </button>
        <span className="text-gray-700 text-xs hidden sm:inline">·</span>
        <span className="text-xs text-gray-500 hidden sm:inline">Click any coloured dot to cycle its status</span>
        <div className="ml-auto flex items-center gap-3">
          {Object.entries(STATUS_CONFIG).map(([key, { label, dot }]) => (
            <span key={key} className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className={`w-3 h-3 rounded-full shrink-0 ${dot}`} />
              <span className="hidden lg:inline">{label}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Scrollable table */}
      <div className="overflow-auto flex-1 bg-gray-950 table-scroll">
        <table className="border-collapse text-xs w-max min-w-full">
          <thead>
            {/*
              ROW 1 — Category headers
              Each category gets one header that spans all its check columns (or just 1 when collapsed).
              Clicking it expands / collapses that category.
            */}
            <tr className="sticky top-0 z-20">
              {/* Page name column header */}
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
                    className={`border-b border-r border-gray-700 text-center align-middle px-0 ${cat.headerBg}`}
                  >
                    {/* Category toggle button — full cell is clickable */}
                    <button
                      onClick={() => toggleCategory(cat.id)}
                      className={`w-full flex items-center justify-center gap-1.5 px-2 py-1.5 hover:opacity-80 transition-opacity font-semibold text-xs ${cat.colorClass} border-0`}
                      title={isOpen ? `Collapse ${cat.name}` : `Expand ${cat.name} (${cat.checks.length} checks)`}
                    >
                      {/* Chevron shows open/closed state clearly */}
                      <span className="text-[10px] shrink-0">{isOpen ? '▾' : '▸'}</span>
                      <span className="whitespace-nowrap">{cat.name}</span>
                      <span className="opacity-50 text-[10px] whitespace-nowrap">
                        {isOpen ? `${cat.checks.length} checks` : `${cat.checks.length}`}
                      </span>
                    </button>
                  </th>
                )
              })}

              {/* Score + Actions — rowSpan so they merge across both header rows */}
              <th
                rowSpan={2}
                className="sticky right-[72px] z-30 bg-gray-900 border-b-2 border-b-gray-700 border-l border-l-gray-700 px-2 py-2 font-semibold text-gray-300 text-center align-bottom min-w-[60px] whitespace-nowrap"
              >
                Score
              </th>
              <th
                rowSpan={2}
                className="sticky right-0 z-30 bg-gray-900 border-b-2 border-b-gray-700 border-l border-l-gray-700 px-2 py-2 font-semibold text-gray-300 text-center align-bottom min-w-[72px]"
              >
                Actions
              </th>
            </tr>

            {/*
              ROW 2 — Individual check name headers
              Only visible columns are rendered (collapsed categories show a summary cell instead).
            */}
            <tr className="sticky top-[33px] z-20">
              {columns.map((col) => {
                if (col.type === 'summary') {
                  // Collapsed category — single cell spanning where all checks would be
                  return (
                    <th
                      key={`summary-${col.cat.id}`}
                      className={`border-b-2 border-b-gray-700 border-r border-r-gray-700 px-2 py-1 text-center ${col.cat.headerBg} ${col.cat.accentBorder}`}
                    >
                      <button
                        onClick={() => toggleCategory(col.cat.id)}
                        className="text-[10px] text-gray-400 hover:text-gray-200 transition-colors whitespace-nowrap"
                      >
                        ▸ expand to see checks
                      </button>
                    </th>
                  )
                }

                // Expanded — individual check name
                return (
                  <th
                    key={`check-${col.check.id}`}
                    className={`border-b-2 border-b-gray-700 border-r border-r-gray-700 px-1.5 py-1 font-normal text-center ${col.cat.headerBg} ${col.cat.accentBorder}`}
                    title={col.check.description}
                  >
                    {/* Horizontal, readable check name — 2-line max, with tooltip for full description */}
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
                  {/* Page name — sticky left */}
                  <td className={`sticky left-0 z-10 ${rowBg} group-hover:bg-blue-950/30 border-b border-r border-gray-800 px-3 py-2 min-w-[200px] max-w-[220px]`}>
                    {editingPageId === page.id ? (
                      <form onSubmit={(e) => { e.preventDefault(); commitRename() }}>
                        <input
                          autoFocus
                          value={editingPageName}
                          onChange={(e) => setEditingPageName(e.target.value)}
                          onBlur={commitRename}
                          className="w-full border border-gray-600 bg-gray-800 text-gray-100 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </form>
                    ) : (
                      <div className="flex items-start gap-1">
                        <button
                          className="font-medium text-gray-200 text-xs text-left truncate block leading-tight hover:text-blue-400 transition-colors max-w-[170px]"
                          title={`Click to rename\n${page.url || ''}`}
                          onClick={() => startRename(page)}
                        >
                          {page.name}
                        </button>
                        {page.url && (
                          <a href={page.url} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-400 shrink-0 mt-px text-xs" title={page.url}>↗</a>
                        )}
                      </div>
                    )}
                    {page.notes && (
                      <div
                        className="text-gray-500 text-[10px] truncate mt-0.5 cursor-pointer hover:text-gray-400 flex items-center gap-0.5"
                        onClick={() => setEditingNotes(page.id)}
                        title={page.notes}
                      >
                        <span>📝</span> <span className="truncate">{page.notes}</span>
                      </div>
                    )}
                  </td>

                  {/* Check / summary cells */}
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
                        <StatusDot status={status} onChange={(s) => onUpdateCheck(page.id, col.check.id, s)} />
                      </td>
                    )
                  })}

                  {/* Score — sticky right */}
                  <td className={`sticky right-[72px] z-10 ${rowBg} group-hover:bg-blue-950/30 border-b border-l border-gray-800 px-2 py-2 text-center min-w-[60px]`}>
                    {pStats.active === 0
                      ? <span className="text-gray-600 text-xs">—</span>
                      : <span className={`text-xs font-bold ${pStats.score === 100 ? 'text-green-400' : pStats.score >= 80 ? 'text-amber-400' : 'text-red-400'}`}>{pStats.score}%</span>
                    }
                  </td>

                  {/* Actions — sticky right-0 */}
                  <td className={`sticky right-0 z-10 ${rowBg} group-hover:bg-blue-950/30 border-b border-l border-gray-800 px-2 py-2 text-center min-w-[72px]`}>
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => setEditingNotes(page.id)}
                        className={`p-1 rounded hover:bg-gray-700 transition-colors text-sm ${page.notes ? 'text-blue-400' : 'text-gray-600 hover:text-gray-400'}`}
                        title="Edit notes"
                      >
                        📝
                      </button>
                      {confirmDelete === page.id ? (
                        <>
                          <button onClick={() => { onDeletePage(page.id); setConfirmDelete(null) }} className="text-red-400 text-xs font-medium hover:underline">Del</button>
                          <button onClick={() => setConfirmDelete(null)} className="text-gray-500 text-xs hover:text-gray-400">✕</button>
                        </>
                      ) : (
                        <button onClick={() => setConfirmDelete(page.id)} className="p-1 rounded hover:bg-red-900/30 text-gray-600 hover:text-red-400 transition-colors text-sm" title="Remove page">🗑</button>
                      )}
                    </div>
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
