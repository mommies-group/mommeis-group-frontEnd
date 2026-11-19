import { useSyncExternalStore } from 'react'

const TOKEN_STORAGE_KEY = 'mindbloom.specialist.auth.token'

export const AUTH_UNAUTHORIZED_EVENT = 'mindbloom:auth:unauthorized'

const tokenListeners = new Set<() => void>()
let fallbackToken: string | null = null

function notifyTokenListeners() {
  tokenListeners.forEach((listener) => listener())
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY)
  } catch {
    return fallbackToken
  }
}

export function setAuthToken(token: string) {
  fallbackToken = token

  try {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token)
  } catch {
    // The in-memory fallback keeps the current tab usable when storage is blocked.
  }

  notifyTokenListeners()
}

export function clearAuthToken() {
  fallbackToken = null

  try {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY)
  } catch {
    // Nothing else to clear when storage is unavailable.
  }

  notifyTokenListeners()
}

function subscribeToToken(listener: () => void) {
  tokenListeners.add(listener)

  const handleStorage = (event: StorageEvent) => {
    if (event.key === TOKEN_STORAGE_KEY) {
      listener()
    }
  }

  window.addEventListener('storage', handleStorage)

  return () => {
    tokenListeners.delete(listener)
    window.removeEventListener('storage', handleStorage)
  }
}

export function useAuthToken(): string | null {
  return useSyncExternalStore(subscribeToToken, getAuthToken, () => null)
}

export function notifyUnauthorized() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT))
  }
}
