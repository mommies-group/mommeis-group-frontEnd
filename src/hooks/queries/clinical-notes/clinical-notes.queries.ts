import { useQueries, useQuery } from '@tanstack/react-query'
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

export function useClinicalNoteChildMap(noteIds: string[]) {
  const queries = useQueries({
    queries: noteIds.map((noteId) => ({
      queryKey: queryKeys.clinicalNotes.detail(noteId),
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        getClinicalNote(noteId, true, signal),
      staleTime: 5 * 60_000,
      refetchOnWindowFocus: false,
    })),
  })

  const childIdByNoteId: Record<string, string> = {}
  noteIds.forEach((noteId, index) => {
    const childId = queries[index]?.data?.childId
    if (childId) {
      childIdByNoteId[noteId] = childId
    }
  })

  return childIdByNoteId
}
