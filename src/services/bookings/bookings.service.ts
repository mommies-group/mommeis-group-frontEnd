import { apiClient } from '../../lib/axios'
import { unwrapApiData } from '../../lib/api-response'
import type { ApiSuccessResponse } from '../../types/api.types'
import type {
  Booking,
  BookingStatus,
  CalendarResponse,
  CompleteBookingRequest,
  MeetingInfo,
  ProposeAlternativeTimeRequest,
  RejectBookingRequest,
} from '../../types/booking.types'

type BookingFilters = {
  status?: BookingStatus
  signal?: AbortSignal
}

export async function getBookings({
  status,
  signal,
}: BookingFilters = {}): Promise<Booking[]> {
  const response = await apiClient.get<ApiSuccessResponse<Booking[]>>(
    '/specialist/bookings',
    {
      signal,
      params: status ? { status } : undefined,
    },
  )
  return unwrapApiData(response)
}

export async function getPendingBookings(
  signal?: AbortSignal,
): Promise<Booking[]> {
  return getBookings({ status: 'PENDING', signal })
}

export async function getBookingById(
  id: string,
  signal?: AbortSignal,
): Promise<Booking> {
  const response = await apiClient.get<ApiSuccessResponse<Booking>>(
    `/specialist/bookings/${encodeURIComponent(id)}`,
    { signal },
  )
  return unwrapApiData(response)
}

export async function approveBooking(id: string): Promise<Booking> {
  const response = await apiClient.post<ApiSuccessResponse<Booking>>(
    `/specialist/bookings/${encodeURIComponent(id)}/approve`,
  )
  return unwrapApiData(response)
}

export async function rejectBooking(
  id: string,
  payload: RejectBookingRequest,
): Promise<Booking> {
  const response = await apiClient.post<ApiSuccessResponse<Booking>>(
    `/specialist/bookings/${encodeURIComponent(id)}/reject`,
    payload,
  )
  return unwrapApiData(response)
}

export async function proposeAlternativeTime(
  id: string,
  payload: ProposeAlternativeTimeRequest,
): Promise<Booking> {
  const response = await apiClient.post<ApiSuccessResponse<Booking>>(
    `/specialist/bookings/${encodeURIComponent(id)}/propose-time`,
    payload,
  )
  return unwrapApiData(response)
}

export async function completeBooking(
  id: string,
  payload: CompleteBookingRequest = {},
): Promise<Booking> {
  const response = await apiClient.post<ApiSuccessResponse<Booking>>(
    `/specialist/bookings/${encodeURIComponent(id)}/complete`,
    payload,
  )
  return unwrapApiData(response)
}

export async function markBookingNoShow(id: string): Promise<Booking> {
  const response = await apiClient.post<ApiSuccessResponse<Booking>>(
    `/specialist/bookings/${encodeURIComponent(id)}/no-show`,
  )
  return unwrapApiData(response)
}

export async function getMeetingInfo(
  id: string,
  signal?: AbortSignal,
): Promise<MeetingInfo> {
  const response = await apiClient.get<ApiSuccessResponse<MeetingInfo>>(
    `/specialist/bookings/${encodeURIComponent(id)}/meeting`,
    { signal },
  )
  return unwrapApiData(response)
}

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
