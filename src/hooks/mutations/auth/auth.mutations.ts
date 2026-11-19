import { useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { clearAuthToken, setAuthToken } from '../../../lib/auth-token'
import { queryKeys } from '../../../lib/query-keys'
import { ROUTES } from '../../../router/routes'
import { login } from '../../../services/auth/auth.service'
import type { LoginRequest } from '../../../types/auth.types'

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: LoginRequest) => login(payload),
    onSuccess: (data) => {
      setAuthToken(data.token)
      void queryClient.invalidateQueries({
        queryKey: queryKeys.auth.currentUser,
      })
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useCallback(() => {
    clearAuthToken()
    queryClient.clear()
    navigate(ROUTES.login, { replace: true })
  }, [queryClient, navigate])
}
