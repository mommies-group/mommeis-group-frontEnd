import { apiClient } from '../../lib/axios'
import { unwrapApiData } from '../../lib/api-response'
import type { ApiSuccessResponse } from '../../types/api.types'
import type {
  Activity,
  CreateActivityRequest,
  UpdateActivityRequest,
} from '../../types/activity.types'

export async function getActivities(
  signal?: AbortSignal,
): Promise<Activity[]> {
  const response = await apiClient.get<ApiSuccessResponse<Activity[]>>(
    '/specialist/activities',
    { signal },
  )
  return unwrapApiData(response)
}

export async function createActivity(
  childId: string,
  payload: CreateActivityRequest,
): Promise<Activity> {
  const response = await apiClient.post<ApiSuccessResponse<Activity>>(
    `/specialist/patients/${encodeURIComponent(childId)}/activities`,
    payload,
  )
  return unwrapApiData(response)
}

export async function updateActivity(
  id: string,
  payload: UpdateActivityRequest,
): Promise<Activity> {
  const response = await apiClient.patch<ApiSuccessResponse<Activity>>(
    `/specialist/activities/${encodeURIComponent(id)}`,
    payload,
  )
  return unwrapApiData(response)
}

export async function retractActivity(id: string): Promise<Activity> {
  const response = await apiClient.post<ApiSuccessResponse<Activity>>(
    `/specialist/activities/${encodeURIComponent(id)}/retract`,
  )
  return unwrapApiData(response)
}
