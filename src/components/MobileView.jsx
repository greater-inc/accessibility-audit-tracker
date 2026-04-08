import { useState } from 'react'
import { CATEGORIES } from '../data/checks'
import { pageStats, categoryPageStats } from '../utils/stats'
import StatusDot, { StatusBadge } from './StatusDot'

export default function MobileView({ project, filter, onUpdateCheck, onUpdateNotes, onDeletePage }) {
  const [activePage, setActivePage] = useState(null)
  const [expandedCats, setExpandedCats] = useState(new Set())
  const [editingNotes, setEditingNotes] = useState(false)
  const [notesValue, setNotesValue] = useState('')

  const pages = project.pages.filter((page) => {
    if (filter === 'failures') return pageStats(page).fail > 0
    if (filter === 'clear') { const s = pageStats(page); return s.fail === 0 && s.inProgress === 0 }
    return true
  })

  function toggleCat(id) {
    setExpandedCats((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })
  }

  function saveNotes() {
    if (activePage) onUpdateNotes(activePage.id, notesValue)
    setEditingNotes(false)
  }

  if (activePage) {
    const page = project.pages.find((p) => p.id === activePage.id) || activePage
    const pStats = pageStats(page)
    return (
      <div className="flex-1 flex flex-col bg-gray-950">
        {editingNotes && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-end" onClick={() => setEditingNotes(false)}>
            <div className="bg-gray-900 border-t border-gray-700 w-full rounded-t-xl p-6 pb-8" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-semibold mb-3 text-gray-100">Notes — {page.name}</h3>
              <textarea
                autoFocus
                value={notesValue}
                onChange={(e) => setNotesValue(e.target.value)}
                rows={5}
                className="w-full border border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-500 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add notes…"
              />
              <div className="flex gap-2 mt-3">
                <button onClick={saveNotes} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg font-medium text-sm">Save</button>
                <button onClick={() => setEditingNotes(false)} className="px-4 text-sm text-gray-400 border border-gray-700 rounded-lg hover:border-gray-500">Cancel</button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActivePage(null)}
            className="text-blue-500 hover:text-blue-400 text-sm font-medium flex items-center gap-1"
          >
            ← Back
          </button>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-100 text-sm truncate">{page.name}</div>
            {page.url && (
              <a href={page.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 truncate block">{page.url}</a>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ScoreChip score={pStats.score} active={pStats.active} />
            <button
              onClick={() => { setNotesValue(page.notes || ''); setEditingNotes(true) }}
              className={`text-lg ${page.notes ? 'opacity-100' : 'opacity-30'}`}
            >
              📝
            </button>
          </div>
        </div>

        <div className="flex gap-3 px-4 py-2 bg-gray-900 border-b border-gray-800 text-xs shrink-0">
          <span className="text-green-400 font-medium">{pStats.pass} pass</span>
          <span className="text-red-400 font-medium">{pStats.fail} fail</span>
          <span className="text-amber-400 font-medium">{pStats.inProgress} in progress</span>
          <span className="text-gray-500">{pStats.na} N/A</span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {CATEGORIES.map((cat) => {
            const cs = categoryPageStats(page, cat)
            const isOpen = expandedCats.has(cat.id)
            return (
              <div key={cat.id} className="border-b border-gray-800">
                <button
                  onClick={() => toggleCat(cat.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-900 transition-colors"
                >
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cat.colorClass}`}>{cat.name}</span>
                  <div className="flex-1 flex items-center gap-2 text-xs">
                    {cs.fail > 0 && <span className="text-red-400 font-medium">{cs.fail} fail</span>}
                    {cs.pass > 0 && <span className="text-green-400">{cs.pass} pass</span>}
                    {cs.inProgress > 0 && <span className="text-amber-400">{cs.inProgress} in prog</span>}
                  </div>
                  <span className="text-gray-500 text-xs">{isOpen ? '▾' : '▸'}</span>
                </button>
                {isOpen && (
                  <div className="bg-gray-900/50 divide-y divide-gray-800">
                    {cat.checks.map((check) => {
                      const status = page.checks[check.id] || 'not-started'
                      return (
                        <div key={check.id} className="flex items-center gap-3 px-4 py-2.5">
                          <StatusDot status={status} onChange={(s) => onUpdateCheck(page.id, check.id, s)} />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-200">{check.name}</div>
                            <div className="text-xs text-gray-500 truncate">{check.description}</div>
                          </div>
                          <StatusBadge status={status} />
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-950">
      {pages.length === 0 ? (
        <div className="flex items-center justify-center py-20 text-gray-600 text-sm">
          {filter !== 'all' ? 'No pages match this filter.' : 'No pages yet — add one above.'}
        </div>
      ) : (
        <div className="divide-y divide-gray-800">
          {pages.map((page) => {
            const stats = pageStats(page)
            return (
              <button
                key={page.id}
                onClick={() => { setActivePage(page); setExpandedCats(new Set()) }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gray-950 hover:bg-gray-900 text-left transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-100 text-sm truncate">{page.name}</div>
                  {page.url && <div className="text-xs text-gray-500 truncate mt-0.5">{page.url}</div>}
                  <div className="flex gap-2 mt-1.5 text-xs">
                    {stats.fail > 0 && <span className="text-red-400 font-medium">{stats.fail} fail</span>}
                    {stats.inProgress > 0 && <span className="text-amber-400">{stats.inProgress} in prog</span>}
                    {stats.fail === 0 && stats.inProgress === 0 && stats.pass > 0 && (
                      <span className="text-green-400">{stats.pass} passed</span>
                    )}
                    {stats.fail === 0 && stats.inProgress === 0 && stats.pass === 0 && (
                      <span className="text-gray-600">Not started</span>
                    )}
                  </div>
                </div>
                <ScoreChip score={stats.score} active={stats.active} />
                <span className="text-gray-600">›</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ScoreChip({ score, active }) {
  if (active === 0) return <span className="text-xs text-gray-600">—</span>
  const cls = score === 100 ? 'bg-green-900/40 text-green-400' : score >= 80 ? 'bg-amber-900/40 text-amber-400' : 'bg-red-900/40 text-red-400'
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cls}`}>{score}%</span>
}
