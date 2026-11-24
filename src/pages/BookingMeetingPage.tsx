import { useCallback, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { JitsiMeeting } from '@jitsi/react-sdk'
import { BookingStatusBadge } from '../components/bookings/bookingStatus'
import { Icon } from '../components/icons/Icon'
import { ClinicalNoteModal } from '../components/notes/ClinicalNoteModal'
import { TreatmentPlanFormModal } from '../components/treatment-plans/TreatmentPlanFormModal'
import { ApiErrorNotice } from '../components/ui/ApiErrorNotice'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { buttonStyles } from '../components/ui/buttonStyles'
import { Card, CardBody } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader } from '../components/ui/PageHeader'
import { Spinner } from '../components/ui/Spinner'
import { useCurrentUser } from '../hooks/queries/auth/auth.queries'
import {
  useBookingById,
  useBookingMeeting,
} from '../hooks/queries/bookings/bookings.queries'
import { formatScheduledDateTime } from '../lib/format'
import { ROUTES, bookingReviewPath } from '../router/routes'

function MeetingLoadingSpinner() {
  return <Spinner className="py-16" label="Connecting to Jitsi Meet…" />
}

export function BookingMeetingPage() {
  const { bookingId } = useParams<{ bookingId: string }>()
  const normalizedBookingId = bookingId?.trim() || null

  const booking = useBookingById(normalizedBookingId)
  const isCompleted = booking.data?.status === 'COMPLETED'
  const canLoadMeeting =
    Boolean(normalizedBookingId) &&
    !booking.isLoading &&
    (!booking.data || booking.data.status === 'CONFIRMED')
  const meeting = useBookingMeeting(normalizedBookingId, canLoadMeeting)
  const currentUser = useCurrentUser()

  const [hasLeftMeeting, setHasLeftMeeting] = useState(false)
  const [rejoinKey, setRejoinKey] = useState(0)
  const [notesOpen, setNotesOpen] = useState(false)
  const [planOpen, setPlanOpen] = useState(false)
  const [planCreated, setPlanCreated] = useState(false)
  const externalApiRef = useRef<unknown>(null)

  const configOverwrite = useMemo(
    () => ({
      startWithAudioMuted: true,
      disableModeratorIndicator: true,
      enableEmailInStats: false,
    }),
    [],
  )

  const interfaceConfigOverwrite = useMemo(
    () => ({
      DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
    }),
    [],
  )

  const specialistName = currentUser.data?.fullName ?? 'Specialist'
  const specialistEmail = currentUser.data?.email ?? ''
  const userInfo = useMemo(
    () => ({
      displayName: specialistName,
      email: specialistEmail,
    }),
    [specialistEmail, specialistName],
  )

  const handleApiReady = useCallback((externalApi: unknown) => {
    externalApiRef.current = externalApi
  }, [])

  const handleReadyToClose = useCallback(() => {
    setHasLeftMeeting(true)
  }, [])

  const handleIFrameRef = useCallback((iframeRef: HTMLDivElement) => {
    iframeRef.style.height = '100%'
    iframeRef.style.width = '100%'
    iframeRef.style.minHeight = '560px'
    iframeRef.style.border = '0'
  }, [])

  const backPath = normalizedBookingId
    ? bookingReviewPath(normalizedBookingId)
    : ROUTES.bookings
  const canComplete = booking.data?.status === 'CONFIRMED'
  const pageTitle = booking.data
    ? `Session · ${booking.data.child.firstName} ${booking.data.child.lastName}`
    : 'Session meeting'

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={pageTitle}
        icon="video"
        actions={
          isCompleted ? undefined : (
            <>
              <Link
                className={buttonStyles({ variant: 'secondary', size: 'sm' })}
                to={backPath}
              >
                <Icon name="arrow-left" size={14} />
                Back to bookings
              </Link>
              {canComplete ? (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setNotesOpen(true)}
                >
                  <Icon name="notes" size={14} />
                  Complete &amp; add note
                </Button>
              ) : null}
            </>
          )
        }
      />

      {booking.data || meeting.data ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm">
          <div className="min-w-0">
            {booking.data ? (
              <>
                <p className="truncate text-sm font-semibold text-slate-900">
                  {booking.data.child.firstName} {booking.data.child.lastName}
                  <span className="font-normal text-slate-500">
                    {' '}
                    · {booking.data.parent.fullName}
                  </span>
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {formatScheduledDateTime(booking.data.scheduledAt)}
                </p>
              </>
            ) : (
              <p className="text-xs font-medium text-slate-600">
                Meeting room ready
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!isCompleted && meeting.data?.roomName ? (
              <Badge tone="neutral">{meeting.data.roomName}</Badge>
            ) : null}
            {booking.data ? (
              <BookingStatusBadge status={booking.data.status} />
            ) : meeting.data?.status ? (
              <BookingStatusBadge status={meeting.data.status} />
            ) : null}
          </div>
        </div>
      ) : null}

      {!normalizedBookingId ? (
        <Card>
          <CardBody>
            <EmptyState
              icon="video"
              title="No booking selected"
              description="Open a confirmed booking to launch its meeting room."
              action={
                <Link
                  className={buttonStyles({ variant: 'primary', size: 'sm' })}
                  to={ROUTES.bookings}
                >
                  <Icon name="calendar" size={14} />
                  Go to bookings
                </Link>
              }
            />
          </CardBody>
        </Card>
      ) : isCompleted ? (
        planCreated ? (
          <Card>
            <CardBody>
              <EmptyState
                icon="check"
                title="Treatment plan created"
                description="The session is completed and the treatment plan has been saved."
                action={
                  <Link
                    className={buttonStyles({ variant: 'primary', size: 'sm' })}
                    to={ROUTES.bookings}
                  >
                    <Icon name="arrow-left" size={14} />
                    Back to bookings
                  </Link>
                }
              />
            </CardBody>
          </Card>
        ) : (
          <Card>
            <CardBody>
              <EmptyState
                icon="check"
                title="Session completed"
                description="Create a treatment plan for this patient to schedule follow-up sessions."
                action={
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => setPlanOpen(true)}
                  >
                    <Icon name="file" size={14} />
                    Create treatment plan
                  </Button>
                }
              />
            </CardBody>
          </Card>
        )
      ) : booking.isLoading || meeting.isLoading ? (
        <Card>
          <CardBody>
            <Spinner className="py-16" label="Loading meeting room…" />
          </CardBody>
        </Card>
      ) : meeting.isError ? (
        <Card>
          <CardBody>
            <ApiErrorNotice
              error={meeting.error}
              title="Could not load meeting room"
              onRetry={() => {
                void meeting.refetch()
              }}
            />
          </CardBody>
        </Card>
      ) : !meeting.data?.domain || !meeting.data?.roomName ? (
        <Card>
          <CardBody>
            <EmptyState
              icon="video"
              title="Meeting room unavailable"
              description="Meeting details were not returned for this booking."
            />
          </CardBody>
        </Card>
      ) : hasLeftMeeting ? (
        <Card>
          <CardBody>
            <EmptyState
              icon="video"
              title="You left the meeting"
              description="Rejoin the session room, add a clinical note to complete this booking, or return to bookings."
              action={
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setRejoinKey((current) => current + 1)
                      setHasLeftMeeting(false)
                    }}
                  >
                    <Icon name="video" size={14} />
                    Rejoin meeting
                  </Button>
                  {canComplete ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setNotesOpen(true)}
                    >
                      <Icon name="notes" size={14} />
                      Complete &amp; add note
                    </Button>
                  ) : null}
                  <Link
                    className={buttonStyles({ variant: 'ghost', size: 'sm' })}
                    to={backPath}
                  >
                    <Icon name="arrow-left" size={14} />
                    Back to bookings
                  </Link>
                </div>
              }
            />
          </CardBody>
        </Card>
      ) : (
        <div className="h-[calc(100vh-240px)] min-h-[560px] w-full overflow-hidden rounded-xl border border-slate-300 bg-slate-950">
          <JitsiMeeting
            key={`${meeting.data.roomName}-${rejoinKey}`}
            domain={meeting.data.domain}
            roomName={meeting.data.roomName}
            jwt={meeting.data.jwt ?? undefined}
            configOverwrite={configOverwrite}
            interfaceConfigOverwrite={interfaceConfigOverwrite}
            userInfo={userInfo}
            spinner={MeetingLoadingSpinner}
            onApiReady={handleApiReady}
            onReadyToClose={handleReadyToClose}
            getIFrameRef={handleIFrameRef}
          />
        </div>
      )}

      {notesOpen && booking.data ? (
        <ClinicalNoteModal
          key={booking.data.id}
          open
          childId={booking.data.childId}
          bookingId={booking.data.id}
          completeBookingId={booking.data.id}
          onClose={() => setNotesOpen(false)}
          onCompleted={() => {
            void booking.refetch()
          }}
        />
      ) : null}

      {planOpen && booking.data ? (
        <TreatmentPlanFormModal
          key={booking.data.id}
          open
          childId={booking.data.childId}
          bookingId={booking.data.id}
          onClose={() => setPlanOpen(false)}
          onSaved={() => setPlanCreated(true)}
        />
      ) : null}
    </div>
  )
}
