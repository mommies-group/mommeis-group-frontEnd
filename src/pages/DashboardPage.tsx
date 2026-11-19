import type { ReactNode } from 'react'
import { Icon, type IconName } from '../components/icons/Icon'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { buttonStyles } from '../components/ui/buttonStyles'
import { Callout } from '../components/ui/Callout'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader } from '../components/ui/PageHeader'
import { Skeleton } from '../components/ui/Skeleton'
import { ROUTES } from '../router/routes'

type SummaryCardProps = {
  label: string
  icon: IconName
  hint: string
  linkLabel: string
  href: string
  widePlaceholder?: boolean
}

function SummaryCard({
  label,
  icon,
  hint,
  linkLabel,
  href,
  widePlaceholder = false,
}: SummaryCardProps) {
  return (
    <article className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
          <Icon name={icon} size={16} />
        </span>
      </div>
      <div className="mt-3 flex h-8 items-center">
        <Skeleton className={widePlaceholder ? 'h-8 w-28' : 'h-8 w-14'} />
        <span className="sr-only">Value not available yet</span>
      </div>
      <p className="mt-1 text-[11px] text-slate-500">{hint}</p>
      <a
        className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-teal-700 transition hover:text-teal-900"
        href={`#${href}`}
      >
        {linkLabel}
        <Icon name="arrow-right" size={12} />
      </a>
    </article>
  )
}

type QuickLinkProps = {
  href: string
  icon: IconName
  title: string
  copy: string
}

function QuickLink({ href, icon, title, copy }: QuickLinkProps) {
  return (
    <a
      className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-teal-200 hover:bg-teal-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
      href={`#${href}`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition group-hover:bg-teal-100 group-hover:text-teal-700">
        <Icon name={icon} size={16} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold text-slate-800">
          {title}
        </span>
        <span className="mt-0.5 block text-[11px] leading-4 text-slate-500">
          {copy}
        </span>
      </span>
      <span className="shrink-0 text-slate-300 transition group-hover:text-teal-600">
        <Icon name="chevron-right" size={15} />
      </span>
    </a>
  )
}

function DashboardLabel({ children }: { children: ReactNode }) {
  return <Badge tone="neutral">{children}</Badge>
}

export function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="Your clinical workspace at a glance. Summary values will populate when live portal data is connected."
        actions={
          <>
            <a
              className={buttonStyles({ variant: 'secondary' })}
              href={`#${ROUTES.bookings}`}
            >
              <Icon name="calendar" size={15} />
              View schedule
            </a>
            <a
              className={buttonStyles({ variant: 'primary' })}
              href={`#${ROUTES.activities}`}
            >
              <Icon name="plus" size={15} />
              Create activity
            </a>
          </>
        }
      />

      <section
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Practice summary"
      >
        <SummaryCard
          label="Today's sessions"
          icon="clock"
          hint="Awaiting schedule data"
          linkLabel="Open schedule"
          href={ROUTES.bookings}
        />
        <SummaryCard
          label="Pending requests"
          icon="inbox"
          hint="Awaiting booking data"
          linkLabel="Review bookings"
          href={ROUTES.bookings}
        />
        <SummaryCard
          label="Assigned patients"
          icon="users"
          hint="Awaiting patient data"
          linkLabel="View patients"
          href={ROUTES.patients}
        />
        <SummaryCard
          label="Next appointment"
          icon="calendar"
          hint="Awaiting appointment data"
          linkLabel="View schedule"
          href={ROUTES.bookings}
          widePlaceholder
        />
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader
              title="Upcoming appointments"
              description="Sessions tied to active or recently completed appointments."
              action={<Badge tone="neutral">No live data</Badge>}
            />
            <CardBody>
              <EmptyState
                icon="calendar"
                title="No upcoming appointments to display"
                description="Upcoming sessions will appear here once appointment data is connected to the portal."
                action={
                  <a
                    className={buttonStyles({ variant: 'secondary', size: 'sm' })}
                    href={`#${ROUTES.bookings}`}
                  >
                    Go to Bookings & Schedule
                    <Icon name="arrow-right" size={13} />
                  </a>
                }
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Today's sessions"
              description="A focused view of the current day."
              action={<DashboardLabel>Preview</DashboardLabel>}
            />
            <CardBody>
              <EmptyState
                compact
                icon="clock"
                title="No session data available"
                description="Today's appointments will appear here when live scheduling is connected."
              />
            </CardBody>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader
              title="Pending booking requests"
              description="Requests waiting for a specialist decision."
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  disabled
                  title="No booking data is connected in this preview"
                >
                  Review
                </Button>
              }
            />
            <CardBody>
              <EmptyState
                compact
                icon="inbox"
                title="No requests to review"
                description="New requests will appear here when the booking service is connected."
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Quick navigation" />
            <CardBody>
              <div className="space-y-2">
                <QuickLink
                  href={ROUTES.patients}
                  icon="users"
                  title="My Patients"
                  copy="Consent-verified patient list"
                />
                <QuickLink
                  href={ROUTES.bookings}
                  icon="calendar"
                  title="Bookings & Schedule"
                  copy="Requests and upcoming sessions"
                />
                <QuickLink
                  href={ROUTES.activities}
                  icon="activity"
                  title="Create an activity"
                  copy="Build a step-by-step care plan"
                />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Care activity overview"
              description="Assigned activities and parent confirmations."
              action={<DashboardLabel>Preview</DashboardLabel>}
            />
            <CardBody>
              <EmptyState
                compact
                icon="activity"
                title="No activity data available"
                description="Completion status is shown only after the mother confirms completion."
                action={
                  <a
                    className={buttonStyles({ variant: 'secondary', size: 'sm' })}
                    href={`#${ROUTES.activities}`}
                  >
                    Open activity creator
                    <Icon name="arrow-right" size={13} />
                  </a>
                }
              />
            </CardBody>
          </Card>
        </div>
      </div>

      <Callout
        tone="brand"
        title="Clinical access follows consent, not navigation"
        icon="shield"
      >
        Opening a page is not enough. A child&apos;s clinical record is available
        only while active parental consent and an active or recently completed
        appointment both apply. {' '}
        <a href={`#${ROUTES.privacy}`}>Review the access rules</a>.
      </Callout>
    </div>
  )
}
