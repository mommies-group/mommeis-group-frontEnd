import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../../../lib/query-keys'
import {
  createActivity,
  retractActivity,
  updateActivity,
} from '../../../services/activities/activities.service'
import type {
  CreateActivityRequest,
  UpdateActivityRequest,
} from '../../../types/activity.types'

function useInvalidateActivityQueries() {
  const queryClient = useQueryClient()

  return () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.activities.all })
    void queryClient.invalidateQueries({
      queryKey: queryKeys.dashboard.summary,
    })
  }
}

export function useCreateActivity() {
  const invalidate = useInvalidateActivityQueries()

  return useMutation({
    mutationFn: ({
      childId,
      payload,
    }: {
      childId: string
      payload: CreateActivityRequest
    }) => createActivity(childId, payload),
    onSuccess: invalidate,
  })
}

export function useUpdateActivity() {
  const invalidate = useInvalidateActivityQueries()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: UpdateActivityRequest
    }) => updateActivity(id, payload),
    onSuccess: invalidate,
  })
}

export function useRetractActivity() {
  const invalidate = useInvalidateActivityQueries()

  return useMutation({
    mutationFn: (id: string) => retractActivity(id),
    onSuccess: invalidate,
  })
}
