import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Icon } from '../components/icons/Icon'
import { BookingReviewModal } from '../components/bookings/BookingReviewModal'
import { BookingStatusBadge } from '../components/bookings/bookingStatus'
import { bookingStatusLabels } from '../components/bookings/bookingStatusMeta'
import { MonthCalendar } from '../components/bookings/MonthCalendar'
import { ApiErrorNotice } from '../components/ui/ApiErrorNotice'
import { Badge } from '../components/ui/Badge'
import { buttonStyles } from '../components/ui/buttonStyles'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Select } from '../components/ui/Field'
import { PageHeader } from '../components/ui/PageHeader'
import { Pagination } from '../components/ui/Pagination'
import { Skeleton } from '../components/ui/Skeleton'
import { useCalendar } from '../hooks/queries/calendar/calendar.queries'
import { usePagination } from '../hooks/use-pagination'
import {
  useBookingById,
  useBookings,
} from '../hooks/queries/bookings/bookings.queries'
import {
  formatDateTime,
  formatScheduledDateTime,
  monthRange,
  parseScheduledDate,
  toDateKey,
} from '../lib/format'
import { BOOKING_STATUSES, type BookingStatus } from '../types/booking.types'
import { ROUTES } from '../router/routes'

type StatusFilter = 'ALL' | BookingStatus

