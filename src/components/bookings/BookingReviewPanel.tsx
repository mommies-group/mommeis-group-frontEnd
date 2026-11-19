import { useState } from 'react'
import { Icon } from '../icons/Icon'
import { ApiErrorNotice } from '../ui/ApiErrorNotice'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Callout } from '../ui/Callout'
import { Card, CardBody, CardHeader } from '../ui/Card'
import { Field, Input, Textarea } from '../ui/Field'
import { InlineNotice } from '../ui/InlineNotice'
import { useBookingById } from '../../hooks/queries/bookings/bookings.queries'
import {
  useApproveBooking,
  useProposeAlternativeTime,
  useRejectBooking,
} from '../../hooks/mutations/bookings/bookings.mutations'
import { getApiErrorMessage } from '../../lib/api-error'
import { formatDateTime, toDateKey, toDateTimeIso } from '../../lib/format'
import type { Booking, ProposalStatus } from '../../types/booking.types'
import { BookingStatusBadge } from './bookingStatus'
import { bookingStatusLabels } from './bookingStatusMeta'

type Decision = 'approve' | 'reject' | 'propose'

const decisions: Array<{
  value: Decision
  label: string
  copy: string
  icon: 'check' | 'close' | 'calendar'
}> = [
  {
    value: 'approve',
    label: 'Approve',
    copy: 'Confirm the request',
    icon: 'check',
  },
  {
    value: 'reject',
    label: 'Reject',
    copy: 'Requires a reason',
    icon: 'close',
  },
  {
    value: 'propose',
    label: 'Propose time',
    copy: 'Offer an alternative',
    icon: 'calendar',
  },
]

