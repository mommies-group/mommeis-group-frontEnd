import { apiClient } from '../../lib/axios'
import { unwrapApiData } from '../../lib/api-response'
import type { ApiSuccessResponse } from '../../types/api.types'
import type {
  AvailabilitySlot,
  AvailabilitySlotInput,
  AvailabilitySlotPatch,
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

export async function createAvailabilitySlot(
  payload: AvailabilitySlotInput,
): Promise<AvailabilitySlot> {
  const response = await apiClient.post<ApiSuccessResponse<AvailabilitySlot>>(
    '/specialist/availability',
    payload,
  )
  return unwrapApiData(response)
}

export async function updateAvailabilitySlot(
  id: string,
  payload: AvailabilitySlotPatch,
): Promise<AvailabilitySlot> {
  const response = await apiClient.patch<ApiSuccessResponse<AvailabilitySlot>>(
    `/specialist/availability/${encodeURIComponent(id)}`,
    payload,
  )
  return unwrapApiData(response)
}

export async function deleteAvailabilitySlot(id: string): Promise<void> {
  await apiClient.delete(`/specialist/availability/${encodeURIComponent(id)}`)
}
