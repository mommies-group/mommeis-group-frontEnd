import axios from 'axios'
import type { AxiosError } from 'axios'
import type { ApiErrorBody } from '../types/api.types'
import {
  AUTH_UNAUTHORIZED_EVENT,
  clearAuthToken,
  getAuthToken,
} from './auth-token'
import { ApiError, getCodeMessage } from './api-error'

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

if (!configuredBaseUrl) {
  throw new Error(
    'Missing VITE_API_BASE_URL. Add it to your local .env file before starting the specialist portal.',
  )
}

export const API_ORIGIN = configuredBaseUrl.replace(/\/+$/, '')
export const API_BASE_URL = `${API_ORIGIN}/api/v1`

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20_000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken()

  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }

  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    // The browser must generate the multipart boundary itself.
    config.headers.delete('Content-Type')
  }

  return config
})

function normalizeCode(error: AxiosError<ApiErrorBody>): string {
  const serverCode = error.response?.data?.error?.code

  if (serverCode) {
    return serverCode
  }

  if (error.response?.status) {
    return `HTTP_${error.response.status}`
  }

  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return 'TIMEOUT'
  }

  return 'NETWORK_ERROR'
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error)
    }

    const status = error.response?.status
    const code = normalizeCode(error)
    const rawServerMessage = error.response?.data?.message
    const serverMessage =
      typeof rawServerMessage === 'string' && (!status || status < 500)
        ? rawServerMessage.trim()
        : ''
    const message =
      getCodeMessage(code) ??
      (serverMessage || null) ??
      (status
        ? 'The request could not be completed. Please try again.'
        : getCodeMessage('NETWORK_ERROR')) ??
      'Unable to reach the MindBloom service. Check your connection and try again.'

    const normalized = new ApiError(message, status, code, {
      body: error.response?.data,
    })

    const requestUrl = error.config?.url ?? ''
    const isLoginRequest = requestUrl.includes('/auth/login')

    if (status === 401 && !isLoginRequest) {
      clearAuthToken()

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT))
      }
    }

    return Promise.reject(normalized)
  },
)
