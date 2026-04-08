import { useState, useEffect } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { createProject, createPage } from './utils/factories'
import ProjectList from './components/ProjectList'
import AuditView from './components/AuditView'

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function getHashSlug() {
  const m = window.location.hash.match(/^#\/project\/(.+)$/)
  return m ? m[1] : null
}

export default function App() {
  const [projects, setProjects] = useLocalStorage('a11y-projects', [])
  const [activeProjectId, setActiveProjectId] = useState(null)
  const [isDark, setIsDark] = useLocalStorage('a11y-dark-mode', true)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  // Sync hash → active project (on load and hash changes)
  useEffect(() => {
    function resolve() {
      const slug = getHashSlug()
      if (!slug) { setActiveProjectId(null); return }
      const match = projects.find((p) => slugify(p.name) === slug)
      setActiveProjectId(match ? match.id : null)
    }
    resolve()
    window.addEventListener('hashchange', resolve)
    return () => window.removeEventListener('hashchange', resolve)
  }, [projects])

  // Sync active project → hash
  useEffect(() => {
    const project = projects.find((p) => p.id === activeProjectId)
    const newHash = project ? `#/project/${slugify(project.name)}` : '#'
    if (window.location.hash !== newHash) window.location.hash = newHash
  }, [activeProjectId, projects])

  const activeProject = projects.find((p) => p.id === activeProjectId)

  function addProject(name) {
    setProjects((prev) => [...prev, createProject(name)])
  }
  function deleteProject(id) {
    setProjects((prev) => prev.filter((p) => p.id !== id))
    if (activeProjectId === id) setActiveProjectId(null)
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

  if (!activeProject) {
    return (
      <ProjectList
        projects={projects}
        isDark={isDark}
        onToggleDark={() => setIsDark((d) => !d)}
        onSelect={setActiveProjectId}
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
      onBack={() => setActiveProjectId(null)}
      onAddPage={addPage}
      onDeletePage={deletePage}
      onUpdateCheck={updateCheck}
      onUpdateNotes={updateNotes}
      onRenamePage={renamePage}
    />
  )
}
