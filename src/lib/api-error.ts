export class ApiError extends Error {
  status: number | undefined
  code: string
  details: unknown

  constructor(
    message: string,
    status: number | undefined,
    code: string,
    details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

const codeMessages: Record<string, string> = {
  INVALID_CREDENTIALS: 'Email or password is incorrect.',
  UNAUTHORIZED: 'Your session has expired. Sign in again to continue.',
  INVALID_TOKEN: 'Your session is no longer valid. Sign in again to continue.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  CONSENT_REQUIRED:
    'Parental consent is not active for this patient, so clinical access is locked.',
  NO_ELIGIBLE_APPOINTMENT:
    'This patient does not have an active or recently completed appointment with you.',
  NOT_FOUND: 'The requested information could not be found.',
  VALIDATION_ERROR: 'Some of the submitted information is not valid.',
  INVALID_BOOKING_STATE:
    'This booking is no longer in a state that allows that action.',
  CONFLICT: 'That information conflicts with an existing record.',
  BOOKING_CONFLICT:
    'There is already another booking at this time. Please choose a different time.',
  SESSION_CONFLICT:
    'There is already another booking at one of the selected session times. Please choose a different time.',
  SLOT_CONFLICT:
    'There is already another booking at this time. Please choose a different time.',
  SCHEDULE_CONFLICT:
    'There is already another booking at one of the selected times. Please choose a different time.',
  INVALID_REFERENCE: 'A related record could not be found.',
  INTERNAL_ERROR: 'The MindBloom service could not complete this request.',
  NETWORK_ERROR:
    'Unable to reach the MindBloom service. Check your connection and try again.',
  TIMEOUT: 'The request took too long. Please try again.',
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'Something went wrong. Please try again.'
}

export function getApiErrorCode(error: unknown): string | null {
  if (error instanceof ApiError) {
    return error.code
  }

  return null
}

export function isAccessError(error: unknown): boolean {
  const code = getApiErrorCode(error)
  return code === 'CONSENT_REQUIRED' || code === 'NO_ELIGIBLE_APPOINTMENT'
}

export function getCodeMessage(code: string | undefined): string | null {
  if (!code) {
    return null
  }

  return codeMessages[code] ?? null
}

export function isAuthenticationError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.status === 401 ||
      error.code === 'UNAUTHORIZED' ||
      error.code === 'INVALID_TOKEN')
  )
}

export type ErrorAction =
  | 'booking.approve'
  | 'booking.reject'
  | 'booking.propose'
  | 'booking.complete'
  | 'booking.noShow'
  | 'note.create'
  | 'note.update'
  | 'note.delete'
  | 'note.open'
  | 'treatmentPlan.create'
  | 'treatmentPlan.update'
  | 'treatmentPlan.submit'
  | 'treatmentPlan.cancel'
  | 'treatmentPlan.completeSession'
  | 'treatmentPlan.noShowSession'
  | 'activity.create'
  | 'activity.update'
  | 'activity.deactivate'
  | 'availability.create'
  | 'availability.update'
  | 'availability.status'
  | 'availability.delete'
  | 'profile.update'
  | 'pricing.update'

const ACTION_ERROR_MESSAGES: Record<
  ErrorAction,
  { default: string; conflict?: string }
