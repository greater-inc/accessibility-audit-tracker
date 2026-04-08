import { ALL_CHECKS } from '../data/checks'

export function pageStats(page) {
  const checks = ALL_CHECKS.map((c) => page.checks[c.id] || 'not-started')
  const total = checks.length
  const na = checks.filter((s) => s === 'na').length
  const pass = checks.filter((s) => s === 'pass').length
  const fail = checks.filter((s) => s === 'fail').length
  const inProgress = checks.filter((s) => s === 'in-progress').length
  const active = total - na
  const score = active > 0 ? Math.round((pass / active) * 100) : 100
  return { total, na, pass, fail, inProgress, active, score }
}

export function projectStats(project) {
  const pages = project.pages
  let totalPass = 0
  let totalFail = 0
  let totalInProgress = 0
  let totalNA = 0
  let totalActive = 0
  let pagesClear = 0

  pages.forEach((page) => {
    const s = pageStats(page)
    totalPass += s.pass
    totalFail += s.fail
    totalInProgress += s.inProgress
    totalNA += s.na
    totalActive += s.active
    if (s.fail === 0 && s.inProgress === 0 && s.active === s.pass) {
      pagesClear++
    }
  })

  const pctPassed = totalActive > 0 ? Math.round((totalPass / totalActive) * 100) : 0
  return {
    pageCount: pages.length,
    totalChecks: pages.length * ALL_CHECKS.length,
    totalActive,
    totalPass,
    totalFail,
    totalInProgress,
    totalNA,
    pctPassed,
    pagesClear,
  }
}

export function categoryPageStats(page, category) {
  const checks = category.checks.map((c) => page.checks[c.id] || 'not-started')
  const pass = checks.filter((s) => s === 'pass').length
  const fail = checks.filter((s) => s === 'fail').length
  const inProgress = checks.filter((s) => s === 'in-progress').length
  const na = checks.filter((s) => s === 'na').length
  return { pass, fail, inProgress, na, total: checks.length }
}
