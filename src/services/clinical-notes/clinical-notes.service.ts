import { apiClient } from '../../lib/axios'
import { unwrapApiData } from '../../lib/api-response'
import type { ApiSuccessResponse } from '../../types/api.types'
import type {
  ClinicalNote,
  CreateClinicalNoteRequest,
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
