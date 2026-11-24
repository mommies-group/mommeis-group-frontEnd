import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { BookingMeetingPage } from '../src/pages/BookingMeetingPage'
import { ApiError } from '../src/lib/api-error'
import { ROUTES, bookingMeetingPath } from '../src/router/routes'
import type { MeetingInfo } from '../src/types/booking.types'

type CapturedJitsiProps = {
  domain?: string
  roomName: string
  jwt?: string
  userInfo?: { displayName: string; email: string }
  onReadyToClose?: () => void
}

let capturedJitsiProps: CapturedJitsiProps | null = null
const mockRefetchMeeting = jest.fn()

jest.mock('@jitsi/react-sdk', () => ({
  JitsiMeeting: (props: CapturedJitsiProps) => {
    capturedJitsiProps = props
    return (
      <div data-testid="jitsi-meeting">
        <span>{props.roomName}</span>
        <button type="button" onClick={() => props.onReadyToClose?.()}>
          Leave meeting
        </button>
      </div>
    )
  },
}))

const mockUseBookingMeeting = jest.fn()
const mockUseBookingById = jest.fn()
const mockUseCurrentUser = jest.fn()

jest.mock('../src/hooks/queries/bookings/bookings.queries', () => ({
  useBookingMeeting: (id: string | null, enabled?: boolean) =>
    mockUseBookingMeeting(id, enabled),
  useBookingById: (id: string | null) => mockUseBookingById(id),
  useBookings: () => ({ data: [], isLoading: false, isError: false }),
}))

type MockTreatmentPlanFormProps = {
  open: boolean
  childId?: string | null
  bookingId?: string | null
  onClose: () => void
  onSaved?: () => void
}

jest.mock('../src/components/treatment-plans/TreatmentPlanFormModal', () => ({
  TreatmentPlanFormModal: ({
    open,
    childId,
    bookingId,
    onClose,
    onSaved,
  }: MockTreatmentPlanFormProps) =>
    open ? (
      <div
        data-testid="treatment-plan-form-modal"
        data-child-id={childId ?? ''}
        data-booking-id={bookingId ?? ''}
      >
        <button
          type="button"
          onClick={() => {
            onSaved?.()
            onClose()
          }}
        >
          Save treatment plan
        </button>
      </div>
    ) : null,
}))

jest.mock('../src/hooks/queries/auth/auth.queries', () => ({
  useCurrentUser: () => mockUseCurrentUser(),
}))

