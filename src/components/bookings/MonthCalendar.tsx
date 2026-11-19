import { useState } from 'react'
import { Icon } from '../icons/Icon'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

type CalendarCell = {
  day: number
  current: boolean
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

export function MonthCalendar() {
  const today = new Date()
  const [monthOffset, setMonthOffset] = useState(0)
  const anchor = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1)
  const cells = buildCells(anchor.getFullYear(), anchor.getMonth())
  const monthLabel = new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
  }).format(anchor)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p
          className="text-sm font-semibold text-slate-900"
          aria-live="polite"
        >
          {monthLabel}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            aria-label="Previous month"
            onClick={() => setMonthOffset((value) => value - 1)}
          >
            <Icon name="chevron-left" size={16} />
          </button>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            aria-label="Next month"
            onClick={() => setMonthOffset((value) => value + 1)}
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
        aria-label={`Calendar for ${monthLabel}. No sessions are loaded in this preview.`}
      >
        {cells.map((cell, index) => {
          const isToday =
            cell.current &&
            cell.day === today.getDate() &&
            anchor.getMonth() === today.getMonth() &&
            anchor.getFullYear() === today.getFullYear()

          return (
            <div
              className={`flex aspect-square min-h-9 items-center justify-center rounded-lg border text-xs ${
                cell.current
                  ? 'border-transparent text-slate-700'
                  : 'border-transparent text-slate-300'
              }`}
              key={`${cell.current ? 'current' : 'outside'}-${index}-${cell.day}`}
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
    </div>
  )
}
