import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/icons/Icon'
import { BookingReviewPanel } from '../components/bookings/BookingReviewPanel'
import { BookingStatusBadge } from '../components/bookings/bookingStatus'
import { MonthCalendar } from '../components/bookings/MonthCalendar'
import { ApiErrorNotice } from '../components/ui/ApiErrorNotice'
import { buttonStyles } from '../components/ui/buttonStyles'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader } from '../components/ui/PageHeader'
import { Skeleton } from '../components/ui/Skeleton'
import { useCalendar } from '../hooks/queries/calendar/calendar.queries'
import { useBookings } from '../hooks/queries/bookings/bookings.queries'
import { formatDateTime, monthRange, toDateKey } from '../lib/format'
import type { BookingStatus } from '../types/booking.types'
import { ROUTES } from '../router/routes'

type BookingTab = 'pending' | 'confirmed' | 'past'
const BOOKING_PAGE_SIZE = 3
const SESSION_PAGE_SIZE = 3

const tabs: Array<{ value: BookingTab; label: string }> = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'past', label: 'Past sessions' },
]

const tabEmptyContent: Record<
  BookingTab,
  { title: string; description: string }
> = {
  pending: {
    title: 'No pending booking requests',
    description:
      'New requests appear here for approval, rejection, or a proposed new time.',
  },
  confirmed: {
    title: 'No confirmed sessions',
    description:
      'Bookings confirmed through the specialist API appear in this list and on the schedule.',
  },
  past: {
    title: 'No past sessions',
    description:
      'Completed and rejected bookings appear here for reference.',
  },
}

function matchesTab(status: BookingStatus, tab: BookingTab): boolean {
  if (tab === 'pending') {
    return status === 'PENDING' || status === 'RESCHEDULE_PENDING'
  }

  if (tab === 'confirmed') {
    return status === 'CONFIRMED'
  }

  return status === 'COMPLETED' || status === 'REJECTED'
}

