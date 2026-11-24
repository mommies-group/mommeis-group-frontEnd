import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { DashboardPage } from '../src/pages/DashboardPage'
import { BookingsPage } from '../src/pages/BookingsPage'
import { NAV_GROUPS, bookingReviewPath } from '../src/router/routes'
import type { BookingStatus } from '../src/types/booking.types'

const mockBooking = {
  id: 'booking-1',
  specialistId: 'specialist-1',
  childId: 'child-1',
  parentId: 'parent-1',
  status: 'PENDING',
  requestedAt: '2026-11-21T10:00:00.000Z',
  scheduledAt: null,
  reason: 'Initial consultation',
  rejectionReason: null,
  createdAt: '2026-11-21T10:00:00.000Z',
  updatedAt: '2026-11-21T10:00:00.000Z',
  child: {
    id: 'child-1',
    firstName: 'Ava',
    lastName: 'Smith',
    dateOfBirth: '2018-01-01',
  },
  parent: {
    id: 'parent-1',
    fullName: 'Jordan Smith',
    email: 'jordan@example.test',
  },
  proposals: [],
}

type MockProposalStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED'

let mockProposalStatus: MockProposalStatus | null = null
let mockBookingStatus: BookingStatus = 'PENDING'
let mockScheduledAt: string | null = null

function bookingWithProposal() {
  return {
    ...mockBooking,
    status: mockBookingStatus,
    scheduledAt: mockScheduledAt,
    proposals: mockProposalStatus
      ? [
          {
            id: 'proposal-1',
            bookingId: 'booking-1',
            proposedAt: '2026-12-05T11:00:00.000Z',
            note: 'Alternative time',
            status: mockProposalStatus,
            createdAt: '2026-11-21T11:00:00.000Z',
          },
        ]
      : [],
  }
}

const mockApproveBooking = jest.fn()
const mockRejectBooking = jest.fn()
const mockMarkNoShow = jest.fn()

beforeEach(() => {
  mockProposalStatus = null
  mockBookingStatus = 'PENDING'
  mockScheduledAt = null
})

jest.mock('../src/hooks/queries/dashboard/dashboard.queries', () => ({
  useDashboardSummary: () => ({
    data: {
      todaySessions: 0,
      pendingBookingRequests: 1,
      activePatients: 0,
      upcomingAppointments: [],
      recentActivities: [],
    },
    isLoading: false,
    isError: false,
  }),
}))

jest.mock('../src/hooks/queries/bookings/bookings.queries', () => ({
  usePendingBookings: () => ({
    data: [bookingWithProposal()],
    isLoading: false,
    isError: false,
  }),
  useBookings: () => ({
    data: [bookingWithProposal()],
    isLoading: false,
    isError: false,
  }),
  useBookingById: () => ({
    data: bookingWithProposal(),
    isLoading: false,
    isError: false,
  }),
}))

jest.mock('../src/hooks/queries/calendar/calendar.queries', () => ({
  useCalendar: () => ({
    data: { from: '', to: '', events: [] },
    isLoading: false,
    isError: false,
  }),
}))

jest.mock('../src/hooks/mutations/clinical-notes/clinical-notes.mutations', () => ({
  useCreateClinicalNote: () => ({
    mutate: jest.fn(),
    isPending: false,
    reset: jest.fn(),
  }),
  useUpdateClinicalNote: () => ({
    mutate: jest.fn(),
    isPending: false,
    reset: jest.fn(),
  }),
  useDeleteClinicalNote: () => ({
    mutate: jest.fn(),
    isPending: false,
    reset: jest.fn(),
  }),
}))

jest.mock('../src/hooks/queries/clinical-notes/clinical-notes.queries', () => ({
  useClinicalNotes: () => ({ data: [], isLoading: false, isError: false }),
  useClinicalNote: () => ({ data: null, isLoading: false, isError: false }),
}))

jest.mock(
  '../src/hooks/queries/activities/activity-catalog.queries',
  () => ({
    useCatalogActivities: () => ({
      data: [],
      isLoading: false,
      isError: false,
    }),
  }),
)

jest.mock('../src/hooks/queries/patients/patients.queries', () => ({
  usePatients: () => ({ data: [], isLoading: false, isError: false }),
}))

jest.mock('../src/hooks/mutations/bookings/bookings.mutations', () => ({
  useApproveBooking: () => ({
    mutate: mockApproveBooking,
    isPending: false,
    reset: jest.fn(),
  }),
  useRejectBooking: () => ({
    mutate: mockRejectBooking,
    isPending: false,
    reset: jest.fn(),
  }),
  useCompleteBooking: () => ({
    mutate: jest.fn(),
    isPending: false,
    reset: jest.fn(),
  }),
  useProposeAlternativeTime: () => ({
    mutate: jest.fn(),
    isPending: false,
    reset: jest.fn(),
  }),
  useMarkNoShow: () => ({
    mutate: mockMarkNoShow,
    isPending: false,
    reset: jest.fn(),
  }),
  useMeetingInfo: () => ({ mutate: jest.fn(), isPending: false }),
}))

describe('notes navigation', () => {
  it('does not expose clinical notes in the sidebar', () => {
    const navPaths = NAV_GROUPS.flatMap((group) =>
      group.items.map((item) => item.path),
    )

    expect(navPaths).not.toContain('/clinical-notes')
  })
})

