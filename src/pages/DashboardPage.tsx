import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Icon, type IconName } from '../components/icons/Icon'
import { BookingReviewModal } from '../components/bookings/BookingReviewModal'
import { BookingStatusBadge } from '../components/bookings/bookingStatus'
import { ApiErrorNotice } from '../components/ui/ApiErrorNotice'
import { Badge } from '../components/ui/Badge'
import { buttonStyles } from '../components/ui/buttonStyles'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Input } from '../components/ui/Field'
import { PageHeader } from '../components/ui/PageHeader'
import { Pagination } from '../components/ui/Pagination'
import { Skeleton } from '../components/ui/Skeleton'
import {
  useApproveBooking,
  useRejectBooking,
} from '../hooks/mutations/bookings/bookings.mutations'
import { useClinicalNoteChildMap } from '../hooks/queries/clinical-notes/clinical-notes.queries'
import { useDashboardSummary } from '../hooks/queries/dashboard/dashboard.queries'
import {
  useBookingById,
  usePendingBookings,
} from '../hooks/queries/bookings/bookings.queries'
import { usePagination } from '../hooks/use-pagination'
import { formatDateTime, formatScheduledDateTime } from '../lib/format'
import { getActionErrorMessage } from '../lib/api-error'
import { notifyError, notifySuccess } from '../lib/toast'
import {
  ROUTES,
  patientNoteRecordPath,
  patientRecordPath,
} from '../router/routes'
import type { Booking } from '../types/booking.types'

type SummaryCardProps = {
  label: string
  icon: IconName
  value: ReactNode
  hint: string
  href?: string
  onOpen?: () => void
}

function SummaryCard({
  label,
  icon,
  value,
  hint,
  href,
  onOpen,
}: SummaryCardProps) {
  const className =
    'group flex min-w-0 flex-col rounded-xl border border-slate-300 bg-white p-4 text-left shadow-sm transition hover:border-teal-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600'
  const content = (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-xs font-semibold text-slate-500">
          {label}
        </p>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
          <Icon name={icon} size={15} />
        </span>
      </div>
      <span className="mt-2 min-w-0 truncate text-2xl font-bold tracking-tight text-slate-900">
        {value}
      </span>
      <p className="mt-0.5 truncate text-[12px] text-slate-500">{hint}</p>
    </>
  )

  if (onOpen) {
    return (
      <button type="button" className={className} onClick={onOpen}>
        {content}
      </button>
    )
  }

  return (
    <Link className={className} to={href ?? ROUTES.dashboard}>
      {content}
    </Link>
  )
}

