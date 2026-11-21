import toast from 'react-hot-toast'
import { getApiErrorMessage } from './api-error'

export function notifySuccess(message: string) {
  toast.success(message)
}

export function notifyError(error: unknown, fallback?: string) {
  toast.error(fallback ?? getApiErrorMessage(error))
}

export function notifyMessage(message: string) {
  toast(message)
}

export const toasterOptions = {
  duration: 3500,
  style: {
    borderRadius: '12px',
    background: '#ffffff',
    color: '#0f172a',
    border: '1px solid #e2e8f0',
    boxShadow: '0 12px 30px -12px rgba(15, 23, 42, 0.28)',
    fontSize: '13px',
    fontWeight: 500,
    maxWidth: '380px',
    padding: '10px 14px',
  },
  success: {
    iconTheme: {
      primary: '#0f766e',
      secondary: '#ffffff',
    },
  },
  error: {
    iconTheme: {
      primary: '#be123c',
      secondary: '#ffffff',
    },
  },
} as const
