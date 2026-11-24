export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'RESCHEDULE_PENDING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'

export type ProposalStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED'

export type BookingChild = {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
}

export type BookingParent = {
  id: string
  fullName: string
  email: string | null
}

export type BookingProposal = {
  id: string
  bookingId: string
  proposedAt: string
  note: string | null
  status: ProposalStatus
  createdAt: string
}

export type Booking = {
  id: string
  specialistId: string
  childId: string
  parentId: string
  status: BookingStatus
  requestedAt: string
  scheduledAt: string | null
  reason: string | null
  rejectionReason: string | null
  completedAt?: string | null
  completionNote?: string | null
  createdAt: string
  updatedAt: string
  child: BookingChild
  parent: BookingParent
  proposals: BookingProposal[]
}

export type RejectBookingRequest = {
  reason: string
}

export type CompleteBookingRequest = {
  note?: string
}

export type ProposeAlternativeTimeRequest = {
  proposedAt: string
  note?: string
}

export type MeetingInfo = {
  bookingId?: string
  status?: BookingStatus
  statusEnum?: BookingStatus[]
  domain: string
  roomName: string
  jwt: string | null
  joinUrl: string
}

export type CalendarEvent = {
  id: string
  status: BookingStatus
  scheduledAt: string
  child: {
    id: string
    firstName: string
    lastName: string
  }
}

export type CalendarResponse = {
  from: string
  to: string
  events: CalendarEvent[]
}

export const BOOKING_STATUSES: BookingStatus[] = [
  'PENDING',
  'CONFIRMED',
  'RESCHEDULE_PENDING',
  'COMPLETED',
  'REJECTED',
  'CANCELLED',
  'NO_SHOW',
]
