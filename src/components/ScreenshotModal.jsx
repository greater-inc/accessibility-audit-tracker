import { useRef, useState } from 'react'
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '../firebase'

export default function ScreenshotModal({ projectId, page, onClose, onAdd, onRemove }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [lightbox, setLightbox] = useState(null)

  async function handleFiles(files) {
    if (!files?.length) return
    setError(null)

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        setError('Only image files are supported.')
        continue
      }
      const id = Math.random().toString(36).slice(2, 10)
      const path = `screenshots/${projectId}/${page.id}/${id}_${file.name}`
      const storageRef = ref(storage, path)
      const task = uploadBytesResumable(storageRef, file)

      setUploading(true)
      setProgress(0)

      await new Promise((resolve, reject) => {
        task.on(
          'state_changed',
          (snap) => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
          (err) => { setError(err.message); reject(err) },
          async () => {
            const url = await getDownloadURL(task.snapshot.ref)
            onAdd(page.id, { id, url, name: file.name, path, uploadedAt: new Date().toISOString() })
            resolve()
          },
        )
      }).catch(() => {})
    }

    setUploading(false)
    setProgress(0)
  }

  async function handleRemove(shot) {
    try {
      await deleteObject(ref(storage, shot.path))
    } catch {
      // If the file is already gone, still remove from data
    }
    onRemove(page.id, shot.id)
  }

  function handleDrop(e) {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  const shots = page.screenshots ?? []

  return (
    <>
      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox.url}
            alt={lightbox.name}
            className="max-w-full max-h-full object-contain rounded shadow-2xl"
          />
          <button
            className="absolute top-4 right-4 text-white text-2xl leading-none hover:text-gray-300"
            onClick={() => setLightbox(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Modal */}
      <div
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl w-full max-w-xl p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Screenshots — {page.name}</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Proof of accessibility for this page</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-200 text-xl leading-none">✕</button>
          </div>

          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => !uploading && inputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-colors mb-4"
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            {uploading ? (
              <div>
                <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden w-full max-w-xs mx-auto mb-2">
                  <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-sm text-gray-400">Uploading… {progress}%</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 dark:text-gray-400">Drop images here or <span className="text-blue-500">click to upload</span></p>
                <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">PNG, JPG, WebP, GIF supported</p>
              </>
            )}
          </div>

          {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

          {/* Thumbnails */}
          {shots.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-600 text-center py-4">No screenshots yet.</p>
          ) : (
            <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto">
              {shots.map((shot) => (
                <div key={shot.id} className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                  <img
                    src={shot.url}
                    alt={shot.name}
                    className="w-full h-24 object-cover cursor-pointer"
                    onClick={() => setLightbox(shot)}
                    title={shot.name}
                  />
                  <button
                    onClick={() => handleRemove(shot)}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    title="Remove screenshot"
                  >
                    ✕
                  </button>
                  <div className="px-1.5 py-1 text-[10px] text-gray-500 dark:text-gray-400 truncate">{shot.name}</div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end mt-4">
            <button onClick={onClose} className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg font-medium">Done</button>
          </div>
        </div>
      </div>
    </>
  )
}
