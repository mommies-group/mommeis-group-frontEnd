import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/icons/Icon'
import { BookingReviewPanel } from '../components/bookings/BookingReviewPanel'
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
import { Skeleton } from '../components/ui/Skeleton'
import { useCalendar } from '../hooks/queries/calendar/calendar.queries'
import { useBookings } from '../hooks/queries/bookings/bookings.queries'
import { formatDateTime, monthRange, toDateKey } from '../lib/format'
import { BOOKING_STATUSES, type BookingStatus } from '../types/booking.types'
import { ROUTES } from '../router/routes'

type StatusFilter = 'ALL' | BookingStatus

export function BookingsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null,
  )
  const [monthOffset, setMonthOffset] = useState(0)
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null)
  const range = monthRange(monthOffset)

  const bookings = useBookings(
    statusFilter === 'ALL' ? undefined : statusFilter,
  )
  const calendar = useCalendar(range.from, range.to)

  const selectedBooking =
    bookings.data?.find((booking) => booking.id === selectedBookingId) ?? null

  const allEvents = useMemo(() => calendar.data?.events ?? [], [calendar.data])
  const sortedEvents = useMemo(() => {
    const filtered = selectedDateKey
      ? allEvents.filter(
          (event) => toDateKey(new Date(event.scheduledAt)) === selectedDateKey,
        )
      : allEvents

    return [...filtered].sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    )
  }, [allEvents, selectedDateKey])

  const selectedDateLabel = selectedDateKey
    ? new Date(selectedDateKey + 'T00:00:00').toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : null

  const handleStatusChange = (value: StatusFilter) => {
    setStatusFilter(value)
    setSelectedBookingId(null)
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
              <div className="max-h-[360px] divide-y divide-slate-100 overflow-y-auto">
                {sortedEvents.map((event) => (
                  <button
                    type="button"
                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-600"
                    key={event.id}
                    onClick={() => setSelectedBookingId(event.id)}
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                      <Icon name="calendar" size={14} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-slate-800">
                        {event.child.firstName} {event.child.lastName}
                      </p>
                      <p className="mt-0.5 truncate text-[10px] text-slate-500">
                        {formatDateTime(event.scheduledAt)}
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
        </Card>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.9fr)]">
        <Card>
          <CardHeader
            title="Bookings"
            action={
              <Select
                aria-label="Filter bookings by status"
                value={statusFilter}
                onChange={(event) =>
                  handleStatusChange(event.target.value as StatusFilter)
                }
                className="h-8 w-40 text-xs"
              >
                <option value="ALL">All statuses</option>
                {BOOKING_STATUSES.map((status) => (
                  <option value={status} key={status}>
                    {bookingStatusLabels[status]}
                  </option>
                ))}
              </Select>
            }
          />
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
              <div className="max-h-[460px] divide-y divide-slate-100 overflow-y-auto">
                {bookings.data.map((booking) => {
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
                      onClick={() => setSelectedBookingId(booking.id)}
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
                          {formatDateTime(
                            booking.scheduledAt ?? booking.requestedAt,
                          )}{' '}
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
                        className={selected ? 'text-teal-700' : 'text-slate-400'}
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
        </Card>

        <BookingReviewPanel
          key={selectedBooking?.id ?? 'no-booking'}
          booking={selectedBooking}
        />
      </div>
    </div>
  )
}
