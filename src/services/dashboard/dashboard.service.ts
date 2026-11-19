import { apiClient } from '../../lib/axios'
import { unwrapApiData } from '../../lib/api-response'
import type { ApiSuccessResponse } from '../../types/api.types'
import type { DashboardSummary } from '../../types/dashboard.types'

export async function getDashboardSummary(
  signal?: AbortSignal,
): Promise<DashboardSummary> {
  const response = await apiClient.get<ApiSuccessResponse<DashboardSummary>>(
    '/specialist/dashboard',
    { signal },
  )
  return unwrapApiData(response)
}