export function BookingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [monthOffset, setMonthOffset] = useState(0)
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null)
  const range = monthRange(monthOffset)

  const selectedBookingId = searchParams.get('bookingId')
  const bookings = useBookings(
    statusFilter === 'ALL' ? undefined : statusFilter,
  )
  const calendar = useCalendar(range.from, range.to)
  const linkedBooking = useBookingById(selectedBookingId)

  const selectedBooking =
    bookings.data?.find((booking) => booking.id === selectedBookingId) ??
    linkedBooking.data ??
    null

  const allEvents = useMemo(() => calendar.data?.events ?? [], [calendar.data])
  const sortedEvents = useMemo(() => {
    const filtered = selectedDateKey
      ? allEvents.filter((event) => {
          const parsed = parseScheduledDate(event.scheduledAt)
          return parsed ? toDateKey(parsed) === selectedDateKey : false
        })
      : allEvents

    return [...filtered].sort(
      (a, b) =>
        (parseScheduledDate(a.scheduledAt)?.getTime() ?? 0) -
        (parseScheduledDate(b.scheduledAt)?.getTime() ?? 0),
    )
  }, [allEvents, selectedDateKey])

  const schedulePager = usePagination(
    sortedEvents,
    5,
    `${range.from}:${range.to}:${selectedDateKey ?? 'all'}`,
  )
  const bookingsPager = usePagination(
    bookings.data ?? [],
    5,
    statusFilter,
  )

  const selectedDateLabel = selectedDateKey
    ? new Date(selectedDateKey + 'T00:00:00').toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : null

  const selectBooking = (bookingId: string | null) => {
    const next = new URLSearchParams(searchParams)

    if (bookingId) {
      next.set('bookingId', bookingId)
    } else {
      next.delete('bookingId')
    }

    setSearchParams(next, { replace: true })
  }

  const handleStatusChange = (value: StatusFilter) => {
    setStatusFilter(value)
    selectBooking(null)
  }

  const handleMonthOffsetChange = (next: number) => {
    setMonthOffset(next)
    setSelectedDateKey(null)
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Bookings"
        icon="calendar"
        actions={
          <>
            <Badge tone="neutral">
              {bookings.data?.length ?? 0}{' '}
              {statusFilter === 'ALL'
                ? 'bookings'
                : bookingStatusLabels[statusFilter].toLowerCase()}
            </Badge>
            <Link
              className={buttonStyles({ variant: 'secondary', size: 'sm' })}
              to={ROUTES.availability}
            >
              <Icon name="clock" size={14} />
              Availability
            </Link>
          </>
        }
      />

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader title="Schedule" />
          <CardBody>
            <MonthCalendar
              monthOffset={monthOffset}
              onMonthOffsetChange={handleMonthOffsetChange}
              events={allEvents}
              isLoading={calendar.isLoading}
              selectedDateKey={selectedDateKey}
              onSelectDateKey={setSelectedDateKey}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title={selectedDateLabel ? `Sessions · ${selectedDateLabel}` : 'Sessions'}
            action={
              selectedDateKey ? (
                <button
                  type="button"
                  className="text-[11px] font-semibold text-teal-700 hover:text-teal-900"
                  onClick={() => setSelectedDateKey(null)}
                >
                  Clear filter
                </button>
              ) : null
            }
          />
          <CardBody flush>
            {calendar.isLoading ? (
              <div className="grid gap-2 p-4">
                {[0, 1, 2].map((item) => (
                  <Skeleton className="h-14 w-full rounded-lg" key={item} />
                ))}
              </div>
            ) : calendar.isError ? (
              <div className="p-4">
                <ApiErrorNotice
                  error={calendar.error}
                  title="Could not load the schedule"
                  onRetry={() => {
                    void calendar.refetch()
                  }}
                />
              </div>
            ) : sortedEvents.length > 0 ? (
              <div className="divide-y divide-slate-200">
                {schedulePager.visibleItems.map((event) => (
                  <button
                    type="button"
                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-600"
                    key={event.id}
                    onClick={() => selectBooking(event.id)}
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                      <Icon name="calendar" size={14} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-slate-800">
                        {event.child.firstName} {event.child.lastName}
                      </p>
                      <p className="mt-0.5 truncate text-[10px] text-slate-500">
                        {formatScheduledDateTime(event.scheduledAt)}
                      </p>
                    </div>
                    <BookingStatusBadge status={event.status} />
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4">
                <EmptyState
                  compact
                  icon="calendar"
                  title="No sessions"
                  description={
                    selectedDateKey
                      ? 'Nothing scheduled for this day.'
                      : 'Nothing scheduled this month.'
                  }
                />
              </div>
            )}
          </CardBody>
          <Pagination
            compact
            label="Schedule"
            onPageChange={schedulePager.setPage}
            page={schedulePager.page}
            rangeEnd={schedulePager.rangeEnd}
            rangeStart={schedulePager.rangeStart}
            total={schedulePager.total}
            totalPages={schedulePager.totalPages}
          />
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between gap-3 border-b border-slate-300 px-5 py-4">
          <h2 className="text-sm font-semibold tracking-tight text-slate-900">
            Bookings
          </h2>
          <Select
            aria-label="Filter bookings by status"
            value={statusFilter}
            onChange={(event) =>
              handleStatusChange(event.target.value as StatusFilter)
            }
            className="h-8 w-40 shrink-0 text-xs"
          >
            <option value="ALL">All statuses</option>
            {BOOKING_STATUSES.map((status) => (
              <option value={status} key={status}>
                {bookingStatusLabels[status]}
              </option>
            ))}
          </Select>
        </div>
        <CardBody flush>
            {bookings.isLoading ? (
              <div className="grid gap-2 p-4">
                {[0, 1, 2].map((item) => (
                  <Skeleton className="h-16 w-full rounded-xl" key={item} />
                ))}
              </div>
            ) : bookings.isError ? (
              <div className="p-4">
                <ApiErrorNotice
                  error={bookings.error}
                  title="Could not load bookings"
                  onRetry={() => {
                    void bookings.refetch()
                  }}
                />
              </div>
            ) : bookings.data && bookings.data.length > 0 ? (
              <div className="divide-y divide-slate-200">
                {bookingsPager.visibleItems.map((booking) => {
                  const selected = booking.id === selectedBookingId
                  return (
                    <button
                      type="button"
                      className={`flex w-full items-start gap-3 px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-600 ${
                        selected
                          ? 'bg-teal-50/70'
                          : 'hover:bg-slate-50/70'
                      }`}
                      key={booking.id}
                      aria-pressed={selected}
                      onClick={() => selectBooking(booking.id)}
                    >
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                        <Icon name="inbox" size={15} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-xs font-semibold text-slate-900">
                            {booking.child.firstName} {booking.child.lastName}
                          </p>
                          <BookingStatusBadge status={booking.status} />
                        </div>
                        <p className="mt-0.5 truncate text-[10px] text-slate-500">
                          {booking.scheduledAt
                            ? formatScheduledDateTime(booking.scheduledAt)
                            : formatDateTime(booking.requestedAt)}{' '}
                          · {booking.parent.fullName}
                        </p>
                        {booking.reason ? (
                          <p className="mt-1 line-clamp-1 text-[10px] text-slate-500">
                            {booking.reason}
                          </p>
                        ) : null}
                      </div>
                      <Icon
                        name="chevron-right"
                        size={14}
                        className={`self-center ${
                          selected ? 'text-teal-700' : 'text-slate-400'
                        }`}
                      />
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="p-4">
                <EmptyState
                  icon="inbox"
                  title="No bookings"
                  description={
                    statusFilter === 'ALL'
                      ? 'Bookings will appear here.'
                      : `No ${bookingStatusLabels[statusFilter].toLowerCase()} bookings.`
                  }
                />
              </div>
            )}
          </CardBody>
          <Pagination
            label="Bookings"
            onPageChange={bookingsPager.setPage}
            page={bookingsPager.page}
            rangeEnd={bookingsPager.rangeEnd}
            rangeStart={bookingsPager.rangeStart}
            total={bookingsPager.total}
            totalPages={bookingsPager.totalPages}
          />
        </Card>

      <BookingReviewModal
        open={Boolean(selectedBookingId)}
        booking={selectedBooking}
        isLoading={Boolean(selectedBookingId) && linkedBooking.isLoading && !selectedBooking}
        onClose={() => selectBooking(null)}
      />
    </div>
  )
}
