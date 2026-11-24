import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../../../lib/query-keys'
import {
  cancelTreatmentPlan,
  completeTreatmentSession,
  createTreatmentPlan,
  noShowTreatmentSession,
  submitTreatmentPlan,
  updateTreatmentPlan,
} from '../../../services/treatment-plans/treatment-plans.service'
import type {
  CreateTreatmentPlanRequest,
  UpdateTreatmentPlanRequest,
} from '../../../types/treatment-plan.types'

function useInvalidateTreatmentPlanViews() {
  const queryClient = useQueryClient()

  return (planId?: string) => {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.treatmentPlans.all,
    })
    void queryClient.invalidateQueries({
      queryKey: queryKeys.bookings.all,
    })
    void queryClient.invalidateQueries({
      queryKey: queryKeys.calendar.all,
    })
    void queryClient.invalidateQueries({
      queryKey: queryKeys.dashboard.summary,
    })
    if (planId) {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.treatmentPlans.detail(planId),
      })
    }
  }
}

export function useCreateTreatmentPlan() {
  const invalidate = useInvalidateTreatmentPlanViews()

  return useMutation({
    mutationFn: (payload: CreateTreatmentPlanRequest) =>
      createTreatmentPlan(payload),
    onSuccess: (plan) => invalidate(plan.id),
  })
}

export function useUpdateTreatmentPlan() {
  const invalidate = useInvalidateTreatmentPlanViews()

  return useMutation({
    mutationFn: ({
      planId,
      payload,
    }: {
      planId: string
      payload: UpdateTreatmentPlanRequest
    }) => updateTreatmentPlan(planId, payload),
    onSuccess: (plan) => invalidate(plan.id),
  })
}

export function useSubmitTreatmentPlan() {
  const invalidate = useInvalidateTreatmentPlanViews()

  return useMutation({
    mutationFn: (planId: string) => submitTreatmentPlan(planId),
    onSuccess: (plan) => invalidate(plan.id),
  })
}

export function useCompleteTreatmentSession() {
  const invalidate = useInvalidateTreatmentPlanViews()

  return useMutation({
    mutationFn: ({
      planId,
      sessionId,
      note,
    }: {
      planId: string
      sessionId: string
      note: string
    }) => completeTreatmentSession(planId, sessionId, note),
    onSuccess: (_, variables) => invalidate(variables.planId),
  })
}

export function useNoShowTreatmentSession() {
  const invalidate = useInvalidateTreatmentPlanViews()

  return useMutation({
    mutationFn: ({
      planId,
      sessionId,
      note,
    }: {
      planId: string
      sessionId: string
      note: string
    }) => noShowTreatmentSession(planId, sessionId, note),
    onSuccess: (_, variables) => invalidate(variables.planId),
  })
}

export function useCancelTreatmentPlan() {
  const invalidate = useInvalidateTreatmentPlanViews()

  return useMutation({
    mutationFn: ({
      planId,
      reason,
    }: {
      planId: string
      reason: string
    }) => cancelTreatmentPlan(planId, reason),
    onSuccess: (plan) => invalidate(plan.id),
  })
}
