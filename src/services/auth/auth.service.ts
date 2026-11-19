import { apiClient } from '../../lib/axios'
import { unwrapApiData } from '../../lib/api-response'
import type { ApiSuccessResponse } from '../../types/api.types'
import type { LoginRequest, LoginResponse } from '../../types/auth.types'
import type { SpecialistProfile } from '../../types/profile.types'

export async function login(
  payload: LoginRequest,
  signal?: AbortSignal,
): Promise<LoginResponse> {
  const response = await apiClient.post<ApiSuccessResponse<LoginResponse>>(
    '/auth/login',
    payload,
    { signal },
  )
  return unwrapApiData(response)
}

export async function getCurrentUser(
  signal?: AbortSignal,
): Promise<SpecialistProfile> {
  const response = await apiClient.get<ApiSuccessResponse<SpecialistProfile>>(
    '/auth/me',
    { signal },
  )
  return unwrapApiData(response)
}
