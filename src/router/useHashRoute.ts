import { useEffect, useState } from 'react'

const DEFAULT_PATH = '/login'

function readPath(): string {
  const raw = window.location.hash.replace(/^#/, '')

  if (!raw) {
    return DEFAULT_PATH
  }

  return raw.startsWith('/') ? raw : `/${raw}`
}

export function navigate(path: string) {
  if (readPath() === path) {
    return
  }
  window.location.hash = path
}

export function useHashRoute(): string {
  const [path, setPath] = useState(readPath)

  useEffect(() => {
    if (!window.location.hash) {
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${window.location.search}#${DEFAULT_PATH}`,
      )
    }

    const handleChange = () => setPath(readPath())
    window.addEventListener('hashchange', handleChange)

    return () => window.removeEventListener('hashchange', handleChange)
  }, [])

  return path
}
