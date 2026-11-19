import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../../../lib/query-keys'
import {
  getClinicalRecord,
  getPatientById,
  getPatients,
} from '../../../services/patients/patients.service'

export function usePatients() {
  return useQuery({
    queryKey: queryKeys.patients.list,
    queryFn: ({ signal }) => getPatients(signal),
    staleTime: 60_000,
  })
}

export function usePatientById(childId: string | null) {
  return useQuery({
    queryKey: queryKeys.patients.detail(childId ?? ''),
    queryFn: ({ signal }) => getPatientById(childId as string, signal),
    enabled: Boolean(childId),
  })
}

export function useClinicalRecord(childId: string | null) {
  return useQuery({
    queryKey: queryKeys.patients.record(childId ?? ''),
    queryFn: ({ signal }) => getClinicalRecord(childId as string, signal),
    enabled: Boolean(childId),
  })
}
