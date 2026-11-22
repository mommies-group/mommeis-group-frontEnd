import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../../../lib/query-keys'
import {
  createClinicalNote,
  deleteClinicalNote,
  updateClinicalNote,
} from '../../../services/clinical-notes/clinical-notes.service'
import type {
  CreateClinicalNoteRequest,
  UpdateClinicalNoteRequest,
} from '../../../types/patient.types'

type CreateClinicalNoteVariables = {
  childId: string
  payload: CreateClinicalNoteRequest
}

type UpdateClinicalNoteVariables = {
  noteId: string
  payload: UpdateClinicalNoteRequest
}

function useInvalidateNoteViews() {
  const queryClient = useQueryClient()

  return (noteId: string) => {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.patients.notesAll,
    })
    void queryClient.invalidateQueries({
      queryKey: queryKeys.patients.records(),
    })
    void queryClient.invalidateQueries({
      queryKey: queryKeys.dashboard.summary,
    })
    void queryClient.invalidateQueries({
      queryKey: queryKeys.clinicalNotes.detail(noteId),
    })
  }
}

export function useCreateClinicalNote() {
  const queryClient = useQueryClient()
  const invalidate = useInvalidateNoteViews()

  return useMutation({
    mutationFn: ({ childId, payload }: CreateClinicalNoteVariables) =>
      createClinicalNote(childId, payload),
    onSuccess: (note, variables) => {
      invalidate(note.id)
      void queryClient.invalidateQueries({
        queryKey: queryKeys.patients.record(variables.childId),
      })
    },
  })
}

export function useUpdateClinicalNote() {
  const invalidate = useInvalidateNoteViews()

  return useMutation({
    mutationFn: ({ noteId, payload }: UpdateClinicalNoteVariables) =>
      updateClinicalNote(noteId, payload),
    onSuccess: (_, variables) => invalidate(variables.noteId),
  })
}

export function useDeleteClinicalNote() {
  const invalidate = useInvalidateNoteViews()

  return useMutation({
    mutationFn: ({ noteId }: { noteId: string }) => deleteClinicalNote(noteId),
    onSuccess: (_, variables) => invalidate(variables.noteId),
  })
}
