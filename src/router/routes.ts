import type { IconName } from '../components/icons/Icon'

export const ROUTES = {
  login: '/login',
  dashboard: '/dashboard',
  profile: '/profile',
  availability: '/availability',
  bookings: '/bookings',
  bookingMeeting: '/bookings/:bookingId/meeting',
  patients: '/patients',
  patientRecord: '/patients/record',
  activities: '/activities',
  treatmentPlans: '/treatment-plans',
  privacy: '/privacy',
} as const

export type NavItem = {
  label: string
  path: string
  icon: IconName
}

export type NavGroup = {
  label: string
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', path: ROUTES.dashboard, icon: 'dashboard' }],
  },
  {
    label: 'Care',
    items: [
      {
        label: 'Bookings & Schedule',
        path: ROUTES.bookings,
        icon: 'calendar',
      },
      { label: 'Availability', path: ROUTES.availability, icon: 'clock' },
      { label: 'My Patients', path: ROUTES.patients, icon: 'users' },
      { label: 'Activities', path: ROUTES.activities, icon: 'activity' },
      {
        label: 'Treatment Plans',
        path: ROUTES.treatmentPlans,
        icon: 'file',
      },
    ],
  },
  {
    label: 'Practice',
    items: [
      {
        label: 'Specialist Profile',
        path: ROUTES.profile,
        icon: 'id-card',
      },
      {
        label: 'Privacy',
        path: ROUTES.privacy,
        icon: 'shield',
      },
    ],
  },
]

const titles: Record<string, string> = {
  [ROUTES.login]: 'Sign in',
  [ROUTES.dashboard]: 'Dashboard',
  [ROUTES.profile]: 'Specialist Profile',
  [ROUTES.availability]: 'Availability',
  [ROUTES.bookings]: 'Bookings & Schedule',
  [ROUTES.patients]: 'My Patients',
  [ROUTES.patientRecord]: 'Patient Clinical Record',
  [ROUTES.activities]: 'Activity library',
  [ROUTES.treatmentPlans]: 'Treatment Plans',
  [ROUTES.privacy]: 'Privacy',
}

const BOOKING_MEETING_PATTERN = /^\/bookings\/[^/]+\/meeting$/

export function getPageTitle(path: string): string {
  if (BOOKING_MEETING_PATTERN.test(path)) {
    return 'Session Meeting'
  }
  return titles[path] ?? 'Page not found'
}

export function bookingReviewPath(bookingId: string): string {
  return `${ROUTES.bookings}?bookingId=${encodeURIComponent(bookingId)}`
}

export function bookingMeetingPath(bookingId: string): string {
  return `/bookings/${encodeURIComponent(bookingId)}/meeting`
}

export function patientRecordPath(childId: string): string {
  return `${ROUTES.patientRecord}?childId=${encodeURIComponent(childId)}`
}

export function treatmentPlansCreatePath(
  childId: string,
  bookingId?: string | null,
): string {
  const params = new URLSearchParams({ childId })
  if (bookingId) {
    params.set('bookingId', bookingId)
  }
  return `${ROUTES.treatmentPlans}?create=1&${params.toString()}`
}

export function isNavActive(itemPath: string, currentPath: string): boolean {
  if (itemPath === ROUTES.patients) {
    return (
      currentPath === ROUTES.patients ||
      currentPath === ROUTES.patientRecord
    )
  }
  if (itemPath === ROUTES.bookings) {
    return (
      currentPath === ROUTES.bookings ||
      BOOKING_MEETING_PATTERN.test(currentPath)
    )
  }
  return itemPath === currentPath
}
