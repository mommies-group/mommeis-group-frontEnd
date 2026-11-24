import { useEffect, useState } from 'react'
import { Icon } from '../icons/Icon'
import { ApiErrorNotice } from '../ui/ApiErrorNotice'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Input, Textarea } from '../ui/Field'
import { Spinner } from '../ui/Spinner'
import {
  useTreatmentPlan,
  useTreatmentPlanInvoice,
  useTreatmentPlanSession,
  useTreatmentPlanSessions,
} from '../../hooks/queries/treatment-plans/treatment-plans.queries'
import {
  useCancelTreatmentPlan,
  useCompleteTreatmentSession,
  useNoShowTreatmentSession,
  useSubmitTreatmentPlan,
} from '../../hooks/mutations/treatment-plans/treatment-plans.mutations'
import { notifyError, notifySuccess } from '../../lib/toast'
import { formatScheduledDateTime } from '../../lib/format'
import type { TreatmentPlan } from '../../types/treatment-plan.types'
import { StatusBadge } from './treatment-plan-status'
import { humanizeTreatmentPlanStatus } from '../../lib/treatment-plan-status'

type TreatmentPlanDetailModalProps = {
  open: boolean
  planId: string | null
  onClose: () => void
  onEdit: (plan: TreatmentPlan) => void
}

function isSessionActionable(planStatus: string, sessionStatus: string): boolean {
  return planStatus === 'ACTIVE' && sessionStatus === 'SCHEDULED'
}

