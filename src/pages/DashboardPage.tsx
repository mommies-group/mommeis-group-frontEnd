import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Icon, type IconName } from '../components/icons/Icon'
import { ApiErrorNotice } from '../components/ui/ApiErrorNotice'
import { Badge } from '../components/ui/Badge'
import { buttonStyles } from '../components/ui/buttonStyles'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader } from '../components/ui/PageHeader'
import { Skeleton } from '../components/ui/Skeleton'
import { useDashboardSummary } from '../hooks/queries/dashboard/dashboard.queries'
import { usePendingBookings } from '../hooks/queries/bookings/bookings.queries'
import { formatDateTime } from '../lib/format'
import { ROUTES } from '../router/routes'

type SummaryCardProps = {
  label: string
  icon: IconName
  value: ReactNode
  hint: string
  linkLabel: string
  href: string
  valueClassName?: string
}

function SummaryCard({
  label,
  icon,
  value,
  hint,
  linkLabel,
  href,
  valueClassName = 'text-2xl',
}: SummaryCardProps) {
  return (
    <article className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
          <Icon name={icon} size={16} />
        </span>
      </div>
      <div className="mt-3 flex min-h-8 items-center">
        <span
          className={`min-w-0 truncate font-bold tracking-tight text-slate-900 ${valueClassName}`}
        >
          {value}
        </span>
      </div>
      <p className="mt-1 text-[11px] text-slate-500">{hint}</p>
      <Link
        className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-teal-700 transition hover:text-teal-900"
        to={href}
      >
        {linkLabel}
        <Icon name="arrow-right" size={12} />
      </Link>
    </article>
  )
}

