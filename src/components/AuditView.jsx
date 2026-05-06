import { useState } from 'react'
import Dashboard from './Dashboard'
import AuditTable from './AuditTable'
import MobileView from './MobileView'
import ThemeToggle from './ThemeToggle'
import { exportProjectCSV } from '../utils/csvExport'

const FILTERS = [
  { id: 'all', label: 'All pages' },
  { id: 'failures', label: 'Has failures' },
  { id: 'clear', label: 'All clear' },
]

export default function AuditView({
  project, isDark, onToggleDark, onBack,
  onAddPage, onDeletePage, onUpdateCheck, onUpdateNotes, onRenamePage,
  onAddScreenshot, onRemoveScreenshot, onEnsureShareToken,
}) {
  const [filter, setFilter] = useState('all')
  const [showAddPage, setShowAddPage] = useState(false)
  const [newPageName, setNewPageName] = useState('')
  const [newPageUrl, setNewPageUrl] = useState('')
  const [linkCopied, setLinkCopied] = useState(false)

  function handleAddPage(e) {
    e.preventDefault()
    const name = newPageName.trim()
    if (!name) return
    onAddPage(name, newPageUrl.trim())
    setNewPageName('')
    setNewPageUrl('')
    setShowAddPage(false)
  }

  function handleCopyClientLink() {
    const token = project.shareToken || onEnsureShareToken(project.id)
    const url = `https://greater-inc.github.io/accessview/#${token}`
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    })
  }

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-950 transition-colors overflow-hidden">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center gap-3 shrink-0">
        <button
          onClick={onBack}
          className="text-blue-500 hover:text-blue-400 text-sm font-medium flex items-center gap-1 shrink-0"
        >
          <span className="hidden sm:inline">←</span> Projects
        </button>
        <span className="text-gray-600 dark:text-gray-700 hidden sm:inline">/</span>
        <h1 className="font-semibold text-gray-900 dark:text-gray-100 truncate flex-1 text-sm sm:text-base">
          {project.name}
        </h1>
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          <button
            onClick={handleCopyClientLink}
            className={`text-xs border px-3 py-1.5 rounded-lg transition-colors font-medium ${
              linkCopied
                ? 'border-green-500 text-green-400 bg-green-900/20'
                : 'text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
            title="Copy a read-only link for clients"
          >
            {linkCopied ? 'Link copied!' : 'Client link'}
          </button>
          <button
            onClick={() => exportProjectCSV(project)}
            className="text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
          >
            Export CSV
          </button>
          <button
            onClick={() => setShowAddPage(!showAddPage)}
            className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
          >
            + Add page
          </button>
          <ThemeToggle isDark={isDark} onToggle={onToggleDark} />
        </div>
      </header>

      {/* Add page form */}
      {showAddPage && (
        <div className="bg-blue-950/30 border-b border-blue-900/40 px-4 py-3 shrink-0">
          <form onSubmit={handleAddPage} className="flex flex-wrap gap-2 max-w-2xl">
            <input
              autoFocus
              value={newPageName}
              onChange={(e) => setNewPageName(e.target.value)}
              placeholder="Page name, e.g. Home, About, Contact…"
              className="flex-1 min-w-[160px] border border-gray-600 dark:border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-500 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              value={newPageUrl}
              onChange={(e) => setNewPageUrl(e.target.value)}
              placeholder="URL (optional)"
              type="url"
              className="flex-1 min-w-[160px] border border-gray-600 dark:border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-500 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!newPageName.trim()}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium disabled:opacity-40 transition-colors"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => { setShowAddPage(false); setNewPageName(''); setNewPageUrl('') }}
              className="text-sm text-gray-400 hover:text-gray-300 px-2"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Dashboard */}
      <Dashboard project={project} />

      {/* Filter bar */}
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

      {/* Desktop table */}
      <div className="hidden md:flex flex-col flex-1 overflow-hidden">
        <AuditTable
          project={project}
          filter={filter}
          onUpdateCheck={onUpdateCheck}
          onUpdateNotes={onUpdateNotes}
          onDeletePage={onDeletePage}
          onRenamePage={onRenamePage}
          onAddScreenshot={onAddScreenshot}
          onRemoveScreenshot={onRemoveScreenshot}
        />
      </div>

      {/* Mobile */}
      <div className="md:hidden flex flex-col flex-1 overflow-hidden">
        <MobileView
          project={project}
          filter={filter}
          onUpdateCheck={onUpdateCheck}
          onUpdateNotes={onUpdateNotes}
          onDeletePage={onDeletePage}
        />
      </div>
    </div>
  )
}