describe('dashboard booking quick actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('opens a pending request in a review modal on the dashboard', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Review request for Ava Smith' }),
    )

    expect(
      screen.getByRole('dialog', { name: 'Booking review' }),
    ).toBeInTheDocument()
  })

  it('approves a booking in one click', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Approve booking for Ava Smith' }),
    )

    expect(mockApproveBooking).toHaveBeenCalledWith(
      'booking-1',
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    )
  })

  it('disables quick approve while the parent confirmation is pending', () => {
    mockProposalStatus = 'PENDING'

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    )

    const approve = screen.getByRole('button', {
      name: 'Approve booking for Ava Smith (awaiting parent)',
    })
    expect(approve).toBeDisabled()
    expect(approve).toHaveAttribute(
      'title',
      'Waiting for parent confirmation',
    )

    fireEvent.click(approve)
    expect(mockApproveBooking).not.toHaveBeenCalled()
  })

  it('enables quick approve once the parent accepts the proposal', () => {
    mockProposalStatus = 'ACCEPTED'

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('button', { name: 'Approve booking for Ava Smith' }),
    ).toBeEnabled()
  })

  it('requires a reason before rejecting a booking', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Reject booking for Ava Smith' }),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Confirm rejection' }))
    expect(mockRejectBooking).not.toHaveBeenCalled()

    fireEvent.change(
      screen.getByLabelText('Rejection reason for Ava Smith'),
      { target: { value: 'Schedule conflict' } },
    )
    fireEvent.click(screen.getByRole('button', { name: 'Confirm rejection' }))

    expect(mockRejectBooking).toHaveBeenCalledWith(
      {
        id: 'booking-1',
        payload: { reason: 'Schedule conflict' },
      },
      expect.anything(),
    )
  })
})

describe('booking review deep link', () => {
  it('opens the linked booking in the review panel', () => {
    render(
      <MemoryRouter initialEntries={[bookingReviewPath('booking-1')]}>
        <BookingsPage />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: 'Review' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/jordan@example.test/)).toBeInTheDocument()
    expect(screen.getAllByText('Initial consultation').length).toBeGreaterThan(0)
  })

  it('disables review approval until the parent accepts the proposal', () => {
    mockProposalStatus = 'PENDING'

    render(
      <MemoryRouter initialEntries={[bookingReviewPath('booking-1')]}>
        <BookingsPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('button', { name: 'Approve' })).toBeDisabled()
    expect(
      screen.getByText(/Approve is enabled once the parent confirms/i),
    ).toBeInTheDocument()
  })

  it('enables review approval after the parent accepts the proposal', () => {
    mockProposalStatus = 'ACCEPTED'

    render(
      <MemoryRouter initialEntries={[bookingReviewPath('booking-1')]}>
        <BookingsPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('button', { name: 'Approve' })).toBeEnabled()
  })
})

describe('review actions by booking status', () => {
  const actionNames = [
    'Approve',
    'Reject',
    'Propose time',
    'Complete',
    'Meeting',
    'No show',
  ]

  function renderReview(status: BookingStatus) {
    mockBookingStatus = status

    render(
      <MemoryRouter initialEntries={[bookingReviewPath('booking-1')]}>
        <BookingsPage />
      </MemoryRouter>,
    )
  }

  function expectOnlyActions(expected: string[]) {
    actionNames.forEach((name) => {
      const button = screen.queryByRole('button', { name })

      if (expected.includes(name)) {
        expect(button).toBeInTheDocument()
      } else {
        expect(button).not.toBeInTheDocument()
      }
    })
  }

  it('shows approve, reject and propose for pending', () => {
    renderReview('PENDING')
    expectOnlyActions(['Approve', 'Reject', 'Propose time'])
  })

  it('shows approve, reject and propose for reschedule pending', () => {
    renderReview('RESCHEDULE_PENDING')
    expectOnlyActions(['Approve', 'Reject', 'Propose time'])
  })

  it('shows complete, meeting and no show for confirmed', () => {
    renderReview('CONFIRMED')
    expectOnlyActions(['Complete', 'Meeting', 'No show'])
  })

  it.each(['REJECTED', 'NO_SHOW', 'CANCELLED', 'COMPLETED'] as BookingStatus[])(
    'shows no actions for %s',
    (status) => {
      renderReview(status)
      expectOnlyActions([])
    },
  )

  function wallClockIsoFromNow(offsetMs: number): string {
    const date = new Date(Date.now() + offsetMs)
    const pad = (value: number) => String(value).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.000Z`
  }

  it('keeps complete and meeting disabled until the scheduled time', () => {
    mockScheduledAt = wallClockIsoFromNow(60 * 60 * 1000)
    renderReview('CONFIRMED')

    expect(screen.getByRole('button', { name: 'Complete' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Meeting' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'No show' })).toBeDisabled()
    expect(screen.getByText(/Actions unlock at the scheduled time/i)).toBeInTheDocument()
  })

  it('enables complete and meeting once the scheduled time is reached', () => {
    mockScheduledAt = wallClockIsoFromNow(-60 * 1000)
    renderReview('CONFIRMED')

    expect(screen.getByRole('button', { name: 'Complete' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Meeting' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'No show' })).toBeEnabled()
    expect(screen.queryByText(/Actions unlock at the scheduled time/i)).not.toBeInTheDocument()
  })

  it('opens the notes dialog when completing a confirmed booking', () => {
    mockScheduledAt = wallClockIsoFromNow(-60 * 1000)
    renderReview('CONFIRMED')

    fireEvent.click(screen.getByRole('button', { name: 'Complete' }))

    expect(
      screen.getByRole('dialog', { name: /Complete session & add note/i }),
    ).toBeInTheDocument()
  })

  it('marks a confirmed booking as no show', () => {
    mockScheduledAt = wallClockIsoFromNow(-60 * 1000)
    renderReview('CONFIRMED')

    fireEvent.click(screen.getByRole('button', { name: 'No show' }))

    expect(mockMarkNoShow).toHaveBeenCalledWith('booking-1', expect.anything())
  })
})
