import { describe, expect, it } from '@jest/globals'
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
  getActivityStatus,
  type Activity,
} from '../src/types/activity.types'
import {
  ROUTES,
  getPageTitle,
  isNavActive,
  patientRecordPath,
} from '../src/router/routes'

function activity(overrides: Partial<Activity> = {}): Activity {
  return {
    id: 'activity-1',
    childId: 'child-1',
    specialistId: 'spec-1',
    title: 'Emotion cards',
    instructions: 'Name each feeling.',
    mediaReference: null,
    durationMinutes: 15,
    frequency: '3 times per week',
    dueDate: null,
    retractedAt: null,
    createdAt: '2026-11-19T20:17:40.179Z',
    updatedAt: '2026-11-19T20:17:40.179Z',
    ...overrides,
  }
}

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

describe('activity status', () => {
  it('prefers the explicit status field', () => {
    expect(getActivityStatus(activity({ status: 'COMPLETED' }))).toBe(
      'COMPLETED',
    )
  })

  it('falls back to the legacy completed flag', () => {
    expect(getActivityStatus(activity({ completed: true }))).toBe('COMPLETED')
    expect(getActivityStatus(activity({ completed: false }))).toBe('ASSIGNED')
  })
})

describe('route helpers', () => {
  it('returns page titles for clean paths', () => {
    expect(getPageTitle(ROUTES.dashboard)).toBe('Dashboard')
    expect(getPageTitle(ROUTES.patients)).toBe('My Patients')
    expect(getPageTitle('/unknown')).toBe('Page not found')
  })

  it('builds query-string paths for patient context', () => {
    expect(patientRecordPath('child-1')).toBe('/patients/record?childId=child-1')
  })

  it('marks patient records as part of the patients nav item', () => {
    expect(isNavActive(ROUTES.patients, ROUTES.patients)).toBe(true)
    expect(isNavActive(ROUTES.patients, ROUTES.patientRecord)).toBe(true)
    expect(isNavActive(ROUTES.patients, ROUTES.bookings)).toBe(false)
  })
})
