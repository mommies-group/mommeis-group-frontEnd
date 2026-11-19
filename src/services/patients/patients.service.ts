import { apiClient } from '../../lib/axios'
import { unwrapApiData } from '../../lib/api-response'
import type { ApiSuccessResponse } from '../../types/api.types'
import type { ClinicalRecord, Patient } from '../../types/patient.types'

export async function getPatients(signal?: AbortSignal): Promise<Patient[]> {
  const response = await apiClient.get<ApiSuccessResponse<Patient[]>>(
    '/specialist/patients',
    { signal },
  )
  return unwrapApiData(response)
}

export async function getPatientById(
  childId: string,
  signal?: AbortSignal,
): Promise<Patient> {
  const response = await apiClient.get<ApiSuccessResponse<Patient>>(
    `/specialist/patients/${encodeURIComponent(childId)}`,
    { signal },
  )
  return unwrapApiData(response)
}

export async function getClinicalRecord(
  childId: string,
  signal?: AbortSignal,
): Promise<ClinicalRecord> {
  const response = await apiClient.get<ApiSuccessResponse<ClinicalRecord>>(
    `/specialist/patients/${encodeURIComponent(childId)}/clinical-record`,
    { signal },
  )
  return unwrapApiData(response)
}
