import { lazy, Suspense, useEffect, useState } from 'react'
import { ClinicalNoteModal } from '../notes/ClinicalNoteModal'
import { Icon } from '../icons/Icon'
import { ApiErrorNotice } from '../ui/ApiErrorNotice'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card, CardBody, CardHeader } from '../ui/Card'
import { EmptyState } from '../ui/EmptyState'
import { Spinner } from '../ui/Spinner'
import { Field, Input, Textarea } from '../ui/Field'
import { useBookingById } from '../../hooks/queries/bookings/bookings.queries'
import {
  useApproveBooking,
  useMeetingInfo,
  useMarkNoShow,
  useProposeAlternativeTime,
  useRejectBooking,
} from '../../hooks/mutations/bookings/bookings.mutations'
import { notifyError, notifySuccess } from '../../lib/toast'
import {
  formatDateTime,
  formatScheduledDateTime,
  parseScheduledDate,
  toDateKey,
  toDateTimeIso,
} from '../../lib/format'
import type { Booking, ProposalStatus } from '../../types/booking.types'
import { BookingStatusBadge } from './bookingStatus'
import { bookingStatusLabels } from './bookingStatusMeta'

const MAX_TIMEOUT_MS = 2_147_483_647

type Decision = 'approve' | 'reject' | 'propose'

const TreatmentPlanFormModal = lazy(() =>
  import('../treatment-plans/TreatmentPlanFormModal').then((module) => ({
    default: module.TreatmentPlanFormModal,
  })),
)

const proposalLabels: Record<ProposalStatus, string> = {
  PENDING: 'Awaiting parent',
  ACCEPTED: 'Accepted',
  DECLINED: 'Declined',
}

const proposalTones: Record<ProposalStatus, 'warning' | 'success' | 'danger'> = {
  PENDING: 'warning',
  ACCEPTED: 'success',
  DECLINED: 'danger',
}

type BookingReviewPanelProps = {
  booking: Booking | null
}

