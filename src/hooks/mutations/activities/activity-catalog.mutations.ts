import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../../../lib/query-keys'
import {
  attachActivitiesToNote,
  createCustomActivity,
  deactivateCustomActivity,
  updateCustomActivity,
} from '../../../services/activities/activity-catalog.service'
import type {
  AttachActivitiesRequest,
  CreateCustomActivityRequest,
  UpdateCustomActivityRequest,
} from '../../../types/activity-catalog.types'

function useInvalidateCatalog() {
  const queryClient = useQueryClient()

  return () => {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.activityCatalog.all,
    })
    void queryClient.invalidateQueries({
      queryKey: queryKeys.dashboard.summary,
    })
  }
}

export function useCreateCustomActivity() {
  const invalidate = useInvalidateCatalog()

  return useMutation({
    mutationFn: (payload: CreateCustomActivityRequest) =>
      createCustomActivity(payload),
    onSuccess: invalidate,
  })
}

export function useUpdateCustomActivity() {
  const invalidate = useInvalidateCatalog()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: UpdateCustomActivityRequest
    }) => updateCustomActivity(id, payload),
    onSuccess: invalidate,
  })
}

export function useDeactivateCustomActivity() {
  const invalidate = useInvalidateCatalog()

  return useMutation({
    mutationFn: (id: string) => deactivateCustomActivity(id),
    onSuccess: invalidate,
  })
}

export function useAttachActivitiesToNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      noteId,
      payload,
    }: {
      noteId: string
      payload: AttachActivitiesRequest
    }) => attachActivitiesToNote(noteId, payload),
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.activityCatalog.noteActivities(variables.noteId),
      })
      void queryClient.invalidateQueries({ queryKey: queryKeys.patients.all })
    },
  })
}
