import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../../../lib/query-keys'
import type { BookingStatus } from '../../../types/booking.types'
import {
  getBookingById,
  getBookings,
  getMeetingInfo,
  getPendingBookings,
} from '../../../services/bookings/bookings.service'

export function useBookings(status?: BookingStatus) {
  return useQuery({
    queryKey: queryKeys.bookings.list(status),
    queryFn: ({ signal }) => getBookings({ status, signal }),
    refetchInterval: 5_000,
  })
}

export function usePendingBookings() {
  return useQuery({
    queryKey: queryKeys.bookings.list('PENDING'),
    queryFn: ({ signal }) => getPendingBookings(signal),
    refetchInterval: 5_000,
  })
}

export function useBookingById(id: string | null) {
  return useQuery({
    queryKey: queryKeys.bookings.detail(id ?? ''),
    queryFn: ({ signal }) => getBookingById(id as string, signal),
    enabled: Boolean(id),
    refetchInterval: 5_000,
  })
}

export function useBookingMeeting(id: string | null, enabled = true) {
  return useQuery({
    queryKey: queryKeys.bookings.meeting(id ?? ''),
    queryFn: ({ signal }) => getMeetingInfo(id as string, signal),
    enabled: Boolean(id) && enabled,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}
