import { apiClient } from '../../lib/axios'
import { unwrapApiData } from '../../lib/api-response'
import type { ApiSuccessResponse } from '../../types/api.types'
import type {
  AvailabilitySlot,
  AvailabilitySlotInput,
  SpecialistProfile,
  UpdateProfileRequest,
} from '../../types/profile.types'

export async function getProfile(
  signal?: AbortSignal,
): Promise<SpecialistProfile> {
  const response = await apiClient.get<ApiSuccessResponse<SpecialistProfile>>(
    '/specialist/profile',
    { signal },
  )
  return unwrapApiData(response)
}

export async function updateProfile(
  payload: UpdateProfileRequest,
): Promise<SpecialistProfile> {
  const response = await apiClient.patch<ApiSuccessResponse<SpecialistProfile>>(
    '/specialist/profile',
    payload,
  )
  return unwrapApiData(response)
}

export async function getAvailability(
  signal?: AbortSignal,
): Promise<AvailabilitySlot[]> {
  const response = await apiClient.get<ApiSuccessResponse<AvailabilitySlot[]>>(
    '/specialist/availability',
    { signal },
  )
  return unwrapApiData(response)
}

export async function replaceAvailability(
  slots: AvailabilitySlotInput[],
): Promise<AvailabilitySlot[]> {
  const response = await apiClient.put<ApiSuccessResponse<AvailabilitySlot[]>>(
    '/specialist/availability',
    { slots },
  )
  return unwrapApiData(response)
}
