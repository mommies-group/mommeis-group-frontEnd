const dateFormatter = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

const clockFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

const birthDateFormatter = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return 'Not provided'
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Not provided' : dateFormatter.format(date)
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return 'Not scheduled'
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Not scheduled'
    : dateTimeFormatter.format(date)
}

export function formatTime(value: string | null | undefined): string {
  if (!value) {
    return '—'
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : timeFormatter.format(date)
}

export function formatClockTime(value: string | null | undefined): string {
  if (!value) {
    return '—'
  }

  const [hours, minutes] = value.split(':').map(Number)

  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return '—'
  }

  return clockFormatter.format(new Date(2026, 0, 1, hours, minutes))
}

export function formatBirthDate(value: string | null | undefined): string {
  if (!value) {
    return 'Not provided'
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Not provided'
    : birthDateFormatter.format(date)
}

export function toDateInputValue(value: string | null | undefined): string {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function toDateTimeIso(date: string, time: string): string | null {
  if (!date || !time) {
    return null
  }

  const value = new Date(`${date}T${time}:00`)
  return Number.isNaN(value.getTime()) ? null : value.toISOString()
}

export function toDueDateIso(date: string): string | null {
  if (!date) {
    return null
  }

  const value = new Date(`${date}T18:00:00`)
  return Number.isNaN(value.getTime()) ? null : value.toISOString()
}

export function isSameLocalDay(value: string, date: Date): boolean {
  const parsed = new Date(value)
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.getFullYear() === date.getFullYear() &&
    parsed.getMonth() === date.getMonth() &&
    parsed.getDate() === date.getDate()
  )
}

export function monthRange(monthOffset: number): { from: string; to: string } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)
  const end = new Date(now.getFullYear(), now.getMonth() + monthOffset + 1, 0)
  return { from: toDateKey(start), to: toDateKey(end) }
}

export function initials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}