> = {
  'booking.approve': {
    conflict:
      'Cannot approve this booking because there is already another booking at this time.',
    default:
      'Could not approve this booking. It may no longer be pending or may conflict with another appointment.',
  },
  'booking.reject': {
    default:
      'Could not reject this booking. Make sure it is still pending and try again.',
  },
  'booking.propose': {
    conflict:
      'Another booking is already scheduled at this proposed time. Please choose a different time.',
    default:
      'Could not propose this time. Make sure the selected date and time are in the future and available.',
  },
  'booking.complete': {
    default:
      'Could not complete this booking. Make sure the session is still confirmed and at its scheduled time.',
  },
  'booking.noShow': {
    default:
      'Could not mark this booking as no-show. Make sure the session is confirmed and its scheduled time has passed.',
  },
  'note.create': {
    default:
      'Could not save the clinical note. Make sure the patient still has an active appointment and try again.',
  },
  'note.update': {
    default:
      'Could not update the clinical note. Please review your changes and try again.',
  },
  'note.delete': {
    default:
      'Could not delete the clinical note. It may have already been removed.',
  },
  'note.open': {
    default:
      'Could not open this clinical note. It may have been removed or access is locked.',
  },
  'treatmentPlan.create': {
    conflict:
      'There is already another booking at one of the selected session times. Please choose a different time.',
    default:
      'Could not create the treatment plan. Check the session times, fees, and discount, then try again.',
  },
  'treatmentPlan.update': {
    conflict:
      'There is already another booking at one of the selected session times. Please choose a different time.',
    default:
      'Could not update the treatment plan. Check the session times, fees, and discount, then try again.',
  },
  'treatmentPlan.submit': {
    conflict:
      'Cannot submit this treatment plan because one of its sessions conflicts with another booking.',
    default:
      'Could not submit the treatment plan for approval. Make sure it is still a draft and all sessions are valid.',
  },
  'treatmentPlan.cancel': {
    default:
      'Could not cancel this treatment plan. It may already be completed or cancelled.',
  },
  'treatmentPlan.completeSession': {
    default:
      'Could not complete this treatment session. Make sure the plan is active and the session is still scheduled.',
  },
  'treatmentPlan.noShowSession': {
    default:
      'Could not mark this treatment session as no-show. Make sure the plan is active and the session is still scheduled.',
  },
  'activity.create': {
    conflict: 'An activity with these details already exists.',
    default:
      'Could not create this activity. Check the title, instructions, duration, and age range.',
  },
  'activity.update': {
    conflict: 'Another activity already uses these details.',
    default:
      'Could not update this activity. Check your changes and try again.',
  },
  'activity.deactivate': {
    default:
      'Could not deactivate this activity. It may already be inactive.',
  },
  'availability.create': {
    conflict:
      'This time slot overlaps an existing availability slot. Choose a different time.',
    default:
      'Could not add this availability slot. Make sure the time is valid and does not overlap another slot.',
  },
  'availability.update': {
    conflict:
      'This time slot overlaps an existing availability slot. Choose a different time.',
    default:
      'Could not update this availability slot. Make sure the time does not overlap another slot.',
  },
  'availability.status': {
    default:
      'Could not update the availability slot status. Please try again.',
  },
  'availability.delete': {
    conflict:
      'Cannot remove this availability slot because a booking is already scheduled during it.',
    default:
      'Could not remove this availability slot. It may have an active booking scheduled.',
  },
  'profile.update': {
    conflict:
      'Some of your profile details conflict with an existing account.',
    default:
      'Could not save your profile changes. Check your details and try again.',
  },
  'pricing.update': {
    default:
      'Could not save your pricing. Make sure consultation and session fees are valid.',
  },
}

const PRESERVED_ERROR_CODES = new Set([
  'UNAUTHORIZED',
  'INVALID_TOKEN',
  'FORBIDDEN',
  'CONSENT_REQUIRED',
  'NO_ELIGIBLE_APPOINTMENT',
  'NETWORK_ERROR',
  'TIMEOUT',
])

const GENERIC_ERROR_MESSAGES = new Set([
  'the request could not be completed. please try again.',
  'some of the submitted information is not valid.',
  'the mindbloom service could not complete this request.',
  'that information conflicts with an existing record.',
  'this booking is no longer in a state that allows that action.',
  'the requested information could not be found.',
  'a related record could not be found.',
  'something went wrong. please try again.',
  'bad request',
  'validation failed',
  'conflict',
  'internal server error',
])

function getRawServerMessage(error: ApiError): string {
  const details = error.details
  if (typeof details !== 'object' || details === null || !('body' in details)) {
    return ''
  }

  const body = (details as { body?: unknown }).body
  if (typeof body !== 'object' || body === null || !('message' in body)) {
    return ''
  }

  const rawMessage = (body as { message?: unknown }).message
  return typeof rawMessage === 'string' ? rawMessage.trim() : ''
}

