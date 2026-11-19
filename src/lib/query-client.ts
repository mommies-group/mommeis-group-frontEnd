import { QueryClient } from '@tanstack/react-query'
import { ApiError } from './api-error'

const nonRetryableStatuses = new Set([400, 401, 403, 404, 409, 422])

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: (failureCount, error) => {
        if ((error as { code?: string }).code === 'ERR_CANCELED') {
          return false
        }

        if (error instanceof ApiError) {
          if (error.status && nonRetryableStatuses.has(error.status)) {
            return false
          }

          if (!error.status) {
            return failureCount < 2
          }

          return failureCount < 1
        }

        return failureCount < 1
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
})