export function TreatmentPlanDetailModal({
  open,
  planId,
  onClose,
  onEdit,
}: TreatmentPlanDetailModalProps) {
  const plan = useTreatmentPlan(open ? planId : null)
  const sessions = useTreatmentPlanSessions(open ? planId : null)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [showInvoice, setShowInvoice] = useState(false)
  const [sessionNotes, setSessionNotes] = useState<Record<string, string>>({})
  const [cancelMode, setCancelMode] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  const submitPlan = useSubmitTreatmentPlan()
  const completeSession = useCompleteTreatmentSession()
  const noShowSession = useNoShowTreatmentSession()
  const cancelPlan = useCancelTreatmentPlan()
  const sessionDetail = useTreatmentPlanSession(
    open ? planId : null,
    selectedSessionId,
  )
  const invoice = useTreatmentPlanInvoice(
    open && showInvoice ? planId : null,
  )

  useEffect(() => {
    if (!open) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open || !planId) {
    return null
  }

  const isBusy =
    submitPlan.isPending ||
    completeSession.isPending ||
    noShowSession.isPending ||
    cancelPlan.isPending
  const canEditPlan =
    plan.data?.status === 'DRAFT' ||
    plan.data?.status === 'MODIFICATION_REQUESTED'
  const sessionList = sessions.data ?? []
  const planSessionCount =
    sessionList.length || plan.data?.sessions?.length || plan.data?.totalSessions || 0
  const planFee = plan.data?.sessionFee ?? 0
  const planDiscount = plan.data?.discount ?? 0
  const planNetTotal = Math.max(0, planSessionCount * planFee - planDiscount)

  const handleSubmitPlan = () => {
    submitPlan.mutate(planId, {
      onSuccess: (updated) => notifySuccess(`Plan sent for approval: ${updated.title}`),
      onError: (error) => notifyError(error),
    })
  }

  const handleCancelPlan = () => {
    if (!cancelReason.trim()) {
      notifyError(null, 'Write a cancellation reason.')
      return
    }

    cancelPlan.mutate(
      { planId, reason: cancelReason.trim() },
      {
        onSuccess: () => {
          notifySuccess('Treatment plan cancelled.')
          setCancelMode(false)
          setCancelReason('')
        },
        onError: (error) => notifyError(error),
      },
    )
  }

  const handleCompleteSession = (sessionId: string) => {
    completeSession.mutate(
      { planId, sessionId, note: sessionNotes[sessionId]?.trim() ?? '' },
      {
        onSuccess: () => {
          notifySuccess('Session marked as completed.')
          setSelectedSessionId(null)
        },
        onError: (error) => notifyError(error),
      },
    )
  }

  const handleNoShowSession = (sessionId: string) => {
    noShowSession.mutate(
      { planId, sessionId, note: sessionNotes[sessionId]?.trim() ?? '' },
      {
        onSuccess: () => {
          notifySuccess('Session marked as no-show.')
          setSelectedSessionId(null)
        },
        onError: (error) => notifyError(error),
      },
    )
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
      />
      <div
        aria-labelledby="treatment-plan-detail-title"
        aria-modal="true"
        className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-slate-300 bg-white shadow-2xl"
        role="dialog"
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-300 px-5 py-3.5">
          <div className="min-w-0">
            <h2
              className="truncate text-base font-semibold text-slate-900"
              id="treatment-plan-detail-title"
            >
              {plan.data?.title ?? 'Treatment plan'}
            </h2>
            {plan.data ? (
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <StatusBadge status={plan.data.status} />
                <span className="text-xs text-slate-500">
                  {plan.data.totalSessions} sessions · {plan.data.currency}{' '}
                  {plan.data.sessionFee}
                </span>
              </div>
            ) : null}
          </div>
          <button
            aria-label="Close treatment plan details"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            onClick={onClose}
            type="button"
          >
            <Icon name="close" size={15} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {plan.isLoading ? (
            <Spinner label="Loading treatment plan…" />
          ) : plan.isError ? (
            <ApiErrorNotice
              error={plan.error}
              title="Could not load treatment plan"
            />
          ) : plan.data ? (
            <>
              {plan.data.description ? (
                <p className="text-xs leading-5 text-slate-600">
                  {plan.data.description}
                </p>
              ) : null}
              {plan.data.treatmentGoals ? (
                <div className="rounded-lg border border-teal-200 bg-teal-50/60 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-800">
                    Treatment goals
                  </p>
                  <p className="mt-1 text-xs leading-5 text-teal-900">
                    {plan.data.treatmentGoals}
                  </p>
                </div>
              ) : null}
              {plan.data.progress ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">Progress</span>
                  <span className="ml-2">
                    {plan.data.progress.completed ?? 0} /{' '}
                    {plan.data.progress.total ?? plan.data.totalSessions}
                    {plan.data.progress.percentage !== undefined
                      ? ` · ${plan.data.progress.percentage}%`
                      : ''}
                  </span>
                </div>
              ) : null}

              {canEditPlan ? (
                <div className="flex flex-wrap items-center justify-end gap-2 rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={isBusy}
                    onClick={() => onEdit(plan.data as TreatmentPlan)}
                  >
                    <Icon name="edit" size={13} />
                    {plan.data.status === 'DRAFT' ? 'Edit draft' : 'Edit plan'}
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={isBusy}
                    onClick={handleSubmitPlan}
                    aria-busy={submitPlan.isPending}
                  >
                    <Icon name="check" size={13} />
                    Submit for approval
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    disabled={isBusy}
                    onClick={() => setCancelMode((current) => !current)}
                  >
                    <Icon name="close" size={13} />
                    Cancel plan
                  </Button>
                </div>
              ) : null}

              {cancelMode ? (
                <div className="grid gap-2 rounded-lg border border-rose-200 bg-rose-50/60 p-3">
                  <Textarea
                    aria-label="Cancellation reason"
                    rows={2}
                    value={cancelReason}
                    disabled={isBusy}
                    onChange={(event) => setCancelReason(event.target.value)}
                    placeholder="Reason for cancelling this plan"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={isBusy}
                      onClick={() => setCancelMode(false)}
                    >
                      Keep plan
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={isBusy || !cancelReason.trim()}
                      onClick={handleCancelPlan}
                      aria-busy={cancelPlan.isPending}
                    >
                      Confirm cancellation
                    </Button>
                  </div>
                </div>
              ) : null}

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-slate-900">Sessions</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowInvoice((current) => !current)}
                  >
                    <Icon name="file" size={13} />
                    {showInvoice ? 'Hide invoice' : 'View invoice'}
                  </Button>
                </div>

                {showInvoice ? (
                  <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                    {invoice.isLoading ? (
                      <Spinner label="Loading invoice…" />
                    ) : invoice.isError ? (
                      <ApiErrorNotice
                        error={invoice.error}
                        title="Could not load invoice"
                      />
                    ) : invoice.data ? (
                      <div className="grid gap-1 text-xs text-slate-600">
                        <p>
                          <span className="font-semibold text-slate-800">
                            Invoice:
                          </span>{' '}
                          {invoice.data.invoiceNumber}
                        </p>
                        <p>
                          <span className="font-semibold text-slate-800">
                            Sessions:
                          </span>{' '}
                          {invoice.data.sessionCount ?? planSessionCount}
                        </p>
                        <p>
                          <span className="font-semibold text-slate-800">
                            Session fee:
                          </span>{' '}
                          {invoice.data.sessionFee ?? planFee}{' '}
                          {plan.data.currency ?? ''}
                        </p>
                        {(invoice.data.discount ?? planDiscount) > 0 ? (
                          <p>
                            <span className="font-semibold text-slate-800">
                              Discount:
                            </span>{' '}
                            −{invoice.data.discount ?? planDiscount}{' '}
                            {plan.data.currency ?? ''}
                          </p>
                        ) : null}
                        <p>
                          <span className="font-semibold text-slate-800">
                            Total:
                          </span>{' '}
                          {invoice.data.totalAmount} {plan.data.currency ?? ''}
                        </p>
                      </div>
                    ) : (
                      <div className="grid gap-1 text-xs text-slate-600">
                        <p>
                          <span className="font-semibold text-slate-800">
                            Sessions:
                          </span>{' '}
                          {planSessionCount}
                        </p>
                        <p>
                          <span className="font-semibold text-slate-800">
                            Session fee:
                          </span>{' '}
                          {planFee} {plan.data.currency ?? ''}
                        </p>
                        {planDiscount > 0 ? (
                          <p>
                            <span className="font-semibold text-slate-800">
                              Discount:
                            </span>{' '}
                            −{planDiscount} {plan.data.currency ?? ''}
                          </p>
                        ) : null}
                        <p>
                          <span className="font-semibold text-slate-800">
                            Total:
                          </span>{' '}
                          {planNetTotal} {plan.data.currency ?? ''}
                        </p>
                        <p className="mt-1 text-[12px] text-slate-400">
                          Invoice not issued yet — showing plan summary.
                        </p>
                      </div>
                    )}
                  </div>
                ) : null}

                {sessions.isLoading ? (
                  <Spinner label="Loading sessions…" />
                ) : sessions.isError ? (
                  <ApiErrorNotice
                    error={sessions.error}
                    title="Could not load sessions"
                  />
                ) : sessionList.length ? (
                  <div className="space-y-2">
                    {sessionList.map((session) => (
                      <div
                        className="rounded-xl border border-slate-200 bg-white p-3"
                        key={session.id}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-900">
                              Session {session.sessionNumber}
                            </p>
                            <p className="mt-0.5 text-[12px] text-slate-500">
                              {formatScheduledDateTime(session.scheduledAt)} ·{' '}
                              {session.durationMinutes} min
                            </p>
                          </div>
                          <Badge
                            tone={
                              session.status === 'COMPLETED'
                                ? 'success'
                                : session.status === 'NO_SHOW'
                                  ? 'danger'
                                  : 'neutral'
                            }
                          >
                            {humanizeTreatmentPlanStatus(session.status)}
                          </Badge>
                        </div>

                        {session.notes ? (
                          <p className="mt-2 text-xs leading-5 text-slate-600">
                            {session.notes}
                          </p>
                        ) : null}

                        {isSessionActionable(plan.data.status, session.status) ? (
                          <div className="mt-3 grid gap-2">
                            <Input
                              aria-label={`Note for session ${session.sessionNumber}`}
                              value={sessionNotes[session.id] ?? ''}
                              disabled={isBusy}
                              onChange={(event) =>
                                setSessionNotes((current) => ({
                                  ...current,
                                  [session.id]: event.target.value,
                                }))
                              }
                              placeholder="Optional session note"
                            />
                            <div className="flex flex-wrap items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={isBusy}
                                onClick={() => setSelectedSessionId(session.id)}
                              >
                                Details
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                disabled={isBusy}
                                aria-busy={noShowSession.isPending}
                                onClick={() => handleNoShowSession(session.id)}
                              >
                                No show
                              </Button>
                              <Button
                                size="sm"
                                variant="primary"
                                disabled={isBusy}
                                aria-busy={completeSession.isPending}
                                onClick={() => handleCompleteSession(session.id)}
                              >
                                Complete
                              </Button>
                            </div>
                          </div>
                        ) : null}

                        {selectedSessionId === session.id ? (
                          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                            {sessionDetail.isLoading ? (
                              <Spinner label="Loading session…" />
                            ) : sessionDetail.data ? (
                              <div className="grid gap-1 text-xs text-slate-600">
                                <p>
                                  <span className="font-semibold text-slate-800">
                                    Status:
                                  </span>{' '}
                                  {humanizeTreatmentPlanStatus(sessionDetail.data.status)}
                                </p>
                                <p>
                                  <span className="font-semibold text-slate-800">
                                    Scheduled:
                                  </span>{' '}
                                  {formatScheduledDateTime(sessionDetail.data.scheduledAt)}
                                </p>
                                {sessionDetail.data.notes ? (
                                  <p>{sessionDetail.data.notes}</p>
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    No sessions scheduled.
                  </p>
                )}
              </div>
            </>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-300 bg-slate-50/60 px-5 py-3">
          <Button size="sm" variant="ghost" onClick={onClose} disabled={isBusy}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
