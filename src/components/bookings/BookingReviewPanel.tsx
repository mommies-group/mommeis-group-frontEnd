import { useState } from 'react'
import { Icon } from '../icons/Icon'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Callout } from '../ui/Callout'
import { Card, CardBody, CardHeader } from '../ui/Card'
import { Field, Input, Textarea } from '../ui/Field'
import { InlineNotice } from '../ui/InlineNotice'

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

export function BookingReviewPanel() {
  const [decision, setDecision] = useState<Decision | null>(null)
  const [reason, setReason] = useState('')
  const [proposedDate, setProposedDate] = useState('')
  const [proposedTime, setProposedTime] = useState('')
  const [notice, setNotice] = useState('')

  const chooseDecision = (next: Decision) => {
    setDecision(next)
    setNotice('')
  }

  const handlePreviewAction = (action: string) => {
    setNotice(
      `Preview only — ${action} was not submitted. No booking was changed.`,
    )
  }

  return (
    <Card>
      <CardHeader
        title="Review booking request"
        description="Decision controls are structured for future booking APIs."
        action={<Badge tone="neutral">No request selected</Badge>}
      />
      <CardBody>
        <Callout tone="neutral" title="No booking selected" icon="inbox">
          Choose a pending request from the list to review. The controls below
          are visual previews only and do not change any booking.
        </Callout>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-800">Decision</span>
            <Badge tone="info">UI preview</Badge>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            {decisions.map((option) => (
              <button
                type="button"
                className={`flex flex-col items-start gap-1 rounded-xl border px-3 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                  decision === option.value
                    ? 'border-teal-600 bg-teal-50 ring-1 ring-teal-600'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
                aria-pressed={decision === option.value}
                key={option.value}
                onClick={() => chooseDecision(option.value)}
              >
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                  <Icon name={option.icon} size={13} />
                  {option.label}
                </span>
                <span className="text-[10px] text-slate-500">{option.copy}</span>
              </button>
            ))}
          </div>

          {decision === 'approve' ? (
            <div className="mt-3 grid gap-3">
              <Callout tone="info" title="Approval preview">
                Approving a request confirms the session. In the connected
                product, this action will be handled by the bookings service.
              </Callout>
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  variant="primary"
                  onClick={() => handlePreviewAction('approval')}
                >
                  <Icon name="check" size={14} />
                  Approve request
                </Button>
              </div>
            </div>
          ) : null}

          {decision === 'reject' ? (
            <div className="mt-3 grid gap-3">
              <Field
                label="Rejection reason"
                htmlFor="rejection-reason"
                hint="A written reason is required when rejecting a booking request."
              >
                <Textarea
                  id="rejection-reason"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Explain why this request cannot be accepted."
                  rows={3}
                />
              </Field>
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  variant="danger"
                  onClick={() => handlePreviewAction('rejection')}
                >
                  <Icon name="close" size={14} />
                  Reject request
                </Button>
              </div>
            </div>
          ) : null}

          {decision === 'propose' ? (
            <div className="mt-3 grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Proposed date" htmlFor="proposed-date">
                  <Input
                    id="proposed-date"
                    type="date"
                    value={proposedDate}
                    onChange={(event) => setProposedDate(event.target.value)}
                  />
                </Field>
                <Field label="Proposed time" htmlFor="proposed-time">
                  <Input
                    id="proposed-time"
                    type="time"
                    value={proposedTime}
                    onChange={(event) => setProposedTime(event.target.value)}
                  />
                </Field>
              </div>
              <Callout tone="warning" title="Pending until approved" icon="clock">
                A proposed alternative time remains pending until the mother
                approves it. It must not be shown as confirmed.
              </Callout>
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  variant="primary"
                  onClick={() => handlePreviewAction('proposed time')}
                >
                  <Icon name="calendar" size={14} />
                  Send proposed time
                </Button>
              </div>
            </div>
          ) : null}

          {decision === null ? (
            <p className="mt-3 text-[11px] leading-4 text-slate-500">
              Select a decision type to preview the matching controls.
            </p>
          ) : null}

          {notice ? (
            <div className="mt-3">
              <InlineNotice tone="info">{notice}</InlineNotice>
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
          title="Telehealth is a placeholder in this phase"
        >
          <Icon name="video" size={14} />
          Telehealth
        </Button>
      </div>
    </Card>
  )
}
