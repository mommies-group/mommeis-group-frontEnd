import { apiClient } from '../../lib/axios'
import { unwrapApiData } from '../../lib/api-response'
import type { ApiSuccessResponse } from '../../types/api.types'
import type {
  AttachActivitiesRequest,
  CatalogActivity,
  CatalogActivityFilters,
  CreateCustomActivityRequest,
  UpdateCustomActivityRequest,
} from '../../types/activity-catalog.types'

export async function getCatalogActivities({
  source,
  category,
  developmentalArea,
  ageMonths,
  search,
  signal,
}: CatalogActivityFilters = {}): Promise<CatalogActivity[]> {
  const response = await apiClient.get<ApiSuccessResponse<CatalogActivity[]>>(
    '/activities',
    {
      signal,
      params: {
        source: source && source !== 'all' ? source : undefined,
        category,
        developmentalArea,
        ageMonths,
        search,
      },
    },
  )
  return unwrapApiData(response)
}

export async function getCatalogActivity(id: string): Promise<CatalogActivity> {
  const response = await apiClient.get<ApiSuccessResponse<CatalogActivity>>(
    `/activities/${encodeURIComponent(id)}`,
  )
  return unwrapApiData(response)
}

export async function createCustomActivity(
  payload: CreateCustomActivityRequest,
): Promise<CatalogActivity> {
  const response = await apiClient.post<ApiSuccessResponse<CatalogActivity>>(
    '/activities',
    payload,
  )
  return unwrapApiData(response)
}

export async function updateCustomActivity(
  id: string,
  payload: UpdateCustomActivityRequest,
): Promise<CatalogActivity> {
  const response = await apiClient.put<ApiSuccessResponse<CatalogActivity>>(
    `/activities/${encodeURIComponent(id)}`,
    payload,
  )
  return unwrapApiData(response)
}

export async function deactivateCustomActivity(
  id: string,
): Promise<CatalogActivity> {
  const response = await apiClient.delete<ApiSuccessResponse<CatalogActivity>>(
    `/activities/${encodeURIComponent(id)}`,
  )
  return unwrapApiData(response)
}

export async function getClinicalNoteActivities(
  noteId: string,
): Promise<CatalogActivity[]> {
  const response = await apiClient.get<ApiSuccessResponse<CatalogActivity[]>>(
    `/clinical-notes/${encodeURIComponent(noteId)}/activities`,
  )
  return unwrapApiData(response)
}

export async function attachActivitiesToNote(
  noteId: string,
  payload: AttachActivitiesRequest,
): Promise<CatalogActivity[]> {
  const response = await apiClient.post<ApiSuccessResponse<CatalogActivity[]>>(
    `/clinical-notes/${encodeURIComponent(noteId)}/activities`,
    payload,
  )
  return unwrapApiData(response)
}
