import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../../../lib/query-keys'
import { getClinicalNotes } from '../../../services/clinical-notes/clinical-notes.service'

export function useClinicalNotes(childId: string | null) {
  return useQuery({
    queryKey: queryKeys.patients.notes(childId ?? ''),
    queryFn: ({ signal }) => getClinicalNotes(childId as string, signal),
    enabled: Boolean(childId),
    staleTime: 15_000,
  })
}
