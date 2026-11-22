import { apiClient } from '../../lib/axios'
import { ApiError } from '../../lib/api-error'
import { unwrapApiData } from '../../lib/api-response'
import type { ApiSuccessResponse } from '../../types/api.types'
import type {
  CompleteSessionResponse,
  CreateTreatmentPlanRequest,
  NoShowSessionResponse,
  TreatmentPlan,
  TreatmentPlanInvoice,
  TreatmentPlanList,
  TreatmentPlanSession,
  UpdateTreatmentPlanRequest,
} from '../../types/treatment-plan.types'

function basePath(planId: string): string {
  return `/specialist/treatment-plans/${encodeURIComponent(planId)}`
}

export type TreatmentPlanFilters = {
  status?: string
  childId?: string
}

export async function getTreatmentPlans(
  page = 1,
  limit = 10,
  filters: TreatmentPlanFilters = {},
  signal?: AbortSignal,
): Promise<TreatmentPlanList> {
  const response = await apiClient.get<ApiSuccessResponse<TreatmentPlanList>>(
    '/specialist/treatment-plans',
    {
      params: {
        page,
        limit,
        status: filters.status || undefined,
        childId: filters.childId || undefined,
      },
      signal,
    },
  )
  return unwrapApiData(response)
}

export async function getTreatmentPlan(
  planId: string,
  signal?: AbortSignal,
): Promise<TreatmentPlan> {
  const response = await apiClient.get<ApiSuccessResponse<TreatmentPlan>>(
    basePath(planId),
    { signal },
  )
  return unwrapApiData(response)
}

export async function createTreatmentPlan(
  payload: CreateTreatmentPlanRequest,
): Promise<TreatmentPlan> {
  const response = await apiClient.post<ApiSuccessResponse<TreatmentPlan>>(
    '/specialist/treatment-plans',
    payload,
  )
  return unwrapApiData(response)
}

export async function updateTreatmentPlan(
  planId: string,
  payload: UpdateTreatmentPlanRequest,
): Promise<TreatmentPlan> {
  const response = await apiClient.patch<ApiSuccessResponse<TreatmentPlan>>(
    basePath(planId),
    payload,
  )
  return unwrapApiData(response)
}

export async function submitTreatmentPlan(planId: string): Promise<TreatmentPlan> {
  const response = await apiClient.post<ApiSuccessResponse<TreatmentPlan>>(
    `${basePath(planId)}/submit`,
  )
  return unwrapApiData(response)
}

export async function getTreatmentPlanSessions(
  planId: string,
  signal?: AbortSignal,
): Promise<TreatmentPlanSession[]> {
  const response = await apiClient.get<
    ApiSuccessResponse<TreatmentPlanSession[]>
  >(`${basePath(planId)}/sessions`, { signal })
  return unwrapApiData(response)
}

export async function getTreatmentPlanSession(
  planId: string,
  sessionId: string,
  signal?: AbortSignal,
): Promise<TreatmentPlanSession> {
  const response = await apiClient.get<ApiSuccessResponse<TreatmentPlanSession>>(
    `${basePath(planId)}/sessions/${encodeURIComponent(sessionId)}`,
    { signal },
  )
  return unwrapApiData(response)
}

export async function completeTreatmentSession(
  planId: string,
  sessionId: string,
  note: string,
): Promise<CompleteSessionResponse> {
  const response = await apiClient.post<
    ApiSuccessResponse<CompleteSessionResponse>
  >(
    `${basePath(planId)}/sessions/${encodeURIComponent(sessionId)}/complete`,
    { note },
  )
  return unwrapApiData(response)
}

export async function noShowTreatmentSession(
  planId: string,
  sessionId: string,
  note: string,
): Promise<NoShowSessionResponse> {
  const response = await apiClient.post<
    ApiSuccessResponse<NoShowSessionResponse>
  >(
    `${basePath(planId)}/sessions/${encodeURIComponent(sessionId)}/no-show`,
    { note },
  )
  return unwrapApiData(response)
}

export async function getTreatmentPlanInvoice(
  planId: string,
  signal?: AbortSignal,
): Promise<TreatmentPlanInvoice | null> {
  try {
    const response = await apiClient.get<
      ApiSuccessResponse<TreatmentPlanInvoice>
    >(`${basePath(planId)}/invoice`, { signal })
    return unwrapApiData(response)
  } catch (error) {
    // Draft / unapproved plans have no invoice yet. The fee is already shown
    // on the plan, so treat a missing invoice as an empty result, not an error.
    if (
      error instanceof ApiError &&
      (error.status === 404 || error.code === 'NOT_FOUND')
    ) {
      return null
    }
    throw error
  }
}

export async function cancelTreatmentPlan(
  planId: string,
  reason: string,
): Promise<TreatmentPlan> {
  const response = await apiClient.post<ApiSuccessResponse<TreatmentPlan>>(
    `${basePath(planId)}/cancel`,
    { reason },
  )
  return unwrapApiData(response)
}
