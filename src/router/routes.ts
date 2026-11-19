import type { IconName } from '../components/icons/Icon'

export const ROUTES = {
  login: '/login',
  dashboard: '/dashboard',
  profile: '/profile',
  availability: '/availability',
  bookings: '/bookings',
  patients: '/patients',
  patientRecord: '/patients/record',
  clinicalNotes: '/clinical-notes',
  activities: '/activities',
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
      {
        label: 'Clinical Notes',
        path: ROUTES.clinicalNotes,
        icon: 'notes',
      },
      { label: 'Activities', path: ROUTES.activities, icon: 'activity' },
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
  [ROUTES.clinicalNotes]: 'Clinical Notes',
  [ROUTES.activities]: 'Activities',
}

export function getPageTitle(path: string): string {
  return titles[path] ?? 'Page not found'
}

export function patientRecordPath(childId: string): string {
  return `${ROUTES.patientRecord}?childId=${encodeURIComponent(childId)}`
}

export function clinicalNotesPath(childId?: string): string {
  if (!childId) {
    return ROUTES.clinicalNotes
  }

  return `${ROUTES.clinicalNotes}?childId=${encodeURIComponent(childId)}`
}

export function isNavActive(itemPath: string, currentPath: string): boolean {
  if (itemPath === ROUTES.patients) {
    return (
      currentPath === ROUTES.patients ||
      currentPath === ROUTES.patientRecord
    )
  }
  return itemPath === currentPath
}
