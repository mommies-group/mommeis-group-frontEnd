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
