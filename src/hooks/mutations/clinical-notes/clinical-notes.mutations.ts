import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../../../lib/query-keys'
import { createClinicalNote } from '../../../services/clinical-notes/clinical-notes.service'

type CreateClinicalNoteVariables = {
  childId: string
  content: string
}

export function useCreateClinicalNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ childId, content }: CreateClinicalNoteVariables) =>
      createClinicalNote(childId, { content }),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.patients.notes(variables.childId),
      })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.patients.record(variables.childId),
      })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.summary,
      })
    },
  })
}