export function isConflictError(error: unknown): boolean {
  if (!(error instanceof ApiError)) {
    return false
  }

  const code = error.code.toUpperCase()
  const rawMessage = getRawServerMessage(error)
  const combined = `${error.message} ${rawMessage}`.toLowerCase()

  return (
    error.status === 409 ||
    code.includes('CONFLICT') ||
    code.includes('OVERLAP') ||
    combined.includes('conflict') ||
    combined.includes('overlap') ||
    combined.includes('already booked') ||
    combined.includes('already scheduled') ||
    combined.includes('already exists') ||
    combined.includes('slot is taken') ||
    combined.includes('time is not available')
  )
}

export function getActionErrorMessage(
  error: unknown,
  action: ErrorAction,
): string {
  if (error instanceof ApiError && PRESERVED_ERROR_CODES.has(error.code)) {
    return error.message
  }

  const config = ACTION_ERROR_MESSAGES[action]

  if (config.conflict && isConflictError(error)) {
    return config.conflict
  }

  if (error instanceof ApiError && (!error.status || error.status < 500)) {
    const rawServerMessage = getRawServerMessage(error)
    if (
      rawServerMessage &&
      rawServerMessage.length < 180 &&
      !GENERIC_ERROR_MESSAGES.has(rawServerMessage.toLowerCase())
    ) {
      return rawServerMessage
    }

    const normalizedMessage = error.message.trim()
    if (
      normalizedMessage &&
      !GENERIC_ERROR_MESSAGES.has(normalizedMessage.toLowerCase())
    ) {
      return normalizedMessage
    }
  }

  return config.default
}

export type LoadErrorContext =
  | 'dashboard'
  | 'bookings'
  | 'booking'
  | 'schedule'
  | 'meeting'
  | 'patients'
  | 'clinicalRecord'
  | 'clinicalNote'
  | 'activities'
  | 'availability'
  | 'profile'
  | 'pricing'
  | 'treatmentPlans'
  | 'treatmentPlan'
  | 'treatmentPlanSessions'
  | 'treatmentPlanInvoice'

export type LoadErrorIcon =
  | 'alert'
  | 'lock'
  | 'video'
  | 'notes'
  | 'calendar'
  | 'inbox'
  | 'dashboard'
  | 'users'
  | 'id-card'
  | 'activity'
  | 'clock'
  | 'file'

export type LoadErrorInfo = {
  title: string
  description: string
  tone: 'neutral' | 'warning' | 'danger'
  canRetry: boolean
  icon: LoadErrorIcon
}

type LoadErrorContextConfig = {
  icon: LoadErrorIcon
  notFound: { title: string; description: string }
  access: { title: string; description: string }
  default: { title: string; description: string }
}

