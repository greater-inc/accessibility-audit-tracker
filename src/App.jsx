import { useState, useEffect } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useFirestoreProjects } from './hooks/useFirestoreProjects'
import { createProject, createPage } from './utils/factories'
import ProjectList from './components/ProjectList'
import AuditView from './components/AuditView'
import ClientView from './components/ClientView'

function parseHash() {
  const projectMatch = window.location.hash.match(/^#\/project\/(.+)$/)
  if (projectMatch) return { type: 'project', id: projectMatch[1] }
  const shareMatch = window.location.hash.match(/^#\/share\/(.+)$/)
  if (shareMatch) return { type: 'share', token: shareMatch[1] }
  return { type: 'list' }
}

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

export default function App() {
  const [projects, setProjects, loading] = useFirestoreProjects()
  const [route, setRoute] = useState(parseHash)
  const [isDark, setIsDark] = useLocalStorage('a11y-dark-mode', true)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  useEffect(() => {
    let newHash = '#'
    if (route.type === 'project') newHash = `#/project/${route.id}`
    if (route.type === 'share') newHash = `#/share/${route.token}`
    if (window.location.hash !== newHash) window.location.hash = newHash
  }, [route])

  useEffect(() => {
    function onHashChange() {
      setRoute(parseHash())
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  if (loading) return null

  // --- Share / read-only view ---
  if (route.type === 'share') {
    const sharedProject = projects.find((p) => p.shareToken === route.token)
    if (!sharedProject) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-400">
          <div className="text-center">
            <div className="text-5xl mb-4">🔒</div>
            <p className="text-lg font-medium text-gray-300">Link not found</p>
            <p className="text-sm mt-1">This client link may have expired or been removed.</p>
          </div>
        </div>
      )
    }
    return <ClientView project={sharedProject} />
  }

  const activeProjectId = route.type === 'project' ? route.id : null
  const activeProject = projects.find((p) => p.id === activeProjectId)

  function addProject(name) {
    setProjects((prev) => [...prev, createProject(name)])
  }
  function deleteProject(id) {
    setProjects((prev) => prev.filter((p) => p.id !== id))
    if (activeProjectId === id) setRoute({ type: 'list' })
  }
  function renameProject(id, name) {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)))
  }

  function updateActive(updater) {
    setProjects((prev) =>
      prev.map((p) => (p.id === activeProjectId ? updater(p) : p)),
    )
  }
  function addPage(name, url) {
    updateActive((p) => ({ ...p, pages: [...p.pages, createPage(name, url)] }))
  }
  function deletePage(pageId) {
    updateActive((p) => ({ ...p, pages: p.pages.filter((pg) => pg.id !== pageId) }))
  }
  function renamePage(pageId, name) {
    updateActive((p) => ({
      ...p,
      pages: p.pages.map((pg) => (pg.id === pageId ? { ...pg, name } : pg)),
    }))
  }
  function updateCheck(pageId, checkId, status) {
    updateActive((p) => ({
      ...p,
      pages: p.pages.map((pg) =>
        pg.id === pageId ? { ...pg, checks: { ...pg.checks, [checkId]: status } } : pg,
      ),
    }))
  }
  function updateNotes(pageId, notes) {
    updateActive((p) => ({
      ...p,
      pages: p.pages.map((pg) => (pg.id === pageId ? { ...pg, notes } : pg)),
    }))
  }
  function addScreenshot(pageId, screenshot) {
    updateActive((p) => ({
      ...p,
      pages: p.pages.map((pg) =>
        pg.id === pageId
          ? { ...pg, screenshots: [...(pg.screenshots ?? []), screenshot] }
          : pg,
      ),
    }))
  }
  function removeScreenshot(pageId, screenshotId) {
    updateActive((p) => ({
      ...p,
      pages: p.pages.map((pg) =>
        pg.id === pageId
          ? { ...pg, screenshots: (pg.screenshots ?? []).filter((s) => s.id !== screenshotId) }
          : pg,
      ),
    }))
  }
  function ensureShareToken(projectId) {
    const token = crypto.randomUUID()
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, shareToken: token } : p)),
    )
    return token
  }

  if (!activeProject) {
    return (
      <ProjectList
        projects={projects}
        isDark={isDark}
        onToggleDark={() => setIsDark((d) => !d)}
        onSelect={(id) => setRoute({ type: 'project', id })}
        onAdd={addProject}
        onDelete={deleteProject}
        onRename={renameProject}
      />
    )
  }

  return (
    <AuditView
      project={activeProject}
      isDark={isDark}
      onToggleDark={() => setIsDark((d) => !d)}
      onBack={() => setRoute({ type: 'list' })}
      onAddPage={addPage}
      onDeletePage={deletePage}
      onUpdateCheck={updateCheck}
      onUpdateNotes={updateNotes}
      onRenamePage={renamePage}
      onAddScreenshot={addScreenshot}
      onRemoveScreenshot={removeScreenshot}
      onEnsureShareToken={ensureShareToken}
    />
  )
}
