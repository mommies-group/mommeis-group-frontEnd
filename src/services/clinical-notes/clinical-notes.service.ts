import { apiClient } from '../../lib/axios'
import { unwrapApiData } from '../../lib/api-response'
import type { ApiSuccessResponse } from '../../types/api.types'
import type {
  ClinicalNote,
  CreateClinicalNoteRequest,
  UpdateClinicalNoteRequest,
} from '../../types/patient.types'

export async function getClinicalNotes(
  childId: string,
  signal?: AbortSignal,
): Promise<ClinicalNote[]> {
  const response = await apiClient.get<ApiSuccessResponse<ClinicalNote[]>>(
    `/specialist/patients/${encodeURIComponent(childId)}/notes`,
    { signal },
  )
  return unwrapApiData(response)
}

export async function getClinicalNote(
  noteId: string,
  includeRemovedActivities = false,
  signal?: AbortSignal,
): Promise<ClinicalNote> {
  const response = await apiClient.get<ApiSuccessResponse<ClinicalNote>>(
    `/clinical-notes/${encodeURIComponent(noteId)}`,
    {
      params: includeRemovedActivities
        ? { includeRemovedActivities: true }
        : undefined,
      signal,
    },
  )
  return unwrapApiData(response)
}

export async function createClinicalNote(
  childId: string,
  payload: CreateClinicalNoteRequest,
): Promise<ClinicalNote> {
  const response = await apiClient.post<ApiSuccessResponse<ClinicalNote>>(
    `/specialist/patients/${encodeURIComponent(childId)}/notes`,
    payload,
  )
  return unwrapApiData(response)
}

export async function updateClinicalNote(
  noteId: string,
  payload: UpdateClinicalNoteRequest,
): Promise<ClinicalNote> {
  const response = await apiClient.put<ApiSuccessResponse<ClinicalNote>>(
    `/clinical-notes/${encodeURIComponent(noteId)}`,
    payload,
  )
  return unwrapApiData(response)
}

export async function deleteClinicalNote(
  noteId: string,
): Promise<ClinicalNote> {
  const response = await apiClient.delete<ApiSuccessResponse<ClinicalNote>>(
    `/clinical-notes/${encodeURIComponent(noteId)}`,
  )
  return unwrapApiData(response)
}