export function BookingsPage() {
  const [tab, setTab] = useState<BookingTab>('pending')
  const [bookingPageIndex, setBookingPageIndex] = useState(0)
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null,
  )
  const [monthOffset, setMonthOffset] = useState(0)
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null)
  const [sessionPageIndex, setSessionPageIndex] = useState(0)
  const range = monthRange(monthOffset)

  const bookings = useBookings()
  const calendar = useCalendar(range.from, range.to)

  const selectedBooking =
    bookings.data?.find((booking) => booking.id === selectedBookingId) ?? null
  const visibleBookings =
    bookings.data?.filter((booking) => matchesTab(booking.status, tab)) ?? []
  const bookingPageCount = Math.ceil(visibleBookings.length / BOOKING_PAGE_SIZE)
  const currentBookingPage = Math.min(
    bookingPageIndex,
    Math.max(0, bookingPageCount - 1),
  )
  const displayedBookings = visibleBookings.slice(
    currentBookingPage * BOOKING_PAGE_SIZE,
    (currentBookingPage + 1) * BOOKING_PAGE_SIZE,
  )
  const empty = tabEmptyContent[tab]

  const allEvents = calendar.data?.events ?? []
  const filteredEvents = selectedDateKey
    ? allEvents.filter(
        (event) => toDateKey(new Date(event.scheduledAt)) === selectedDateKey,
      )
    : allEvents
  const sortedEvents = [...filteredEvents].sort(
    (a, b) =>
      new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
  )
  const sessionPageCount = Math.ceil(sortedEvents.length / SESSION_PAGE_SIZE)
  const currentSessionPage = Math.min(
    sessionPageIndex,
    Math.max(0, sessionPageCount - 1),
  )
  const displayedEvents = sortedEvents.slice(
    currentSessionPage * SESSION_PAGE_SIZE,
    (currentSessionPage + 1) * SESSION_PAGE_SIZE,
  )

  const selectedDateLabel = selectedDateKey
    ? new Date(selectedDateKey + 'T00:00:00').toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  const countForTab = (value: BookingTab) =>
    bookings.data?.filter((booking) => matchesTab(booking.status, value))
      .length ?? 0

  const handleTabChange = (nextTab: BookingTab) => {
    setTab(nextTab)
    setSelectedBookingId(null)
    setBookingPageIndex(0)
  }

  const handleMonthOffsetChange = (next: number) => {
    setMonthOffset(next)
    setSelectedDateKey(null)
    setSessionPageIndex(0)
  }

  const handleSelectedDateChange = (dateKey: string | null) => {
    setSelectedDateKey(dateKey)
    setSessionPageIndex(0)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Care operations"
        title="Bookings & Schedule"
        description="Review requests, manage approved sessions, and keep track of past appointments."
        actions={
          <Link
            className={buttonStyles({ variant: 'secondary' })}
            to={ROUTES.availability}
          >
            <Icon name="clock" size={15} />
            Manage availability
          </Link>
        }
      />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.85fr)]">
        <Card>
          <CardHeader
            title="Schedule"
            description="Monthly schedule view for confirmed, pending, and completed sessions. Click any day with sessions to view cases."
          />
          <CardBody>
            <MonthCalendar
              monthOffset={monthOffset}
              onMonthOffsetChange={handleMonthOffsetChange}
              events={allEvents}
              isLoading={calendar.isLoading}
              selectedDateKey={selectedDateKey}
              onSelectDateKey={handleSelectedDateChange}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title={selectedDateLabel ? `Sessions for ${selectedDateLabel}` : 'Session list'}
            description={
              selectedDateKey
                ? `${sortedEvents.length} ${
                    sortedEvents.length === 1 ? 'session' : 'sessions'
                  } for this day (view only).`
                : 'Appointments in the displayed month, ordered by time.'
            }
            action={
              selectedDateKey ? (
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                  onClick={() => handleSelectedDateChange(null)}
                >
                  View all month
                </button>
              ) : null
            }
          />
          <CardBody flush>
            {calendar.isLoading ? (
              <div className="grid gap-2 p-5" aria-label="Loading sessions">
                {[0, 1, 2].map((item) => (
                  <Skeleton className="h-14 w-full rounded-lg" key={item} />
                ))}
              </div>
            ) : calendar.isError ? (
              <div className="p-5">
                <ApiErrorNotice
                  error={calendar.error}
                  title="Could not load the schedule"
                  onRetry={() => {
                    void calendar.refetch()
                  }}
                />
              </div>
            ) : displayedEvents.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {displayedEvents.map((event) => {
                  const matchingBooking = bookings.data?.find((b) => b.id === event.id)
                  return (
                    <div className="px-5 py-3 hover:bg-slate-50/50 transition" key={event.id}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {event.child.firstName} {event.child.lastName}
                          </p>
                          {matchingBooking ? (
                            <p className="mt-0.5 truncate text-xs text-slate-500">
                              Parent: {matchingBooking.parent.fullName}
                            </p>
                          ) : null}
                          <p className="mt-1 text-xs text-slate-500">
                            {formatDateTime(event.scheduledAt)}
                          </p>
                          {matchingBooking?.reason ? (
                            <p className="mt-1.5 rounded-lg border border-slate-100 bg-slate-50 p-2 text-xs text-slate-600">
                              <span className="font-semibold text-slate-700">Reason:</span>{' '}
                              {matchingBooking.reason}
                            </p>
                          ) : null}
                        </div>
                        <BookingStatusBadge status={event.status} />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-5">
                <EmptyState
                  compact
                  icon="calendar"
                  title={selectedDateKey ? 'No sessions on this day' : 'No sessions scheduled'}
                  description={
                    selectedDateKey
                      ? 'No appointments are scheduled for the selected day.'
                      : 'Sessions with a scheduled time in this month will appear here.'
                  }
                  action={
                    selectedDateKey ? (
                      <button
                        type="button"
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                        onClick={() => handleSelectedDateChange(null)}
                      >
                        Show all month
                      </button>
                    ) : null
                  }
                />
              </div>
            )}
            {!calendar.isLoading && !calendar.isError && sortedEvents.length > 0 ? (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3">
                <p className="text-xs text-slate-500" aria-live="polite">
                  Showing {currentSessionPage * SESSION_PAGE_SIZE + 1} to{' '}
                  {Math.min((currentSessionPage + 1) * SESSION_PAGE_SIZE, sortedEvents.length)} of {sortedEvents.length}
                </p>
                {sessionPageCount > 1 ? (
                  <nav className="flex items-center gap-1" aria-label="Session list pages">
                    <button
                      type="button"
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => setSessionPageIndex(currentSessionPage - 1)}
                      disabled={currentSessionPage === 0}
                      aria-label="Previous sessions page"
                    >
                      Previous
                    </button>
                    <span className="min-w-16 text-center text-xs font-medium text-slate-600" aria-live="polite">
                      {currentSessionPage + 1} / {sessionPageCount}
                    </span>
                    <button
                      type="button"
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => setSessionPageIndex(currentSessionPage + 1)}
                      disabled={currentSessionPage >= sessionPageCount - 1}
                      aria-label="Next sessions page"
                    >
                      Next
                    </button>
                  </nav>
                ) : null}
              </div>
            ) : null}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(340px,0.9fr)]">
        <Card>
          <CardHeader
            title="Bookings"
            description="Requests, confirmed sessions, and past appointments."
          />
          <div className="border-b border-slate-200 px-4 pt-3 sm:px-5">
            <div
              className="flex gap-1 overflow-x-auto"
              role="tablist"
              aria-label="Booking status"
            >
              {tabs.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  role="tab"
                  id={`booking-tab-${item.value}`}
                  aria-selected={tab === item.value}
                  aria-controls="booking-tab-panel"
                  className={`shrink-0 border-b-2 px-3 py-2.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                    tab === item.value
                      ? 'border-teal-700 text-teal-800'
                      : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                  onClick={() => handleTabChange(item.value)}
                >
                  {item.label}
                  <span className="ml-1.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">
                    {countForTab(item.value)}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div
            className="p-5"
            role="tabpanel"
            id="booking-tab-panel"
            aria-labelledby={`booking-tab-${tab}`}
          >
            {bookings.isLoading ? (
              <div className="grid gap-2" aria-label="Loading bookings">
                {[0, 1, 2].map((item) => (
                  <Skeleton className="h-20 w-full rounded-xl" key={item} />
                ))}
              </div>
            ) : bookings.isError ? (
              <ApiErrorNotice
                error={bookings.error}
                title="Could not load bookings"
                onRetry={() => {
                  void bookings.refetch()
                }}
              />
            ) : displayedBookings.length > 0 ? (
              <div className="grid gap-2">
                {displayedBookings.map((booking) => {
                  const selected = booking.id === selectedBookingId
                  return (
                    <button
                      type="button"
                      className={`rounded-xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                        selected
                          ? 'border-teal-300 bg-teal-50/60 ring-1 ring-teal-200'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                      }`}
                      key={booking.id}
                      aria-pressed={selected}
                      onClick={() => setSelectedBookingId(booking.id)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900">
                            {booking.child.firstName}{' '}
                            {booking.child.lastName}
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-500">
                            Parent: {booking.parent.fullName}
                          </p>
                        </div>
                        <BookingStatusBadge status={booking.status} />
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-500">
                        <span>
                          Requested {formatDateTime(booking.requestedAt)}
                        </span>
                        <span>
                          Scheduled {formatDateTime(booking.scheduledAt)}
                        </span>
                        {booking.proposals.length > 0 ? (
                          <span>
                            {booking.proposals.length}{' '}
                            {booking.proposals.length === 1
                              ? 'proposal'
                              : 'proposals'}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <p className="line-clamp-1 text-[10px] text-slate-500">
                          {booking.reason ?? 'No parent reason provided.'}
                        </p>
                        <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold text-teal-700">
                          Review
                          <Icon name="chevron-right" size={12} />
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <EmptyState
                icon="inbox"
                title={empty.title}
                description={empty.description}
              />
            )}
            {!bookings.isLoading && !bookings.isError && visibleBookings.length > 0 ? (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                <p className="text-xs text-slate-500" aria-live="polite">
                  Showing {currentBookingPage * BOOKING_PAGE_SIZE + 1} to{' '}
                  {Math.min(
                    (currentBookingPage + 1) * BOOKING_PAGE_SIZE,
                    visibleBookings.length,
                  )}{' '}
                  of {visibleBookings.length} bookings
                </p>
                {bookingPageCount > 1 ? (
                  <nav className="flex items-center gap-1" aria-label="Booking list pages">
                    <button
                      type="button"
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => setBookingPageIndex(currentBookingPage - 1)}
                      disabled={currentBookingPage === 0}
                      aria-label="Previous bookings page"
                    >
                      Previous
                    </button>
                    <span className="min-w-16 text-center text-xs font-medium text-slate-600" aria-live="polite">
                      {currentBookingPage + 1} / {bookingPageCount}
                    </span>
                    <button
                      type="button"
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => setBookingPageIndex(currentBookingPage + 1)}
                      disabled={currentBookingPage >= bookingPageCount - 1}
                      aria-label="Next bookings page"
                    >
                      Next
                    </button>
                  </nav>
                ) : null}
              </div>
            ) : null}
          </div>
        </Card>

        <BookingReviewPanel
          key={selectedBooking?.id ?? 'no-booking'}
          booking={selectedBooking}
        />
      </div>
    </div>
  )
}
