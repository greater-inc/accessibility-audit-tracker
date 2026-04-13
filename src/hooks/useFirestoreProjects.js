import { useState, useEffect, useCallback } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

const REF = doc(db, 'a11y', 'projects')

export function useFirestoreProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(REF, (snap) => {
      setProjects(snap.exists() ? (snap.data().list ?? []) : [])
      setLoading(false)
    })
    return unsub
  }, [])

  const saveProjects = useCallback((updater) => {
    setProjects((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      setDoc(REF, { list: next })
      return next
    })
  }, [])

  return [projects, saveProjects, loading]
}
