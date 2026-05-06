import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { onSnapshot } from 'firebase/firestore'
import { doc } from 'firebase/firestore'
import { db } from './firebase'
import ClientView from './components/ClientView'
import './index.css'

const token = window.location.hash.replace(/^#\/?/, '')

function ClientApp() {
  const [project, setProject] = useState(undefined) // undefined = loading

  useEffect(() => {
    if (!token) { setProject(null); return }
    const unsub = onSnapshot(doc(db, 'a11y', 'projects'), (snap) => {
      const list = snap.exists() ? (snap.data().list ?? []) : []
      setProject(list.find((p) => p.shareToken === token) ?? null)
    })
    return unsub
  }, [])

  if (project === undefined) return null

  if (!project) {
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

  return <ClientView project={project} />
}

document.documentElement.classList.add('dark')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClientApp />
  </StrictMode>,
)
