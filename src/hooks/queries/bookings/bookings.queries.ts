import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../../../lib/query-keys'
import type { BookingStatus } from '../../../types/booking.types'
import {
  getBookingById,
  getBookings,
  getPendingBookings,
} from '../../../services/bookings/bookings.service'

export function useBookings(status?: BookingStatus) {
  return useQuery({
    queryKey: queryKeys.bookings.list(status),
    queryFn: ({ signal }) => getBookings({ status, signal }),
  })
}

export function usePendingBookings() {
  return useQuery({
    queryKey: queryKeys.bookings.list('PENDING'),
    queryFn: ({ signal }) => getPendingBookings(signal),
  })
}

export function useBookingById(id: string | null) {
  return useQuery({
    queryKey: queryKeys.bookings.detail(id ?? ''),
    queryFn: ({ signal }) => getBookingById(id as string, signal),
    enabled: Boolean(id),
  })
}
