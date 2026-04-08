import { useRef } from 'react'
import { projectStats } from '../utils/stats'

export default function Dashboard({ project }) {
  const stats = projectStats(project)
  const scrollRef = useRef(null)

  function handleWheel(e) {
    if (e.deltaY !== 0) {
      e.preventDefault()
      scrollRef.current.scrollLeft += e.deltaY
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
      <div ref={scrollRef} onWheel={handleWheel} className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
        <StatCard label="Pages" value={stats.pageCount} />
        <StatCard
          label="Passed"
          value={`${stats.pctPassed}%`}
          sub={`${stats.totalPass} of ${stats.totalActive} active checks`}
          color={stats.pctPassed >= 90 ? 'green' : stats.pctPassed >= 60 ? 'amber' : 'red'}
        />
        <StatCard label="Failures" value={stats.totalFail} color={stats.totalFail === 0 ? 'green' : 'red'} />
        <StatCard label="In progress" value={stats.totalInProgress} color={stats.totalInProgress > 0 ? 'amber' : 'default'} />
        <StatCard
          label="Pages clear"
          value={`${stats.pagesClear} / ${stats.pageCount}`}
          color={stats.pagesClear === stats.pageCount && stats.pageCount > 0 ? 'green' : 'default'}
        />
        <StatCard label="N/A checks" value={stats.totalNA} />
      </div>

      {stats.pageCount > 0 && (
        <div className="mt-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">Overall progress</span>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{stats.pctPassed}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden w-full max-w-lg">
            <div
              className={`h-full rounded-full transition-all ${
                stats.pctPassed >= 90 ? 'bg-green-500' : stats.pctPassed >= 60 ? 'bg-amber-400' : 'bg-red-500'
              }`}
              style={{ width: `${stats.pctPassed}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

const colorMap = {
  green: 'text-green-400 bg-green-900/20 dark:text-green-400 dark:bg-green-900/20',
  red:   'text-red-400 bg-red-900/20 dark:text-red-400 dark:bg-red-900/20',
  amber: 'text-amber-400 bg-amber-900/20 dark:text-amber-400 dark:bg-amber-900/20',
  default: 'text-gray-300 dark:text-gray-400 bg-gray-100 dark:bg-gray-800',
}

function StatCard({ label, value, sub, color = 'default' }) {
  return (
    <div className={`flex flex-col px-4 py-2.5 rounded-lg shrink-0 ${colorMap[color]} min-w-[90px]`}>
      <span className="text-xs opacity-70 font-medium">{label}</span>
      <span className="text-xl font-bold leading-tight">{value}</span>
      {sub && <span className="text-xs opacity-60 mt-0.5">{sub}</span>}
    </div>
  )
}
