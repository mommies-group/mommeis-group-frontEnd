import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../../../lib/query-keys'
import {
  approveBooking,
  completeBooking,
  getMeetingInfo,
  markBookingNoShow,
  proposeAlternativeTime,
  rejectBooking,
} from '../../../services/bookings/bookings.service'
import type {
  CompleteBookingRequest,
  ProposeAlternativeTimeRequest,
  RejectBookingRequest,
} from '../../../types/booking.types'

function useInvalidateBookingQueries() {
  const queryClient = useQueryClient()

  return () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all })
    void queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all })
    void queryClient.invalidateQueries({
      queryKey: queryKeys.dashboard.summary,
    })
  }
}

export function useApproveBooking() {
  const invalidate = useInvalidateBookingQueries()

  return useMutation({
    mutationFn: (id: string) => approveBooking(id),
    onSuccess: invalidate,
  })
}

export function useRejectBooking() {
  const invalidate = useInvalidateBookingQueries()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: RejectBookingRequest
    }) => rejectBooking(id, payload),
    onSuccess: invalidate,
  })
}

export function useProposeAlternativeTime() {
  const invalidate = useInvalidateBookingQueries()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: ProposeAlternativeTimeRequest
    }) => proposeAlternativeTime(id, payload),
    onSuccess: invalidate,
  })
}

export function useCompleteBooking() {
  const invalidate = useInvalidateBookingQueries()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: CompleteBookingRequest
    }) => completeBooking(id, payload),
    onSuccess: invalidate,
  })
}

export function useMarkNoShow() {
  const invalidate = useInvalidateBookingQueries()

  return useMutation({
    mutationFn: (id: string) => markBookingNoShow(id),
    onSuccess: invalidate,
  })
}

export function useMeetingInfo() {
  return useMutation({
    mutationFn: (id: string) => getMeetingInfo(id),
  })
}
