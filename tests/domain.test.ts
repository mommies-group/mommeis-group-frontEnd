import { describe, expect, it } from '@jest/globals'
import { ApiError, getActionErrorMessage } from '../src/lib/api-error'
import {
  bookingStatusLabels,
  bookingStatusTones,
} from '../src/components/bookings/bookingStatusMeta'
import {
  formatBirthDate,
  formatClockTime,
  formatDate,
  formatDateTime,
  initials,
  monthRange,
  toDateKey,
  toDateTimeIso,
} from '../src/lib/format'
import {
  BOOKING_STATUSES,
  type BookingStatus,
} from '../src/types/booking.types'
import {
  ROUTES,
  bookingMeetingPath,
  getPageTitle,
  isNavActive,
  patientRecordPath,
} from '../src/router/routes'

describe('format helpers', () => {
  it('handles missing dates', () => {
    expect(formatDate(null)).toBe('Not provided')
    expect(formatDateTime(null)).toBe('Not scheduled')
    expect(formatBirthDate(undefined)).toBe('Not provided')
  })

  it('formats clock times on a 12-hour clock with AM/PM', () => {
    expect(formatClockTime('09:00')).toMatch(/9:00\s?AM/)
    expect(formatClockTime('13:00')).toMatch(/1:00\s?PM/)
    expect(formatClockTime('00:30')).toMatch(/12:30\s?AM/)
    expect(formatClockTime('')).toBe('—')
  })

  it('formats date-times on a 12-hour clock with AM/PM', () => {
    expect(formatDateTime('2026-12-01T13:00:00')).toMatch(/1:00\s?PM/)
  })

  it('formats initials and date keys', () => {
    expect(initials('liam', 'bennett')).toBe('LB')
    expect(toDateKey(new Date(2026, 10, 21))).toBe('2026-11-21')
  })

  it('builds a month range', () => {
    const range = monthRange(0)
    expect(range.from).toMatch(/^\d{4}-\d{2}-01$/)
    expect(range.to).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('builds ISO values from date and time inputs', () => {
    expect(toDateTimeIso('', '10:00')).toBeNull()
    expect(toDateTimeIso('2026-12-01', '10:00')).toBe(
      new Date('2026-12-01T10:00:00').toISOString(),
    )
  })
})

describe('booking status metadata', () => {
  it('covers every booking status', () => {
    BOOKING_STATUSES.forEach((status) => {
      expect(bookingStatusLabels[status]).toBeTruthy()
      expect(bookingStatusTones[status]).toBeTruthy()
    })
  })

  it('maps completed bookings', () => {
    const status: BookingStatus = 'COMPLETED'
    expect(bookingStatusLabels[status]).toBe('Completed')
    expect(bookingStatusTones[status]).toBe('neutral')
  })

  it('includes cancelled and no-show in the filter options', () => {
    expect(BOOKING_STATUSES).toContain('CANCELLED')
    expect(BOOKING_STATUSES).toContain('NO_SHOW')
    expect(bookingStatusLabels.CANCELLED).toBe('Cancelled')
    expect(bookingStatusLabels.NO_SHOW).toBe('No show')
  })
})

describe('route helpers', () => {
  it('returns page titles for clean paths', () => {
    expect(getPageTitle(ROUTES.dashboard)).toBe('Dashboard')
    expect(getPageTitle(ROUTES.patients)).toBe('My Patients')
    expect(getPageTitle('/bookings/booking-1/meeting')).toBe('Session Meeting')
    expect(getPageTitle('/unknown')).toBe('Page not found')
  })

  it('builds query-string paths for patient context', () => {
    expect(patientRecordPath('child-1')).toBe('/patients/record?childId=child-1')
    expect(bookingMeetingPath('booking-1')).toBe('/bookings/booking-1/meeting')
  })

  it('marks patient records as part of the patients nav item', () => {
    expect(isNavActive(ROUTES.patients, ROUTES.patients)).toBe(true)
    expect(isNavActive(ROUTES.patients, ROUTES.patientRecord)).toBe(true)
    expect(isNavActive(ROUTES.patients, ROUTES.bookings)).toBe(false)
    expect(isNavActive(ROUTES.bookings, '/bookings/booking-1/meeting')).toBe(
      true,
    )
  })
})

describe('action error messages', () => {
  it('returns specific conflict messages for booking, availability, and treatment plan conflicts', () => {
    const conflict = new ApiError('Conflict', 409, 'CONFLICT')

    expect(getActionErrorMessage(conflict, 'booking.approve')).toBe(
      'Cannot approve this booking because there is already another booking at this time.',
    )
    expect(getActionErrorMessage(conflict, 'booking.propose')).toBe(
      'Another booking is already scheduled at this proposed time. Please choose a different time.',
    )
    expect(getActionErrorMessage(conflict, 'availability.create')).toBe(
      'This time slot overlaps an existing availability slot. Choose a different time.',
    )
    expect(getActionErrorMessage(conflict, 'treatmentPlan.create')).toBe(
      'There is already another booking at one of the selected session times. Please choose a different time.',
    )
  })

  it('replaces generic fallback and validation errors with action-specific messages', () => {
    const genericHttp = new ApiError(
      'The request could not be completed. Please try again.',
      500,
      'HTTP_500',
    )
    const validationErr = new ApiError(
      'Some of the submitted information is not valid.',
      400,
      'VALIDATION_ERROR',
    )

    expect(getActionErrorMessage(genericHttp, 'note.create')).toContain(
      'Could not save the clinical note',
    )
    expect(getActionErrorMessage(validationErr, 'pricing.update')).toContain(
      'Could not save your pricing',
    )
  })

  it('preserves auth, consent, network, and specific 4xx server messages', () => {
    expect(
      getActionErrorMessage(
        new ApiError('Consent locked', 403, 'CONSENT_REQUIRED'),
        'note.create',
      ),
    ).toBe('Consent locked')
    expect(
      getActionErrorMessage(
        new ApiError('Session expired', 401, 'UNAUTHORIZED'),
        'booking.approve',
      ),
    ).toBe('Session expired')
    expect(
      getActionErrorMessage(
        new ApiError(
          'Booking time is outside specialist availability.',
          400,
          'OUTSIDE_AVAILABILITY',
        ),
        'booking.propose',
      ),
    ).toBe('Booking time is outside specialist availability.')
  })
})