jest.mock('../src/hooks/queries/patients/patients.queries', () => ({
  usePatients: () => ({ data: [], isLoading: false, isError: false }),
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

jest.mock(
  '../src/hooks/mutations/clinical-notes/clinical-notes.mutations',
  () => ({
    useCreateClinicalNote: () => ({
      mutate: jest.fn(),
      isPending: false,
      reset: jest.fn(),
    }),
  }),
)

jest.mock('../src/hooks/mutations/bookings/bookings.mutations', () => ({
  useCompleteBooking: () => ({
    mutate: jest.fn(),
    isPending: false,
    reset: jest.fn(),
  }),
}))

const baseMeeting: MeetingInfo = {
  bookingId: 'cmwse3n23000ymy0pgsgcx9is',
  status: 'CONFIRMED',
  domain: 'meet.jit.si',
  roomName: 'mindbloom-cmwse3n23000ymy0pgsgcx9is',
  jwt: null,
  joinUrl: 'https://meet.jit.si/mindbloom-cmwse3n23000ymy0pgsgcx9is',
}

const baseBooking = {
  id: 'cmwse3n23000ymy0pgsgcx9is',
  specialistId: 'spec-1',
  childId: 'child-1',
  parentId: 'parent-1',
  status: 'CONFIRMED',
  requestedAt: '2026-11-24T09:00:00.000Z',
  scheduledAt: '2026-11-24T10:00:00.000Z',
  reason: null,
  rejectionReason: null,
  createdAt: '2026-11-24T09:00:00.000Z',
  updatedAt: '2026-11-24T09:00:00.000Z',
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

function renderMeetingPage(bookingId = 'cmwse3n23000ymy0pgsgcx9is') {
  return render(
    <MemoryRouter initialEntries={[bookingMeetingPath(bookingId)]}>
      <Routes>
        <Route path={ROUTES.bookingMeeting} element={<BookingMeetingPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('BookingMeetingPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    capturedJitsiProps = null

    mockUseCurrentUser.mockReturnValue({
      data: {
        id: 'spec-1',
        fullName: 'Dr. Nada',
        email: 'nada@example.test',
        specialty: 'Speech Therapy',
      },
      isLoading: false,
      isError: false,
    })

    mockUseBookingById.mockReturnValue({
      data: baseBooking,
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    })

    mockUseBookingMeeting.mockReturnValue({
      data: baseMeeting,
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetchMeeting,
    })
  })

  it('renders JitsiMeeting with endpoint domain, roomName, userInfo, and undefined jwt when api returns null', () => {
    renderMeetingPage()

    expect(screen.getByTestId('jitsi-meeting')).toBeInTheDocument()
    expect(capturedJitsiProps).toMatchObject({
      domain: 'meet.jit.si',
      roomName: 'mindbloom-cmwse3n23000ymy0pgsgcx9is',
      userInfo: {
        displayName: 'Dr. Nada',
        email: 'nada@example.test',
      },
    })
    expect(capturedJitsiProps?.jwt).toBeUndefined()
    expect(
      screen.queryByRole('link', { name: /Open in new tab/i }),
    ).not.toBeInTheDocument()
  })

  it('forwards jwt when provided by the meeting endpoint', () => {
    mockUseBookingMeeting.mockReturnValue({
      data: { ...baseMeeting, jwt: 'signed-jwt-token' },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetchMeeting,
    })

    renderMeetingPage()

    expect(capturedJitsiProps?.jwt).toBe('signed-jwt-token')
  })

  it('renders loading and error states with retry support', () => {
    mockUseBookingMeeting.mockReturnValueOnce({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: mockRefetchMeeting,
    })

    const { rerender } = renderMeetingPage()
    expect(screen.getByText('Loading meeting room…')).toBeInTheDocument()

    mockUseBookingMeeting.mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Meeting unavailable'),
      refetch: mockRefetchMeeting,
    })

    rerender(
      <MemoryRouter
        initialEntries={[bookingMeetingPath('cmwse3n23000ymy0pgsgcx9is')]}
      >
        <Routes>
          <Route
            path={ROUTES.bookingMeeting}
            element={<BookingMeetingPage />}
          />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Could not load meeting room')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(mockRefetchMeeting).toHaveBeenCalledTimes(1)
  })

  it('shows a clean unavailable card with Back to bookings when meeting access is rejected', () => {
    mockUseBookingMeeting.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new ApiError(
        'This patient does not have an active or recently completed appointment with you.',
        403,
        'NO_ELIGIBLE_APPOINTMENT',
      ),
      refetch: mockRefetchMeeting,
    })

    renderMeetingPage()

    expect(
      screen.getByText('Meeting room is not available'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'This session is not active right now, has already ended, or is no longer confirmed.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /Try again/i }),
    ).not.toBeInTheDocument()
    expect(
      screen.getAllByRole('link', { name: /Back to bookings/i }).length,
    ).toBeGreaterThan(0)
  })

  it('shows a left-meeting state when Jitsi closes and supports rejoining', () => {
    renderMeetingPage()

    fireEvent.click(screen.getByRole('button', { name: 'Leave meeting' }))

    expect(screen.getByText('You left the meeting')).toBeInTheDocument()
    expect(screen.queryByTestId('jitsi-meeting')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Rejoin meeting' }))

    expect(screen.getByTestId('jitsi-meeting')).toBeInTheDocument()
  })

  it('shows only Create treatment plan after completion, then switches to Back to bookings once saved', () => {
    mockUseBookingById.mockReturnValue({
      data: { ...baseBooking, status: 'COMPLETED' },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    })

    mockUseBookingMeeting.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error(
        'This patient does not have an active or recently completed appointment with you.',
      ),
      refetch: mockRefetchMeeting,
    })

    renderMeetingPage()

    expect(mockUseBookingMeeting).toHaveBeenCalledWith(
      'cmwse3n23000ymy0pgsgcx9is',
      false,
    )
    expect(screen.getByText('Session completed')).toBeInTheDocument()
    expect(
      screen.queryByText('Could not load meeting room'),
    ).not.toBeInTheDocument()
    expect(screen.queryByTestId('jitsi-meeting')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: /Back to bookings/i }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: /Open in new tab/i }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /Complete & add note/i }),
    ).not.toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', { name: 'Create treatment plan' }),
    )

    const modal = screen.getByTestId('treatment-plan-form-modal')
    expect(modal).toHaveAttribute('data-child-id', 'child-1')
    expect(modal).toHaveAttribute(
      'data-booking-id',
      'cmwse3n23000ymy0pgsgcx9is',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Save treatment plan' }))

    expect(screen.getByText('Treatment plan created')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Create treatment plan' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Back to bookings' }),
    ).toHaveAttribute('href', ROUTES.bookings)
  })
})
