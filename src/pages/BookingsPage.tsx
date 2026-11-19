import { useState } from 'react'
import { Icon } from '../components/icons/Icon'
import { BookingReviewPanel } from '../components/bookings/BookingReviewPanel'
import { MonthCalendar } from '../components/bookings/MonthCalendar'
import { Badge } from '../components/ui/Badge'
import { buttonStyles } from '../components/ui/buttonStyles'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader } from '../components/ui/PageHeader'
import { ROUTES } from '../router/routes'

type BookingTab = 'pending' | 'confirmed' | 'past'

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
      'New requests will appear here for approval, rejection, or a proposed new time.',
  },
  confirmed: {
    title: 'No confirmed sessions',
    description:
      'Approved bookings will appear in this list and on the schedule once live data is connected.',
  },
  past: {
    title: 'No past sessions',
    description:
      'Completed sessions will appear here for reference when booking history is available.',
  },
}

export function BookingsPage() {
  const [tab, setTab] = useState<BookingTab>('pending')
  const empty = tabEmptyContent[tab]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Care operations"
        title="Bookings & Schedule"
        description="Review requests, manage approved sessions, and keep track of past appointments. All booking operations are visual placeholders in this phase."
        actions={
          <a
            className={buttonStyles({ variant: 'secondary' })}
            href={`#${ROUTES.availability}`}
          >
            <Icon name="clock" size={15} />
            Manage availability
          </a>
        }
      />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.85fr)]">
        <Card>
          <CardHeader
            title="Schedule"
            description="Monthly schedule view for confirmed and pending sessions."
            action={<Badge tone="neutral">No sessions loaded</Badge>}
          />
          <CardBody>
            <MonthCalendar />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Session list"
            description="Appointments for the selected period."
          />
          <CardBody flush>
            <div className="p-5">
              <EmptyState
                compact
                icon="calendar"
                title="No sessions scheduled"
                description="Confirmed appointments will appear here and on the calendar once booking data is connected."
              />
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(340px,0.9fr)]">
        <Card>
          <CardHeader
            title="Bookings"
            description="Requests, confirmed sessions, and past appointments."
            action={<Badge tone="neutral">No live data</Badge>}
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
                  onClick={() => setTab(item.value)}
                >
                  {item.label}
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
            <EmptyState
              icon="inbox"
              title={empty.title}
              description={empty.description}
            />
          </div>
        </Card>

        <BookingReviewPanel />
      </div>

      <Card>
        <CardHeader
          title="Booking rules"
          description="Rules that will be enforced when the booking API is connected."
        />
        <CardBody>
          <div className="grid gap-3">
            <p className="flex gap-2.5 text-xs leading-5 text-slate-600">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                <Icon name="check" size={14} />
              </span>
              <span>Rejecting a request requires a written reason.</span>
            </p>
            <p className="flex gap-2.5 text-xs leading-5 text-slate-600">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                <Icon name="clock" size={14} />
              </span>
              <span>
                A proposed alternative time remains pending until the mother
                approves it.
              </span>
            </p>
            <p className="flex gap-2.5 text-xs leading-5 text-slate-600">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                <Icon name="video" size={14} />
              </span>
              <span>
                Telehealth is a visible placeholder only; live consultations are
                not implemented in this phase.
              </span>
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
