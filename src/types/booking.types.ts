export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'RESCHEDULE_PENDING'
  | 'COMPLETED'

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
  createdAt: string
  updatedAt: string
  child: BookingChild
  parent: BookingParent
  proposals: BookingProposal[]
}

export type RejectBookingRequest = {
  reason: string
}

export type ProposeAlternativeTimeRequest = {
  proposedAt: string
  note?: string
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
