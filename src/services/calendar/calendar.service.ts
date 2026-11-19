import { apiClient } from '../../lib/axios'
import { unwrapApiData } from '../../lib/api-response'
import type { ApiSuccessResponse } from '../../types/api.types'
import type { CalendarResponse } from '../../types/booking.types'

export async function getCalendar(
  from: string,
  to: string,
  signal?: AbortSignal,
): Promise<CalendarResponse> {
  const response = await apiClient.get<ApiSuccessResponse<CalendarResponse>>(
    '/specialist/calendar',
    {
      signal,
      params: { from, to },
    },
  )
  return unwrapApiData(response)
}
