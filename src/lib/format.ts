const dateFormatter = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: '2-digit',
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
