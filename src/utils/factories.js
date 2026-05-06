import { ALL_CHECKS } from '../data/checks'

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

export function createProject(name) {
  return { id: uid(), name, createdAt: new Date().toISOString(), pages: [], shareToken: uid() }
}

export function createPage(name, url = '') {
  const checks = {}
  ALL_CHECKS.forEach((c) => { checks[c.id] = 'not-started' })
  return { id: uid(), name, url, notes: '', checks, screenshots: [] }
}
