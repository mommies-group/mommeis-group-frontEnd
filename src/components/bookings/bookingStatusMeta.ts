import type { BadgeTone } from '../ui/Badge'
import type { BookingStatus } from '../../types/booking.types'

export const bookingStatusLabels: Record<BookingStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  REJECTED: 'Rejected',
  RESCHEDULE_PENDING: 'Reschedule pending',
  COMPLETED: 'Completed',
}

export const bookingStatusTones: Record<BookingStatus, BadgeTone> = {
  PENDING: 'warning',
  CONFIRMED: 'success',
  REJECTED: 'danger',
  RESCHEDULE_PENDING: 'info',
  COMPLETED: 'neutral',
}

export const calendarDotClasses: Record<BookingStatus, string> = {
  PENDING: 'bg-amber-500',
  CONFIRMED: 'bg-emerald-500',
  REJECTED: 'bg-rose-500',
  RESCHEDULE_PENDING: 'bg-sky-500',
  COMPLETED: 'bg-slate-400',
}
