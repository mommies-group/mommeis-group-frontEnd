import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../../../lib/query-keys'
import {
  getClinicalNote,
  getClinicalNotes,
} from '../../../services/clinical-notes/clinical-notes.service'

export function useClinicalNotes(childId: string | null) {
  return useQuery({
    queryKey: queryKeys.patients.notes(childId ?? ''),
    queryFn: ({ signal }) => getClinicalNotes(childId as string, signal),
    enabled: Boolean(childId),
  })
}

export function useClinicalNote(noteId: string | null) {
  return useQuery({
    queryKey: queryKeys.clinicalNotes.detail(noteId ?? ''),
    queryFn: ({ signal }) =>
      getClinicalNote(noteId as string, true, signal),
    enabled: Boolean(noteId),
  })
}