export function BookingReviewPanel({ booking }: BookingReviewPanelProps) {
  const bookingDetail = useBookingById(booking?.id ?? null)
  const approveBooking = useApproveBooking()
  const rejectBooking = useRejectBooking()
  const proposeTime = useProposeAlternativeTime()
  const meetingInfo = useMeetingInfo()
  const markNoShow = useMarkNoShow()

  const [decision, setDecision] = useState<Decision | null>(null)
  const [reason, setReason] = useState('')
  const [proposedDate, setProposedDate] = useState('')
  const [proposedTime, setProposedTime] = useState('')
  const [proposalNote, setProposalNote] = useState('')
  const [notesOpen, setNotesOpen] = useState(false)
  const [planOpen, setPlanOpen] = useState(false)

  const current = bookingDetail.data ?? booking
  const [now, setNow] = useState(() => Date.now())
  const scheduledAtMs = current?.scheduledAt
    ? (parseScheduledDate(current.scheduledAt)?.getTime() ?? null)
    : null

  useEffect(() => {
    if (!scheduledAtMs || !Number.isFinite(scheduledAtMs)) {
      return
    }

    const remaining = scheduledAtMs - Date.now()
    if (remaining <= 0) {
      if (now < scheduledAtMs) {
        const timer = window.setTimeout(() => setNow(Date.now()), 0)
        return () => window.clearTimeout(timer)
      }
      return
    }

    const delay = Math.min(remaining + 1000, MAX_TIMEOUT_MS)
    const timer = window.setTimeout(() => setNow(Date.now()), delay)

    return () => window.clearTimeout(timer)
  }, [scheduledAtMs, now])

  const isAppointmentTime =
    scheduledAtMs !== null &&
    Number.isFinite(scheduledAtMs) &&
    now >= scheduledAtMs
  const isPending =
    approveBooking.isPending ||
    rejectBooking.isPending ||
    proposeTime.isPending ||
    markNoShow.isPending

  if (bookingDetail.isLoading && !bookingDetail.data) {
    return (
      <Card>
        <CardHeader title="Review" />
        <CardBody>
          <Spinner className="py-10" label="Loading booking details…" />
        </CardBody>
      </Card>
    )
  }

  if (!current) {
    return (
      <Card>
        <CardHeader title="Review" />
        <CardBody>
          <EmptyState
            compact
            icon="inbox"
            title="Select a booking"
            description="Choose a booking to review its details and actions."
          />
        </CardBody>
      </Card>
    )
  }

  const canDecide =
    current.status === 'PENDING' || current.status === 'RESCHEDULE_PENDING'
  const canPropose =
    current.status === 'PENDING' || current.status === 'RESCHEDULE_PENDING'
  const canComplete = current.status === 'CONFIRMED'
  const canMeet = current.status === 'CONFIRMED'
  const latestProposal = current.proposals[0]
  const awaitingParentConfirmation = latestProposal?.status === 'PENDING'

  const resetDecision = () => {
    setDecision(null)
    approveBooking.reset()
    rejectBooking.reset()
    proposeTime.reset()
  }

  const openPlan = () => {
    setNotesOpen(false)
    setPlanOpen(true)
  }

  const handleApprove = () => {
    approveBooking.mutate(current.id, {
      onSuccess: () => {
        setDecision(null)
        notifySuccess('Booking approved.')
      },
      onError: (error) => notifyError(error),
    })
  }

  const handleReject = () => {
    if (!reason.trim()) {
      notifyError(null, 'Enter a rejection reason.')
      return
    }

    rejectBooking.mutate(
      { id: current.id, payload: { reason: reason.trim() } },
      {
        onSuccess: () => {
          setDecision(null)
          setReason('')
          notifySuccess('Booking rejected.')
        },
        onError: (error) => notifyError(error),
      },
    )
  }

  const handlePropose = () => {
    const proposedAt = toDateTimeIso(proposedDate, proposedTime)

    if (!proposedAt) {
      notifyError(null, 'Choose a proposed date and time.')
      return
    }

    if (new Date(proposedAt).getTime() <= Date.now()) {
      notifyError(null, 'Choose a future date and time.')
      return
    }

    proposeTime.mutate(
      {
        id: current.id,
        payload: {
          proposedAt,
          note: proposalNote.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          setDecision(null)
          setProposedDate('')
          setProposedTime('')
          setProposalNote('')
          notifySuccess('Alternative time proposed.')
        },
        onError: (error) => notifyError(error),
      },
    )
  }

  const handleNoShow = () => {
    markNoShow.mutate(current.id, {
      onSuccess: () => {
        resetDecision()
        notifySuccess('Marked as no show.')
      },
      onError: (error) => notifyError(error),
    })
  }

  const handleMeeting = () => {
    meetingInfo.mutate(current.id, {
      onSuccess: (meeting) => {
        if (!meeting.joinUrl) {
          notifyError(null, 'Meeting link is not available.')
          return
        }
        window.open(meeting.joinUrl, '_blank', 'noopener,noreferrer')
      },
      onError: (error) => notifyError(error),
    })
  }

  return (
    <>
      <Card>
        <CardHeader
          title="Review"
        action={<BookingStatusBadge status={current.status} />}
      />
      <CardBody>
        <div className="rounded-xl border border-slate-300 bg-slate-50/60 p-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {current.child.firstName} {current.child.lastName}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-slate-500">
                {current.parent.fullName}
                {current.parent.email ? ` · ${current.parent.email}` : ''}
              </p>
            </div>
            <Badge tone="neutral">
              {bookingStatusLabels[current.status]}
            </Badge>
          </div>

          <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-300 pt-3">
            <div>
              <dt className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                Requested
              </dt>
              <dd className="mt-0.5 text-[11px] font-medium text-slate-700">
                {formatDateTime(current.requestedAt)}
              </dd>
            </div>
            <div>
              <dt className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                Scheduled
              </dt>
              <dd className="mt-0.5 text-[11px] font-medium text-slate-700">
                {formatScheduledDateTime(current.scheduledAt)}
              </dd>
            </div>
            {current.reason ? (
              <div className="col-span-2">
                <dt className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                  Reason
                </dt>
                <dd className="mt-0.5 text-[11px] leading-4 text-slate-700">
                  {current.reason}
                </dd>
              </div>
            ) : null}
            {current.rejectionReason ? (
              <div className="col-span-2">
                <dt className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                  Rejection
                </dt>
                <dd className="mt-0.5 text-[11px] leading-4 text-rose-800">
                  {current.rejectionReason}
                </dd>
              </div>
            ) : null}
            {current.completionNote ? (
              <div className="col-span-2">
                <dt className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                  Completion note
                </dt>
                <dd className="mt-0.5 text-[11px] leading-4 text-slate-700">
                  {current.completionNote}
                </dd>
              </div>
            ) : null}
          </dl>
        </div>

        {latestProposal ? (
          <div className="mt-2.5 rounded-lg border border-sky-200 bg-sky-50/60 px-3 py-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] font-semibold text-sky-950">
                {formatDateTime(latestProposal.proposedAt)}
              </p>
              <Badge tone={proposalTones[latestProposal.status]}>
                {proposalLabels[latestProposal.status]}
              </Badge>
            </div>
            {awaitingParentConfirmation ? (
              <p className="mt-1 text-[10px] text-sky-900">
                Approve is enabled once the parent confirms this time.
              </p>
            ) : null}
          </div>
        ) : null}

        {bookingDetail.isError ? (
          <div className="mt-3">
            <ApiErrorNotice
              error={bookingDetail.error}
              title="Could not refresh booking"
              onRetry={() => {
                void bookingDetail.refetch()
              }}
            />
          </div>
        ) : null}

        {canComplete && !isAppointmentTime && current.scheduledAt ? (
          <p className="mt-3 text-[10px] font-medium text-slate-500">
            Actions unlock at the scheduled time ·{' '}
            {formatScheduledDateTime(current.scheduledAt)}
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-1.5">
          {canDecide ? (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  resetDecision()
                  setDecision('approve')
                }}
                disabled={isPending || awaitingParentConfirmation}
                title={
                  awaitingParentConfirmation
                    ? 'Waiting for parent confirmation'
                    : undefined
                }
              >
                <Icon name="check" size={13} />
                Approve
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  resetDecision()
                  setDecision('reject')
                }}
                disabled={isPending}
              >
                <Icon name="close" size={13} />
                Reject
              </Button>
            </>
          ) : null}
          {canPropose ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                resetDecision()
                setDecision('propose')
              }}
              disabled={isPending}
            >
              <Icon name="calendar" size={13} />
              Propose time
            </Button>
          ) : null}
          {canComplete ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                resetDecision()
                setNotesOpen(true)
              }}
              disabled={isPending || !isAppointmentTime}
              title={
                isAppointmentTime
                  ? undefined
                  : 'Available at the scheduled time'
              }
            >
              <Icon name="check" size={13} />
              Complete
            </Button>
          ) : null}
          {canMeet ? (
            <Button
              variant="soft"
              size="sm"
              onClick={handleMeeting}
              disabled={meetingInfo.isPending || !isAppointmentTime}
              aria-busy={meetingInfo.isPending}
              title={
                isAppointmentTime
                  ? undefined
                  : 'Available at the scheduled time'
              }
            >
              <Icon name="video" size={13} />
              {meetingInfo.isPending ? 'Opening…' : 'Meeting'}
            </Button>
          ) : null}
          {canMeet ? (
            <Button
              variant="danger"
              size="sm"
              onClick={handleNoShow}
              disabled={isPending || !isAppointmentTime}
              aria-busy={markNoShow.isPending}
              title={
                isAppointmentTime
                  ? undefined
                  : 'Available at the scheduled time'
              }
            >
              <Icon name="close" size={13} />
              No show
            </Button>
          ) : null}
          {current.status === 'COMPLETED' ? (
            <Button variant="soft" size="sm" onClick={openPlan}>
              <Icon name="file" size={13} />
              Create treatment plan
            </Button>
          ) : null}
        </div>

        {decision === 'approve' ? (
          <div className="mt-3 flex justify-end gap-2 rounded-lg border border-emerald-200 bg-emerald-50/60 p-2.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetDecision}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleApprove}
              disabled={isPending}
              aria-busy={approveBooking.isPending}
            >
              {approveBooking.isPending ? 'Approving…' : 'Confirm approval'}
            </Button>
          </div>
        ) : null}

        {decision === 'reject' ? (
          <div className="mt-3 grid gap-2 rounded-lg border border-rose-200 bg-rose-50/60 p-2.5">
            <Field label="Reason" htmlFor="rejection-reason">
              <Textarea
                id="rejection-reason"
                value={reason}
                disabled={isPending}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Reason for rejection"
                rows={2}
              />
            </Field>
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={resetDecision}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleReject}
                disabled={isPending}
                aria-busy={rejectBooking.isPending}
              >
                {rejectBooking.isPending ? 'Rejecting…' : 'Reject booking'}
              </Button>
            </div>
          </div>
        ) : null}

        {decision === 'propose' ? (
          <div className="mt-3 grid gap-2 rounded-lg border border-sky-200 bg-sky-50/60 p-2.5">
            <div className="grid grid-cols-2 gap-2">
              <Field label="Date" htmlFor="proposed-date">
                <Input
                  id="proposed-date"
                  type="date"
                  min={toDateKey(new Date())}
                  value={proposedDate}
                  disabled={isPending}
                  onChange={(event) => setProposedDate(event.target.value)}
                />
              </Field>
              <Field label="Time" htmlFor="proposed-time">
                <Input
                  id="proposed-time"
                  type="time"
                  value={proposedTime}
                  disabled={isPending}
                  onChange={(event) => setProposedTime(event.target.value)}
                />
              </Field>
            </div>
            <Field label="Note" htmlFor="proposal-note" optional>
              <Input
                id="proposal-note"
                value={proposalNote}
                disabled={isPending}
                onChange={(event) => setProposalNote(event.target.value)}
                placeholder="Optional note"
              />
            </Field>
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={resetDecision}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handlePropose}
                disabled={isPending}
                aria-busy={proposeTime.isPending}
              >
                {proposeTime.isPending ? 'Sending…' : 'Send proposal'}
              </Button>
            </div>
          </div>
        ) : null}

        </CardBody>
      </Card>
      {notesOpen ? (
        <ClinicalNoteModal
          key={current.id}
          open
          childId={current.childId}
          bookingId={current.id}
          completeBookingId={current.id}
          onClose={() => setNotesOpen(false)}
          onCompleted={() => {
            void bookingDetail.refetch()
          }}
          onCreatePlan={openPlan}
        />
      ) : null}

      {planOpen ? (
        <Suspense fallback={null}>
          <TreatmentPlanFormModal
            key={current.id}
            open
            childId={current.childId}
            bookingId={current.id}
            onClose={() => setPlanOpen(false)}
          />
        </Suspense>
      ) : null}
    </>
  )
}
