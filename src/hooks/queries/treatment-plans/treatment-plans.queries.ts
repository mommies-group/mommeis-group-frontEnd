import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../../../lib/query-keys'
import {
  getTreatmentPlan,
  getTreatmentPlanInvoice,
  getTreatmentPlanSession,
  getTreatmentPlanSessions,
  getTreatmentPlans,
  type TreatmentPlanFilters,
} from '../../../services/treatment-plans/treatment-plans.service'

export function useTreatmentPlans(
  page = 1,
  limit = 10,
  filters: TreatmentPlanFilters = {},
) {
  return useQuery({
    queryKey: [
      ...queryKeys.treatmentPlans.list(page, limit),
      filters.status ?? 'all',
      filters.childId ?? 'all',
    ] as const,
    queryFn: ({ signal }) => getTreatmentPlans(page, limit, filters, signal),
    refetchInterval: 5_000,
  })
}

export function useTreatmentPlan(planId: string | null) {
  return useQuery({
    queryKey: queryKeys.treatmentPlans.detail(planId ?? ''),
    queryFn: ({ signal }) => getTreatmentPlan(planId as string, signal),
    enabled: Boolean(planId),
    refetchInterval: 5_000,
  })
}

export function useTreatmentPlanSessions(planId: string | null) {
  return useQuery({
    queryKey: queryKeys.treatmentPlans.sessions(planId ?? ''),
    queryFn: ({ signal }) => getTreatmentPlanSessions(planId as string, signal),
    enabled: Boolean(planId),
    refetchInterval: 5_000,
  })
}

export function useTreatmentPlanSession(
  planId: string | null,
  sessionId: string | null,
) {
  return useQuery({
    queryKey: queryKeys.treatmentPlans.session(planId ?? '', sessionId ?? ''),
    queryFn: ({ signal }) =>
      getTreatmentPlanSession(planId as string, sessionId as string, signal),
    enabled: Boolean(planId && sessionId),
  })
}

export function useTreatmentPlanInvoice(planId: string | null) {
  return useQuery({
    queryKey: queryKeys.treatmentPlans.invoice(planId ?? ''),
    queryFn: ({ signal }) => getTreatmentPlanInvoice(planId as string, signal),
    enabled: Boolean(planId),
  })
}