const proposalLabels: Record<ProposalStatus, string> = {
  PENDING: 'Awaiting parent response',
  ACCEPTED: 'Accepted by parent',
  DECLINED: 'Declined by parent',
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

  const [decision, setDecision] = useState<Decision | null>(null)
  const [reason, setReason] = useState('')
  const [proposedDate, setProposedDate] = useState('')
  const [proposedTime, setProposedTime] = useState('')
  const [proposalNote, setProposalNote] = useState('')
  const [notice, setNotice] = useState('')
  const [formError, setFormError] = useState('')

  const current = bookingDetail.data ?? booking
  const isPending =
    approveBooking.isPending ||
    rejectBooking.isPending ||
    proposeTime.isPending

  if (!current) {
    return (
      <Card>
        <CardHeader
          title="Review booking request"
          description="Select a request or session from the list to review its details."
          action={<Badge tone="neutral">No request selected</Badge>}
        />
        <CardBody>
          <Callout tone="neutral" title="No booking selected" icon="inbox">
            Choose a booking from the list to review its details. Actions are
            enabled only for statuses the API permits.
          </Callout>
        </CardBody>
        <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-800">Telehealth</p>
            <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
              Live video and streaming are not implemented in this portal.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            disabled
            title="Telehealth is not implemented in this portal"
          >
            <Icon name="video" size={14} />
            Telehealth
          </Button>
        </div>
      </Card>
    )
  }

  const canDecide =
    current.status === 'PENDING' || current.status === 'RESCHEDULE_PENDING'
  const canPropose = [
    'PENDING',
    'CONFIRMED',
    'RESCHEDULE_PENDING',
  ].includes(current.status)
  const availableDecisions = decisions.filter((option) =>
    option.value === 'propose' ? canPropose : canDecide,
  )
  const latestProposal = current.proposals[0]

  const chooseDecision = (next: Decision) => {
    setDecision(next)
    setNotice('')
    setFormError('')
    approveBooking.reset()
    rejectBooking.reset()
    proposeTime.reset()
  }

  const handleApprove = () => {
    setNotice('')
    setFormError('')
    approveBooking.mutate(current.id, {
      onSuccess: () => {
        setDecision(null)
        setNotice('Booking approved. The session is now confirmed.')
      },
    })
  }

  const handleReject = () => {
    setNotice('')
    setFormError('')

    if (!reason.trim()) {
      setFormError('Enter a written reason before rejecting this request.')
      return
    }

    rejectBooking.mutate(
      { id: current.id, payload: { reason: reason.trim() } },
      {
        onSuccess: () => {
          setDecision(null)
          setReason('')
          setNotice('Booking rejected. The reason was shared with the parent.')
        },
      },
    )
  }

  const handlePropose = () => {
    setNotice('')
    setFormError('')

    const proposedAt = toDateTimeIso(proposedDate, proposedTime)

    if (!proposedAt) {
      setFormError('Choose both a proposed date and time.')
      return
    }

    if (new Date(proposedAt).getTime() <= Date.now()) {
      setFormError('Choose a future date and time for the proposed session.')
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
          setNotice(
            'Alternative time proposed. It remains pending until the parent responds.',
          )
        },
      },
    )
  }

  return (
    <Card>
      <CardHeader
        title="Review booking request"
        description="Actions are sent directly to the specialist booking API."
        action={<BookingStatusBadge status={current.status} />}
      />
      <CardBody>
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">
                {current.child.firstName} {current.child.lastName}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Parent/guardian: {current.parent.fullName}
              </p>
              <p className="mt-0.5 truncate text-[10px] text-slate-500">
                {current.parent.email ?? 'No parent email on file'}
              </p>
            </div>
            <Badge tone="neutral">{bookingStatusLabels[current.status]}</Badge>
          </div>

          <dl className="mt-4 grid gap-3 border-t border-slate-200 pt-3 sm:grid-cols-2">
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Requested
              </dt>
              <dd className="mt-0.5 text-xs font-medium text-slate-700">
                {formatDateTime(current.requestedAt)}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Scheduled
              </dt>
              <dd className="mt-0.5 text-xs font-medium text-slate-700">
                {formatDateTime(current.scheduledAt)}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Parent reason
              </dt>
              <dd className="mt-0.5 text-xs leading-5 text-slate-700">
                {current.reason ?? 'No reason provided.'}
              </dd>
            </div>
            {current.rejectionReason ? (
              <div className="sm:col-span-2">
                <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Rejection reason
                </dt>
                <dd className="mt-0.5 text-xs leading-5 text-rose-800">
                  {current.rejectionReason}
                </dd>
              </div>
            ) : null}
          </dl>
        </div>

        {latestProposal ? (
          <div className="mt-3 rounded-xl border border-sky-200 bg-sky-50/60 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold text-sky-950">
                Latest proposed time: {formatDateTime(latestProposal.proposedAt)}
              </p>
              <Badge tone={proposalTones[latestProposal.status]}>
                {proposalLabels[latestProposal.status]}
              </Badge>
            </div>
            {latestProposal.note ? (
              <p className="mt-1.5 text-[11px] leading-4 text-sky-900">
                {latestProposal.note}
              </p>
            ) : null}
          </div>
        ) : null}

        {bookingDetail.isError ? (
          <div className="mt-3">
            <ApiErrorNotice
              error={bookingDetail.error}
              title="Could not refresh booking details"
              onRetry={() => {
                void bookingDetail.refetch()
              }}
            />
          </div>
        ) : null}

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-800">Decision</span>
            <Badge tone={availableDecisions.length > 0 ? 'brand' : 'neutral'}>
              {availableDecisions.length > 0
                ? 'API action available'
                : 'No action available'}
            </Badge>
          </div>

          {availableDecisions.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-3">
              {availableDecisions.map((option) => (
                <button
                  type="button"
                  className={`flex flex-col items-start gap-1 rounded-xl border px-3 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                    decision === option.value
                      ? 'border-teal-600 bg-teal-50 ring-1 ring-teal-600'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                  aria-pressed={decision === option.value}
                  key={option.value}
                  disabled={isPending}
                  onClick={() => chooseDecision(option.value)}
                >
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                    <Icon name={option.icon} size={13} />
                    {option.label}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {option.copy}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <Callout
              tone="neutral"
              title={`No further actions available for ${bookingStatusLabels[current.status].toLowerCase()} bookings`}
              icon="lock"
            >
              The booking API only allows approval, rejection, or a new time for
              pending, reschedule-pending, and confirmed bookings.
            </Callout>
          )}

          {decision === 'approve' && canDecide ? (
            <div className="mt-3 grid gap-3">
              <Callout tone="success" title="Confirm this session">
                Approving changes the booking status to confirmed and clear any
                previous rejection reason.
              </Callout>
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  variant="primary"
                  onClick={handleApprove}
                  disabled={isPending}
                  aria-busy={approveBooking.isPending}
                >
                  {approveBooking.isPending ? 'Approving…' : 'Approve request'}
                  <Icon name="check" size={14} />
                </Button>
              </div>
            </div>
          ) : null}

          {decision === 'reject' && canDecide ? (
            <div className="mt-3 grid gap-3">
              <Field
                label="Rejection reason"
                htmlFor="rejection-reason"
                hint="A written reason is required and is shown to the parent."
              >
                <Textarea
                  id="rejection-reason"
                  value={reason}
                  disabled={isPending}
                  onChange={(event) => {
                    setReason(event.target.value)
                    setFormError('')
                    rejectBooking.reset()
                  }}
                  placeholder="Explain why this request cannot be accepted."
                  rows={3}
                />
              </Field>
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  variant="danger"
                  onClick={handleReject}
                  disabled={isPending}
                  aria-busy={rejectBooking.isPending}
                >
                  <Icon name="close" size={14} />
                  {rejectBooking.isPending ? 'Rejecting…' : 'Reject request'}
                </Button>
              </div>
            </div>
          ) : null}

          {decision === 'propose' && canPropose ? (
            <div className="mt-3 grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Proposed date" htmlFor="proposed-date">
                  <Input
                    id="proposed-date"
                    type="date"
                    min={toDateKey(new Date())}
                    value={proposedDate}
                    disabled={isPending}
                    onChange={(event) => {
                      setProposedDate(event.target.value)
                      setFormError('')
                    }}
                  />
                </Field>
                <Field label="Proposed time" htmlFor="proposed-time">
                  <Input
                    id="proposed-time"
                    type="time"
                    value={proposedTime}
                    disabled={isPending}
                    onChange={(event) => {
                      setProposedTime(event.target.value)
                      setFormError('')
                    }}
                  />
                </Field>
              </div>
              <Field
                label="Note to parent"
                htmlFor="proposal-note"
                optional
                hint="Optional context about why this time was offered."
              >
                <Textarea
                  id="proposal-note"
                  value={proposalNote}
                  disabled={isPending}
                  onChange={(event) => setProposalNote(event.target.value)}
                  placeholder="Add a short note for the parent."
                  rows={2}
                />
              </Field>
              <Callout tone="warning" title="Pending until approved" icon="clock">
                A proposed alternative time remains pending until the mother
                approves it and must not be shown as confirmed.
              </Callout>
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  variant="primary"
                  onClick={handlePropose}
                  disabled={isPending}
                  aria-busy={proposeTime.isPending}
                >
                  <Icon name="calendar" size={14} />
                  {proposeTime.isPending
                    ? 'Sending…'
                    : 'Send proposed time'}
                </Button>
              </div>
            </div>
          ) : null}

          {decision === null && availableDecisions.length > 0 ? (
            <p className="mt-3 text-[11px] leading-4 text-slate-500">
              Select a decision type to open the matching controls.
            </p>
          ) : null}

          {formError ? (
            <div className="mt-3">
              <InlineNotice tone="warning">{formError}</InlineNotice>
            </div>
          ) : null}

          {notice ? (
            <div className="mt-3">
              <InlineNotice tone="success">{notice}</InlineNotice>
            </div>
          ) : null}

          {approveBooking.isError ? (
            <div className="mt-3">
              <InlineNotice tone="danger">
                {getApiErrorMessage(approveBooking.error)}
              </InlineNotice>
            </div>
          ) : null}

          {rejectBooking.isError ? (
            <div className="mt-3">
              <InlineNotice tone="danger">
                {getApiErrorMessage(rejectBooking.error)}
              </InlineNotice>
            </div>
          ) : null}

          {proposeTime.isError ? (
            <div className="mt-3">
              <InlineNotice tone="danger">
                {getApiErrorMessage(proposeTime.error)}
              </InlineNotice>
            </div>
          ) : null}
        </div>
      </CardBody>

      <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-800">Telehealth</p>
          <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
            Placeholder only — live video, room creation, and streaming are not
            implemented.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          disabled
          title="Telehealth is not implemented in this portal"
        >
          <Icon name="video" size={14} />
          Telehealth
        </Button>
      </div>
    </Card>
  )
}