const LOAD_ERROR_MESSAGES: Record<LoadErrorContext, LoadErrorContextConfig> = {
  meeting: {
    icon: 'video',
    notFound: {
      title: 'Meeting room is no longer available',
      description:
        'This booking could not be found or its meeting room has been removed.',
    },
    access: {
      title: 'Meeting room is not available',
      description:
        'This session is not active right now, has already ended, or is no longer confirmed.',
    },
    default: {
      title: 'Could not load meeting room',
      description:
        'Unable to load the video session right now. Check your connection and try again.',
    },
  },
  booking: {
    icon: 'calendar',
    notFound: {
      title: 'Booking is no longer available',
      description: 'This booking may have been cancelled or removed.',
    },
    access: {
      title: 'Booking unavailable',
      description: 'You no longer have access to view this booking.',
    },
    default: {
      title: 'Could not refresh booking',
      description:
        'Unable to load the latest booking details right now. Please try again.',
    },
  },
  bookings: {
    icon: 'inbox',
    notFound: {
      title: 'No bookings found',
      description: 'Could not find bookings for this filter.',
    },
    access: {
      title: 'Bookings unavailable',
      description: 'You do not have permission to view these bookings.',
    },
    default: {
      title: 'Could not load bookings',
      description:
        'Unable to load your bookings right now. Check your connection and try again.',
    },
  },
  schedule: {
    icon: 'calendar',
    notFound: {
      title: 'Schedule unavailable',
      description: 'No schedule details were found for this period.',
    },
    access: {
      title: 'Schedule unavailable',
      description: 'You do not have permission to view this schedule.',
    },
    default: {
      title: 'Could not load the schedule',
      description:
        'Unable to load your calendar sessions right now. Please try again.',
    },
  },
  dashboard: {
    icon: 'dashboard',
    notFound: {
      title: 'Dashboard summary unavailable',
      description: 'Could not find your practice summary right now.',
    },
    access: {
      title: 'Dashboard unavailable',
      description:
        'Your account does not currently have access to the dashboard.',
    },
    default: {
      title: 'Could not load your dashboard',
      description:
        'Unable to refresh your practice overview right now. Please try again.',
    },
  },
  patients: {
    icon: 'users',
    notFound: {
      title: 'Patients list unavailable',
      description: 'No assigned patients could be retrieved right now.',
    },
    access: {
      title: 'Patients list locked',
      description: 'You do not have permission to view the patients list.',
    },
    default: {
      title: 'Could not load patients',
      description:
        'Unable to load your assigned patients right now. Please try again.',
    },
  },
  clinicalRecord: {
    icon: 'id-card',
    notFound: {
      title: 'Clinical record is no longer available',
      description:
        'This patient record could not be found or is no longer accessible.',
    },
    access: {
      title: 'Clinical record locked',
      description:
        'Parental consent and an active or recently completed appointment are required to view this record.',
    },
    default: {
      title: 'Could not load the clinical record',
      description:
        'Unable to load this patient’s clinical record right now. Please try again.',
    },
  },
  clinicalNote: {
    icon: 'notes',
    notFound: {
      title: 'This clinical note is no longer available',
      description:
        'It may have been deleted or removed from the patient’s record.',
    },
    access: {
      title: 'Clinical note locked',
      description:
        'Parental consent and an active or recently completed appointment are required to view this note.',
    },
    default: {
      title: 'Could not load this note',
      description:
        'Unable to load this clinical note right now. Please try again.',
    },
  },
  activities: {
    icon: 'activity',
    notFound: {
      title: 'Activities unavailable',
      description: 'The activity library could not be found.',
    },
    access: {
      title: 'Activities unavailable',
      description: 'You do not have permission to view the activity library.',
    },
    default: {
      title: 'Could not load activities',
      description:
        'Unable to load the activity library right now. Please try again.',
    },
  },
  availability: {
    icon: 'clock',
    notFound: {
      title: 'Availability unavailable',
      description: 'Your weekly availability schedule could not be found.',
    },
    access: {
      title: 'Availability unavailable',
      description:
        'You do not have permission to view this availability schedule.',
    },
    default: {
      title: 'Could not load availability',
      description:
        'Unable to load your weekly availability right now. Please try again.',
    },
  },
  profile: {
    icon: 'id-card',
    notFound: {
      title: 'Profile unavailable',
      description: 'Your specialist profile could not be found.',
    },
    access: {
      title: 'Profile unavailable',
      description: 'You do not have permission to view this profile.',
    },
    default: {
      title: 'Could not load your profile',
      description:
        'Unable to load your specialist profile right now. Please try again.',
    },
  },
  pricing: {
    icon: 'id-card',
    notFound: {
      title: 'Pricing not configured',
      description: 'Your consultation and session pricing could not be found.',
    },
    access: {
      title: 'Pricing unavailable',
      description: 'You do not have permission to view pricing details.',
    },
    default: {
      title: 'Could not load pricing',
      description:
        'Unable to load your session pricing right now. Please try again.',
    },
  },
  treatmentPlans: {
    icon: 'file',
    notFound: {
      title: 'No treatment plans found',
      description: 'Treatment plans could not be found for this filter.',
    },
    access: {
      title: 'Treatment plans unavailable',
      description:
        'You do not have permission to view these treatment plans.',
    },
    default: {
      title: 'Could not load treatment plans',
      description:
        'Unable to load treatment plans right now. Please try again.',
    },
  },
  treatmentPlan: {
    icon: 'file',
    notFound: {
      title: 'This treatment plan is no longer available',
      description: 'It may have been deleted or cancelled.',
    },
    access: {
      title: 'Treatment plan unavailable',
      description:
        'You no longer have permission to view this treatment plan.',
    },
    default: {
      title: 'Could not load treatment plan',
      description:
        'Unable to load this treatment plan right now. Please try again.',
    },
  },
  treatmentPlanSessions: {
    icon: 'calendar',
    notFound: {
      title: 'Sessions are no longer available',
      description: 'No sessions could be found for this treatment plan.',
    },
    access: {
      title: 'Sessions unavailable',
      description:
        'You do not have permission to view sessions for this plan.',
    },
    default: {
      title: 'Could not load sessions',
      description:
        'Unable to load the sessions for this treatment plan right now. Please try again.',
    },
  },
  treatmentPlanInvoice: {
    icon: 'file',
    notFound: {
      title: 'Invoice not issued yet',
      description: 'No invoice is available for this treatment plan yet.',
    },
    access: {
      title: 'Invoice unavailable',
      description: 'You do not have permission to view this invoice.',
    },
    default: {
      title: 'Could not load invoice',
      description:
        'Unable to load the invoice for this treatment plan right now. Please try again.',
    },
  },
}

