import { Icon } from '../icons/Icon'
import { calendarDotClasses } from './bookingStatusMeta'
import type { CalendarEvent } from '../../types/booking.types'
import { toDateKey } from '../../lib/format'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

type CalendarCell = {
  day: number
  current: boolean
}

type MonthCalendarProps = {
  monthOffset: number
  onMonthOffsetChange: (next: number) => void
  events: CalendarEvent[]
  isLoading: boolean
  selectedDateKey?: string | null
  onSelectDateKey?: (dateKey: string | null) => void
}

function buildCells(year: number, month: number): CalendarCell[] {
  const firstDay = new Date(year, month, 1)
  const leadingDays = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPreviousMonth = new Date(year, month, 0).getDate()
  const cells: CalendarCell[] = []

  for (let index = leadingDays - 1; index >= 0; index -= 1) {
    cells.push({
      day: daysInPreviousMonth - index,
      current: false,
    })
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      day,
      current: true,
    })
  }

  let nextDay = 1
  while (cells.length % 7 !== 0) {
    cells.push({
      day: nextDay,
      current: false,
    })
    nextDay += 1
  }

  return cells
}

export function MonthCalendar({
  monthOffset,
  onMonthOffsetChange,
  events,
  isLoading,
  selectedDateKey,
  onSelectDateKey,
}: MonthCalendarProps) {
  const today = new Date()
  const anchor = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1)
  const cells = buildCells(anchor.getFullYear(), anchor.getMonth())
  const monthLabel = new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
  }).format(anchor)

  const eventsByDate = new Map<string, CalendarEvent[]>()
  events.forEach((event) => {
    const key = toDateKey(new Date(event.scheduledAt))
    const dayEvents = eventsByDate.get(key)

    if (dayEvents) {
      dayEvents.push(event)
    } else {
      eventsByDate.set(key, [event])
    }
  })

  return (
    <div aria-busy={isLoading}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p
          className="text-sm font-semibold text-slate-900"
          aria-live="polite"
        >
          {monthLabel}
        </p>
        <div className="flex items-center gap-1">
          {monthOffset !== 0 ? (
            <button
              type="button"
              className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-300 bg-white px-2.5 text-[10px] font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
              onClick={() => onMonthOffsetChange(0)}
            >
              Today
            </button>
          ) : null}
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            aria-label="Previous month"
            onClick={() => onMonthOffsetChange(monthOffset - 1)}
          >
            <Icon name="chevron-left" size={16} />
          </button>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            aria-label="Next month"
            onClick={() => onMonthOffsetChange(monthOffset + 1)}
          >
            <Icon name="chevron-right" size={16} />
          </button>
        </div>
      </div>

      <div className="mb-1.5 mt-4 grid grid-cols-7 gap-1" aria-hidden="true">
        {WEEKDAYS.map((day) => (
          <span
            className="py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500"
            key={day}
          >
            {day}
          </span>
        ))}
      </div>

      <div
        className="grid grid-cols-7 gap-1"
        aria-label={`Calendar for ${monthLabel}. ${
          isLoading
            ? 'Loading sessions.'
            : `${events.length} ${events.length === 1 ? 'session' : 'sessions'} loaded.`
        }`}
      >
        {cells.map((cell, index) => {
          const isToday =
            cell.current &&
            cell.day === today.getDate() &&
            anchor.getMonth() === today.getMonth() &&
            anchor.getFullYear() === today.getFullYear()
          const dateKey = cell.current
            ? toDateKey(
                new Date(anchor.getFullYear(), anchor.getMonth(), cell.day),
              )
            : null
          const dayEvents = dateKey ? (eventsByDate.get(dateKey) ?? []) : []
          const hasEvents = dayEvents.length > 0
          const isSelected = Boolean(dateKey && selectedDateKey === dateKey)

          if (cell.current && hasEvents) {
            return (
              <button
                type="button"
                onClick={() => onSelectDateKey?.(isSelected ? null : dateKey)}
                className={`flex min-h-11 flex-col items-center justify-center gap-1 rounded-lg border py-1 text-xs transition cursor-pointer ${
                  isSelected
                    ? 'border-teal-600 bg-teal-100/70 text-teal-950 font-bold ring-2 ring-teal-600 shadow-sm'
                    : 'border-teal-200 bg-teal-50/60 text-slate-800 hover:border-teal-400 hover:bg-teal-100/50'
                }`}
                key={`${cell.current ? 'current' : 'outside'}-${index}-${cell.day}`}
                aria-label={`${cell.day} ${monthLabel}, ${dayEvents.length} ${
                  dayEvents.length === 1 ? 'session' : 'sessions'
                }. Click to view cases.`}
              >
                <span
                  className={
                    isToday
                      ? 'flex h-7 w-7 items-center justify-center rounded-full bg-teal-700 font-semibold text-white'
                      : ''
                  }
                >
                  {cell.day}
                </span>
                <span className="flex h-1.5 items-center gap-0.5" aria-hidden="true">
                  {dayEvents.slice(0, 3).map((event) => (
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${calendarDotClasses[event.status]}`}
                      key={event.id}
                    />
                  ))}
                </span>
              </button>
            )
          }

          return (
            <div
              className={`flex min-h-11 flex-col items-center justify-center gap-1 rounded-lg border py-1 text-xs ${
                cell.current
                  ? 'border-transparent text-slate-700'
                  : 'border-transparent text-slate-500'
              }`}
              key={`${cell.current ? 'current' : 'outside'}-${index}-${cell.day}`}
              aria-label={
                cell.current
                  ? `${cell.day} ${monthLabel}, no sessions`
                  : undefined
              }
            >
              <span
                className={
                  isToday
                    ? 'flex h-7 w-7 items-center justify-center rounded-full bg-teal-700 font-semibold text-white'
                    : ''
                }
              >
                {cell.day}
              </span>
            </div>
          )
        })}
      </div>

      <div
        className="mt-4 flex flex-wrap items-center gap-3 text-[10px] font-medium text-slate-500"
        aria-label="Session status colour key"
      >
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Confirmed
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          Pending
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-sky-500" />
          Reschedule pending
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-slate-400" />
          Completed
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-rose-500" />
          Rejected
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-slate-300" />
          Cancelled
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-rose-400" />
          No show
        </span>
      </div>
    </div>
  )
}