export function DashboardPage() {
  const summary = useDashboardSummary()
  const pendingBookings = usePendingBookings()
  const data = summary.data
  const nextAppointment = data?.upcomingAppointments[0]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="Your clinical workspace at a glance, based on your current bookings, patients, notes, and activities."
        actions={
          <>
            <Link
              className={buttonStyles({ variant: 'secondary' })}
              to={ROUTES.bookings}
            >
              <Icon name="calendar" size={15} />
              View schedule
            </Link>
            <Link
              className={buttonStyles({ variant: 'primary' })}
              to={ROUTES.activities}
            >
              <Icon name="plus" size={15} />
              Create activity
            </Link>
          </>
        }
      />

      {summary.isError ? (
        <ApiErrorNotice
          error={summary.error}
          title="Could not load your dashboard"
          onRetry={() => {
            void summary.refetch()
          }}
        />
      ) : null}

      <section
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Practice summary"
      >
        <SummaryCard
          label="Today's sessions"
          icon="clock"
          value={
            summary.isLoading ? (
              <Skeleton className="h-7 w-14" />
            ) : (
              (data?.todaySessions ?? '—')
            )
          }
          hint="Confirmed sessions scheduled for today"
          linkLabel="Open schedule"
          href={ROUTES.bookings}
        />
        <SummaryCard
          label="Pending requests"
          icon="inbox"
          value={
            summary.isLoading ? (
              <Skeleton className="h-7 w-14" />
            ) : (
              (data?.pendingBookingRequests ?? '—')
            )
          }
          hint="Requests awaiting a specialist decision"
          linkLabel="Review bookings"
          href={ROUTES.bookings}
        />
        <SummaryCard
          label="Assigned patients"
          icon="users"
          value={
            summary.isLoading ? (
              <Skeleton className="h-7 w-14" />
            ) : (
              (data?.activePatients ?? '—')
            )
          }
          hint="Patients with consent and appointment access"
          linkLabel="View patients"
          href={ROUTES.patients}
        />
        <SummaryCard
          label="Next appointment"
          icon="calendar"
          value={
            summary.isLoading ? (
              <Skeleton className="h-7 w-32" />
            ) : nextAppointment ? (
              formatDateTime(nextAppointment.scheduledAt)
            ) : (
              'None scheduled'
            )
          }
          valueClassName="text-sm leading-5 whitespace-normal"
          hint={
            nextAppointment
              ? `${nextAppointment.child.firstName} ${nextAppointment.child.lastName}`
              : 'No upcoming appointment on your schedule'
          }
          linkLabel="View schedule"
          href={ROUTES.bookings}
        />
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader
              title="Upcoming appointments"
              description="The next sessions already scheduled in your calendar."
            />
            <CardBody>
              {summary.isLoading ? (
                <div className="grid gap-3" aria-label="Loading appointments">
                  {[0, 1, 2].map((item) => (
                    <div
                      className="flex items-center gap-3 rounded-xl border border-slate-200 p-3"
                      key={item}
                    >
                      <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
                      <div className="grid flex-1 gap-2">
                        <Skeleton className="h-3 w-40" />
                        <Skeleton className="h-2.5 w-28" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : data && data.upcomingAppointments.length > 0 ? (
                <div className="grid gap-2.5">
                  {data.upcomingAppointments.map((appointment) => (
                    <Link
                      className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-teal-200 hover:bg-teal-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                      to={ROUTES.bookings}
                      key={appointment.id}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                        <Icon name="calendar" size={17} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-slate-800">
                          {appointment.child.firstName}{' '}
                          {appointment.child.lastName}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {formatDateTime(appointment.scheduledAt)}
                        </p>
                      </div>
                      <Badge
                        tone={
                          appointment.status === 'CONFIRMED'
                            ? 'success'
                            : 'warning'
                        }
                      >
                        {appointment.status === 'CONFIRMED'
                          ? 'Confirmed'
                          : 'Reschedule pending'}
                      </Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon="calendar"
                  title="No upcoming appointments"
                  description="Scheduled sessions from the bookings API will appear here."
                  action={
                    <Link
                      className={buttonStyles({
                        variant: 'secondary',
                        size: 'sm',
                      })}
                      to={ROUTES.bookings}
                    >
                      Go to Bookings & Schedule
                      <Icon name="arrow-right" size={13} />
                    </Link>
                  }
                />
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Today's sessions"
              description="A focused view of the current day."
            />
            <CardBody>
              {summary.isLoading ? (
                <Skeleton className="h-16 w-full rounded-xl" />
              ) : data && data.todaySessions > 0 ? (
                <div className="flex flex-col gap-3 rounded-xl border border-teal-200 bg-teal-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-teal-700 ring-1 ring-teal-200">
                      <Icon name="clock" size={17} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {data.todaySessions} confirmed{' '}
                        {data.todaySessions === 1 ? 'session' : 'sessions'} today
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        Open the schedule for appointment times and status.
                      </p>
                    </div>
                  </div>
                  <Link
                    className={buttonStyles({
                      variant: 'secondary',
                      size: 'sm',
                    })}
                    to={ROUTES.bookings}
                  >
                    Open schedule
                  </Link>
                </div>
              ) : (
                <EmptyState
                  compact
                  icon="clock"
                  title="No confirmed sessions today"
                  description="Your schedule is clear for the current day."
                />
              )}
            </CardBody>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader
              title="Pending booking requests"
              description="Requests waiting for a specialist decision."
              action={
                <Link
                  className={buttonStyles({ variant: 'ghost', size: 'sm' })}
                  to={ROUTES.bookings}
                >
                  Review
                  <Icon name="arrow-right" size={12} />
                </Link>
              }
            />
            <CardBody>
              {pendingBookings.isLoading ? (
                <div className="grid gap-2">
                  <Skeleton className="h-12 w-full rounded-lg" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              ) : pendingBookings.isError ? (
                <ApiErrorNotice
                  error={pendingBookings.error}
                  title="Could not load pending requests"
                  onRetry={() => {
                    void pendingBookings.refetch()
                  }}
                />
              ) : pendingBookings.data && pendingBookings.data.length > 0 ? (
                <div className="grid gap-2">
                  {pendingBookings.data.slice(0, 3).map((booking) => (
                    <Link
                      className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-amber-200 hover:bg-amber-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                      to={ROUTES.bookings}
                      key={booking.id}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                        <Icon name="inbox" size={15} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-slate-800">
                          {booking.child.firstName} {booking.child.lastName}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-slate-500">
                          Requested {formatDateTime(booking.requestedAt)}
                        </p>
                      </div>
                      <Icon name="chevron-right" size={14} />
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  compact
                  icon="inbox"
                  title="No pending requests"
                  description="New requests will appear here for review."
                />
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Recent workspace activity"
              description="Latest notes and activities created for your patients."
            />
            <CardBody>
              {summary.isLoading ? (
                <div className="grid gap-2">
                  <Skeleton className="h-11 w-full rounded-lg" />
                  <Skeleton className="h-11 w-full rounded-lg" />
                  <Skeleton className="h-11 w-full rounded-lg" />
                </div>
              ) : data && data.recentActivities.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {data.recentActivities.map((activity) => (
                    <div
                      className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0"
                      key={`${activity.type}-${activity.id}`}
                    >
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                        <Icon
                          name={activity.type === 'NOTE' ? 'notes' : 'activity'}
                          size={13}
                        />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-slate-800">
                          {activity.title}
                        </p>
                        <p className="mt-0.5 text-[10px] text-slate-500">
                          {activity.type === 'NOTE'
                            ? 'Clinical note'
                            : 'Assigned activity'}{' '}
                          · {formatDateTime(activity.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  compact
                  icon="activity"
                  title="No recent activity"
                  description="New notes and assigned activities will appear here."
                />
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