export function isNotFoundError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.status === 404 || error.code === 'NOT_FOUND')
  )
}

export function isLockedError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.code === 'CONSENT_REQUIRED' ||
      error.code === 'NO_ELIGIBLE_APPOINTMENT' ||
      error.code === 'FORBIDDEN' ||
      error.code === 'INVALID_BOOKING_STATE' ||
      error.status === 403)
  )
}

export function getLoadErrorInfo(
  error: unknown,
  context?: LoadErrorContext,
  fallbackTitle?: string,
): LoadErrorInfo {
  const ctx = context ? LOAD_ERROR_MESSAGES[context] : undefined

  if (isNotFoundError(error)) {
    return {
      tone: 'neutral',
      canRetry: false,
      icon: ctx?.icon ?? 'alert',
      title: ctx ? ctx.notFound.title : (fallbackTitle ?? 'Item is no longer available'),
      description: ctx
        ? ctx.notFound.description
        : 'It may have been deleted or removed.',
    }
  }

  if (isLockedError(error)) {
    return {
      tone: 'warning',
      canRetry: false,
      icon: 'lock',
      title: ctx ? ctx.access.title : (fallbackTitle ?? 'Access unavailable'),
      description:
        error instanceof ApiError && error.code === 'CONSENT_REQUIRED'
          ? error.message
          : ctx
            ? ctx.access.description
            : getApiErrorMessage(error),
    }
  }

  if (
    error instanceof ApiError &&
    (error.code === 'NETWORK_ERROR' ||
      error.code === 'TIMEOUT' ||
      error.code === 'UNAUTHORIZED' ||
      error.code === 'INVALID_TOKEN')
  ) {
    return {
      tone: 'danger',
      canRetry: error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT',
      icon: ctx?.icon ?? 'alert',
      title:
        fallbackTitle ?? ctx?.default.title ?? 'Could not load this information',
      description: error.message,
    }
  }

  const raw = getApiErrorMessage(error)
  const description =
    ctx && GENERIC_ERROR_MESSAGES.has(raw.trim().toLowerCase())
      ? ctx.default.description
      : raw

  return {
    tone: 'danger',
    canRetry: true,
    icon: ctx?.icon ?? 'alert',
    title:
      fallbackTitle ?? ctx?.default.title ?? 'Could not load this information',
    description,
  }
}
