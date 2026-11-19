import type { BookingStatus } from '../types/booking.types'

export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    currentUser: ['auth', 'me'] as const,
  },
  dashboard: {
    all: ['dashboard'] as const,
    summary: ['dashboard', 'summary'] as const,
  },
  bookings: {
    all: ['bookings'] as const,
    lists: () => [...queryKeys.bookings.all, 'list'] as const,
    list: (status?: BookingStatus) =>
      [...queryKeys.bookings.lists(), status ?? 'all'] as const,
    details: () => [...queryKeys.bookings.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.bookings.details(), id] as const,
  },
  calendar: {
    all: ['calendar'] as const,
    range: (from: string, to: string) =>
      [...queryKeys.calendar.all, from, to] as const,
  },
  patients: {
    all: ['patients'] as const,
    list: ['patients', 'list'] as const,
    details: () => [...queryKeys.patients.all, 'detail'] as const,
    detail: (childId: string) =>
      [...queryKeys.patients.details(), childId] as const,
    record: (childId: string) =>
      [...queryKeys.patients.all, 'record', childId] as const,
    notes: (childId: string) =>
      [...queryKeys.patients.all, 'notes', childId] as const,
  },
  activities: {
    all: ['activities'] as const,
    list: ['activities', 'list'] as const,
  },
  profile: {
    all: ['profile'] as const,
    detail: ['profile', 'detail'] as const,
  },
  availability: {
    all: ['availability'] as const,
    detail: ['availability', 'detail'] as const,
  },
} as const
