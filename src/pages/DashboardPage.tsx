import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Icon, type IconName } from '../components/icons/Icon'
import { BookingStatusBadge } from '../components/bookings/bookingStatus'
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
  href: string
}

function SummaryCard({ label, icon, value, hint, href }: SummaryCardProps) {
  return (
    <Link
      className="group flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
      to={href}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[11px] font-semibold text-slate-500">
          {label}
        </p>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
          <Icon name={icon} size={15} />
        </span>
      </div>
      <span className="mt-2 min-w-0 truncate text-2xl font-bold tracking-tight text-slate-900">
        {value}
      </span>
      <p className="mt-0.5 truncate text-[10px] text-slate-500">{hint}</p>
    </Link>
  )
}

export function DashboardPage() {
  const summary = useDashboardSummary()
  const pendingBookings = usePendingBookings()
  const data = summary.data
  const nextAppointment = data?.upcomingAppointments[0]

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
              <span className="text-base">{formatDateTime(nextAppointment.scheduledAt)}</span>
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
                <div className="divide-y divide-slate-100">
                  {data.upcomingAppointments.map((appointment) => (
                    <Link
                      className="flex items-center gap-3 px-4 py-3 transition hover:bg-slate-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-600"
                      to={ROUTES.bookings}
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
                        <p className="mt-0.5 truncate text-[11px] text-slate-500">
                          {formatDateTime(appointment.scheduledAt)}
                        </p>
                      </div>
                      <BookingStatusBadge status={appointment.status} />
                    </Link>
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
            <CardHeader
              title="Recent activity"
              action={
                <Link
                  className={buttonStyles({ variant: 'ghost', size: 'sm' })}
                  to={ROUTES.activities}
                >
                  Activities
                  <Icon name="arrow-right" size={12} />
                </Link>
              }
            />
            <CardBody flush>
              {summary.isLoading ? (
                <div className="grid gap-2 p-4">
                  {[0, 1, 2].map((item) => (
                    <Skeleton className="h-10 w-full rounded-lg" key={item} />
                  ))}
                </div>
              ) : data && data.recentActivities.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {data.recentActivities.map((activity) => (
                    <div
                      className="flex items-center gap-3 px-4 py-2.5"
                      key={`${activity.type}-${activity.id}`}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                        <Icon
                          name={activity.type === 'NOTE' ? 'notes' : 'activity'}
                          size={14}
                        />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-slate-800">
                          {activity.title}
                        </p>
                        <p className="mt-0.5 truncate text-[10px] text-slate-500">
                          {activity.type === 'NOTE'
                            ? 'Clinical note'
                            : 'Activity'}{' '}
                          · {formatDateTime(activity.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4">
                  <EmptyState compact icon="activity" title="No recent activity" />
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        <Card className="min-w-0">
          <CardHeader
            title="Pending requests"
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
          <CardBody flush>
            {pendingBookings.isLoading ? (
              <div className="grid gap-2 p-4">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            ) : pendingBookings.isError ? (
              <div className="p-4">
                <ApiErrorNotice
                  error={pendingBookings.error}
                  title="Could not load requests"
                  onRetry={() => {
                    void pendingBookings.refetch()
                  }}
                />
              </div>
            ) : pendingBookings.data && pendingBookings.data.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {pendingBookings.data.slice(0, 5).map((booking) => (
                  <Link
                    className="flex items-center gap-3 px-4 py-3 transition hover:bg-amber-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-600"
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
                      <p className="mt-0.5 truncate text-[10px] text-slate-500">
                        {formatDateTime(booking.requestedAt)}
                      </p>
                    </div>
                    <Badge tone="warning">Pending</Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-4">
                <EmptyState compact icon="inbox" title="No pending requests" />
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
