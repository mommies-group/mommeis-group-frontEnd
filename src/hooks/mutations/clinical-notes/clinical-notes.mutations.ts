import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../../../lib/query-keys'
import { createClinicalNote } from '../../../services/clinical-notes/clinical-notes.service'
import type { CreateClinicalNoteRequest } from '../../../types/patient.types'

type CreateClinicalNoteVariables = {
  childId: string
  payload: CreateClinicalNoteRequest
}

export function useCreateClinicalNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ childId, payload }: CreateClinicalNoteVariables) =>
      createClinicalNote(childId, payload),
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