export function DashboardPage() {
  const summary = useDashboardSummary()
  const pendingBookings = usePendingBookings()
  const approveBooking = useApproveBooking()
  const rejectBooking = useRejectBooking()
  const [rejectingBookingId, setRejectingBookingId] = useState<string | null>(
    null,
  )
  const [rejectReason, setRejectReason] = useState('')
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null)
  const linkedReviewBooking = useBookingById(reviewBookingId)
  const data = summary.data
  const nextAppointment = data?.upcomingAppointments[0]
  const firstPendingId = pendingBookings.data?.[0]?.id ?? null
  const reviewBooking =
    pendingBookings.data?.find((booking) => booking.id === reviewBookingId) ??
    linkedReviewBooking.data ??
    null
  const noteIdsToResolve = (data?.recentActivities ?? [])
    .filter((activity) => activity.type === 'NOTE' && !activity.childId)
    .map((activity) => activity.id)
  const noteChildMap = useClinicalNoteChildMap(noteIdsToResolve)
  const pendingPager = usePagination(
    pendingBookings.data ?? [],
    5,
    'dashboard-pending',
  )
  const isMutatingBooking = approveBooking.isPending || rejectBooking.isPending

  const handleApprove = (booking: Booking) => {
    if (booking.proposals?.[0]?.status === 'PENDING') {
      return
    }

    approveBooking.mutate(booking.id, {
      onSuccess: () => {
        notifySuccess('Booking approved.')
      },
      onError: (error) =>
        notifyError(error, getActionErrorMessage(error, 'booking.approve')),
    })
  }

  const handleReject = (booking: Booking) => {
    if (!rejectReason.trim()) {
      notifyError(null, 'Enter a rejection reason.')
      return
    }

    rejectBooking.mutate(
      { id: booking.id, payload: { reason: rejectReason.trim() } },
      {
        onSuccess: () => {
          setRejectingBookingId(null)
          setRejectReason('')
          notifySuccess('Booking rejected.')
        },
        onError: (error) =>
          notifyError(error, getActionErrorMessage(error, 'booking.reject')),
      },
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Dashboard"
        icon="dashboard"
        actions={
          <>
            <Link
              className={buttonStyles({ variant: 'secondary', size: 'sm' })}
              to={ROUTES.bookings}
            >
              <Icon name="calendar" size={14} />
              Schedule
            </Link>
            <Link
              className={buttonStyles({ variant: 'primary', size: 'sm' })}
              to={ROUTES.activities}
            >
              <Icon name="plus" size={14} />
              New activity
            </Link>
          </>
        }
      />

      {summary.isError ? (
        <ApiErrorNotice
          context="dashboard"
          error={summary.error}
          title="Could not load your dashboard"
          onRetry={() => {
            void summary.refetch()
          }}
        />
      ) : null}

      <section
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Practice summary"
      >
        <SummaryCard
          label="Today's sessions"
          icon="clock"
          value={
            summary.isLoading ? (
              <Skeleton className="h-7 w-12" />
            ) : (
              (data?.todaySessions ?? '—')
            )
          }
          hint="Confirmed today"
          href={ROUTES.bookings}
        />
        <SummaryCard
          label="Pending requests"
          icon="inbox"
          value={
            summary.isLoading ? (
              <Skeleton className="h-7 w-12" />
            ) : (
              (data?.pendingBookingRequests ?? '—')
            )
          }
          hint="Awaiting review"
          href={ROUTES.bookings}
          onOpen={() => {
            if (firstPendingId) {
              setReviewBookingId(firstPendingId)
            }
          }}
        />
        <SummaryCard
          label="Assigned patients"
          icon="users"
          value={
            summary.isLoading ? (
              <Skeleton className="h-7 w-12" />
            ) : (
              (data?.activePatients ?? '—')
            )
          }
          hint="Consent eligible"
          href={ROUTES.patients}
        />
        <SummaryCard
          label="Next appointment"
          icon="calendar"
          value={
            summary.isLoading ? (
              <Skeleton className="h-7 w-28" />
            ) : nextAppointment ? (
              <span className="text-base">{formatScheduledDateTime(nextAppointment.scheduledAt)}</span>
            ) : (
              <span className="text-base">None</span>
            )
          }
          hint={
            nextAppointment
              ? `${nextAppointment.child.firstName} ${nextAppointment.child.lastName}`
              : 'Nothing scheduled'
          }
          href={ROUTES.bookings}
          onOpen={
            nextAppointment
              ? () => setReviewBookingId(nextAppointment.id)
              : undefined
          }
        />
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-5">
          <Card>
            <CardHeader
              title="Upcoming appointments"
              action={
                <Link
                  className={buttonStyles({ variant: 'ghost', size: 'sm' })}
                  to={ROUTES.bookings}
                >
                  View all
                  <Icon name="arrow-right" size={12} />
                </Link>
              }
            />
            <CardBody flush>
              {summary.isLoading ? (
                <div className="grid gap-2 p-4">
                  {[0, 1, 2].map((item) => (
                    <Skeleton className="h-12 w-full rounded-lg" key={item} />
                  ))}
                </div>
              ) : data && data.upcomingAppointments.length > 0 ? (
                <div className="divide-y divide-slate-200">
                  {data.upcomingAppointments.map((appointment) => (
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-600"
                      aria-label={`Review appointment for ${appointment.child.firstName} ${appointment.child.lastName}`}
                      onClick={() => setReviewBookingId(appointment.id)}
                      key={appointment.id}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                        <Icon name="calendar" size={16} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-slate-800">
                          {appointment.child.firstName}{' '}
                          {appointment.child.lastName}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {formatScheduledDateTime(appointment.scheduledAt)}
                        </p>
                      </div>
                      <BookingStatusBadge status={appointment.status} />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4">
                  <EmptyState
                    compact
                    icon="calendar"
                    title="No upcoming appointments"
                  />
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Recent notes & activities" />
            <CardBody flush>
              {summary.isLoading ? (
                <div className="grid gap-2 p-4">
                  {[0, 1, 2].map((item) => (
                    <Skeleton className="h-10 w-full rounded-lg" key={item} />
                  ))}
                </div>
              ) : data && data.recentActivities.length > 0 ? (
                <div className="divide-y divide-slate-200">
                  {data.recentActivities.map((activity) => {
                    const resolvedChildId =
                      activity.type === 'NOTE'
                        ? (activity.childId ?? noteChildMap[activity.id] ?? null)
                        : null
                    const targetPath =
                      activity.type === 'ACTIVITY'
                        ? ROUTES.activities
                        : resolvedChildId
                          ? `${patientRecordPath(resolvedChildId)}#clinical-notes`
                          : patientNoteRecordPath(activity.id)

                    return (
                      <Link
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-slate-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-600"
                        to={targetPath}
                        key={`${activity.type}-${activity.id}`}
                      >
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            activity.type === 'NOTE'
                              ? 'bg-teal-50 text-teal-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Icon
                            name={
                              activity.type === 'NOTE' ? 'notes' : 'activity'
                            }
                            size={14}
                          />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-slate-800">
                            {activity.title}
                          </p>
                          <p className="mt-0.5 truncate text-[12px] text-slate-500">
                            {activity.type === 'NOTE'
                              ? 'Clinical note'
                              : 'Activity'}{' '}
                            · {formatDateTime(activity.createdAt)}
                          </p>
                        </div>
                        <Badge
                          tone={activity.type === 'NOTE' ? 'info' : 'neutral'}
                        >
                          {activity.type === 'NOTE' ? 'Note' : 'Activity'}
                        </Badge>
                        <Icon
                          name="chevron-right"
                          size={14}
                          className="shrink-0 text-slate-400"
                        />
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <div className="p-4">
                  <EmptyState
                    compact
                    icon="activity"
                    title="No recent notes or activities"
                  />
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        <Card className="min-w-0">
          <CardHeader
            title="Pending requests"
            action={
              <button
                type="button"
                className={buttonStyles({ variant: 'ghost', size: 'sm' })}
                disabled={!firstPendingId}
                onClick={() => {
                  if (firstPendingId) {
                    setReviewBookingId(firstPendingId)
                  }
                }}
              >
                Review
                <Icon name="arrow-right" size={12} />
              </button>
            }
          />
          <CardBody flush>
            {pendingBookings.isLoading ? (
              <div className="grid gap-2 p-4">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            ) : pendingBookings.isError ? (
              <div className="p-4">
                <ApiErrorNotice
                  context="bookings"
                  error={pendingBookings.error}
                  title="Could not load requests"
                  onRetry={() => {
                    void pendingBookings.refetch()
                  }}
                />
              </div>
            ) : pendingBookings.data && pendingBookings.data.length > 0 ? (
              <div className="divide-y divide-slate-200">
                {pendingPager.visibleItems.map((booking) => {
                  const childName = `${booking.child.firstName} ${booking.child.lastName}`
                  const awaitingParent = booking.proposals?.[0]?.status === 'PENDING'

                  return (
                    <div
                      className="px-4 py-2.5 transition hover:bg-amber-50/40"
                      key={booking.id}
                    >
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="group flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                          aria-label={`Review request for ${childName}`}
                          onClick={() => setReviewBookingId(booking.id)}
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                            <Icon name="inbox" size={14} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-xs font-semibold text-slate-800 group-hover:text-teal-800">
                              {childName}
                            </span>
                            <span className="mt-0.5 block truncate text-[12px] text-slate-500">
                              {booking.scheduledAt
                                ? formatScheduledDateTime(booking.scheduledAt)
                                : formatDateTime(booking.requestedAt)}
                            </span>
                          </span>
                        </button>
                        <Badge tone="warning">Pending</Badge>
                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            type="button"
                            title={
                              awaitingParent
                                ? 'Waiting for parent confirmation'
                                : 'Approve booking'
                            }
                            aria-label={
                              awaitingParent
                                ? `Approve booking for ${childName} (awaiting parent)`
                                : `Approve booking for ${childName}`
                            }
                            disabled={isMutatingBooking || awaitingParent}
                            onClick={() => handleApprove(booking)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Icon name="check" size={13} />
                          </button>
                          <button
                            type="button"
                            title="Reject booking"
                            aria-label={`Reject booking for ${childName}`}
                            disabled={isMutatingBooking}
                            onClick={() => {
                              setRejectingBookingId((current) =>
                                current === booking.id ? null : booking.id,
                              )
                              setRejectReason('')
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Icon name="close" size={13} />
                          </button>
                        </div>
                      </div>
                      {rejectingBookingId === booking.id ? (
                        <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50/60 p-1.5">
                          <Input
                            aria-label={`Rejection reason for ${childName}`}
                            className="h-7 flex-1 px-2 text-xs"
                            placeholder="Reason for rejection"
                            value={rejectReason}
                            disabled={rejectBooking.isPending}
                            onChange={(event) => setRejectReason(event.target.value)}
                          />
                          <button
                            type="button"
                            title="Confirm rejection"
                            aria-label="Confirm rejection"
                            disabled={rejectBooking.isPending}
                            onClick={() => handleReject(booking)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-600 text-white transition hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Icon name="check" size={12} />
                          </button>
                          <button
                            type="button"
                            title="Cancel rejection"
                            aria-label="Cancel rejection"
                            onClick={() => {
                              setRejectingBookingId(null)
                              setRejectReason('')
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-500 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                          >
                            <Icon name="close" size={12} />
                          </button>
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-4">
                <EmptyState compact icon="inbox" title="No pending requests" />
              </div>
            )}
          </CardBody>
          <Pagination
            compact
            label="Pending requests"
            onPageChange={pendingPager.setPage}
            page={pendingPager.page}
            rangeEnd={pendingPager.rangeEnd}
            rangeStart={pendingPager.rangeStart}
            total={pendingPager.total}
            totalPages={pendingPager.totalPages}
          />
        </Card>
      </div>

      <BookingReviewModal
        open={Boolean(reviewBookingId)}
        booking={reviewBooking}
        isLoading={
          Boolean(reviewBookingId) &&
          linkedReviewBooking.isLoading &&
          !reviewBooking
        }
        onClose={() => setReviewBookingId(null)}
      />
    </div>
  )
}
