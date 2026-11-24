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
