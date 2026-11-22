import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Icon } from '../icons/Icon'
import { ApiErrorNotice } from '../ui/ApiErrorNotice'
import { Button } from '../ui/Button'
import { Field, Input, Select, Textarea } from '../ui/Field'
import { Spinner } from '../ui/Spinner'
import { usePricing } from '../../hooks/queries/profile/profile.queries'
import { usePatients } from '../../hooks/queries/patients/patients.queries'
import { useTreatmentPlan } from '../../hooks/queries/treatment-plans/treatment-plans.queries'
import {
  useCreateTreatmentPlan,
  useUpdateTreatmentPlan,
} from '../../hooks/mutations/treatment-plans/treatment-plans.mutations'
import { notifyError, notifySuccess } from '../../lib/toast'
import { toDateKey, toDateTimeIso } from '../../lib/format'
import type { TreatmentPlan } from '../../types/treatment-plan.types'

type SessionDraft = {
  sessionNumber: number
  date: string
  time: string
  durationMinutes: number
  notes: string
}

type TreatmentPlanFormModalProps = {
  open: boolean
  childId?: string | null
  bookingId?: string | null
  planId?: string | null
  onClose: () => void
  onSaved?: (plan: TreatmentPlan) => void
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function makeSession(sessionNumber: number): SessionDraft {
  const day = new Date()
  day.setDate(day.getDate() + sessionNumber * 7)

  return {
    sessionNumber,
    date: toDateKey(day),
    time: '10:00',
    durationMinutes: 30,
    notes: '',
  }
}

function initialSessions(plan: TreatmentPlan | null | undefined): SessionDraft[] {
  const sessions = plan?.sessions ?? []
  if (sessions.length) {
    return sessions.map((session, index) => {
      const scheduledAt = new Date(session.scheduledAt)
      return {
        sessionNumber: session.sessionNumber ?? index + 1,
        date: toDateKey(scheduledAt),
        time: `${pad(scheduledAt.getHours())}:${pad(scheduledAt.getMinutes())}`,
        durationMinutes: session.durationMinutes,
        notes: session.notes ?? '',
      }
    })
  }

  return Array.from(
    { length: plan?.totalSessions ?? 2 },
    (_, index) => makeSession(index + 1),
  )
}

type PlanFieldsProps = {
  plan: TreatmentPlan | null | undefined
  childId?: string | null
  bookingId?: string | null
  planId?: string | null
  onClose: () => void
  onSaved?: (plan: TreatmentPlan) => void
}

function PlanFields({
  plan,
  childId,
  bookingId,
  planId,
  onClose,
  onSaved,
}: PlanFieldsProps) {
  const patients = usePatients()
  const pricing = usePricing()
  const createPlan = useCreateTreatmentPlan()
  const updatePlan = useUpdateTreatmentPlan()

  const isEdit = Boolean(planId)
  const [selectedChildId, setSelectedChildId] = useState(
    plan?.childId ?? childId ?? '',
  )
  const [title, setTitle] = useState(plan?.title ?? '')
  const [description, setDescription] = useState(plan?.description ?? '')
  const [treatmentGoals, setTreatmentGoals] = useState(
    plan?.treatmentGoals ?? '',
  )
  const [totalSessions, setTotalSessions] = useState(
    plan?.totalSessions ?? 2,
  )
  // null means "use my specialist consultation fee"; the effective value is
  // derived every render so pricing data that loads later shows immediately.
  const [sessionFee, setSessionFee] = useState<number | null>(
    plan?.sessionFee ?? null,
  )
  const currency = plan?.currency ?? pricing.data?.currency ?? 'EGP'
  const [discount, setDiscount] = useState(plan?.discount ?? 0)
  const [sessions, setSessions] = useState<SessionDraft[]>(() =>
    initialSessions(plan),
  )

  const isSaving = createPlan.isPending || updatePlan.isPending
  const patientOptions = patients.data ?? []
  const resolvedChildId = selectedChildId || childId || ''
  const effectiveSessionFee =
    sessionFee ?? pricing.data?.consultationFee ?? pricing.data?.sessionFee ?? 0
  const planTotal = sessions.length * effectiveSessionFee

  const updateSession = (index: number, patch: Partial<SessionDraft>) => {
    setSessions((current) =>
      current.map((session, sessionIndex) =>
        sessionIndex === index ? { ...session, ...patch } : session,
      ),
    )
  }

  const changeTotalSessions = (value: number) => {
    const next = Math.max(1, Math.min(30, Number.isFinite(value) ? value : 1))
    setTotalSessions(next)
    setSessions((current) =>
      Array.from(
        { length: next },
        (_, index) => current[index] ?? makeSession(index + 1),
      ),
    )
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    createPlan.reset()
    updatePlan.reset()

    if (!resolvedChildId) {
      notifyError(null, 'Select a patient.')
      return
    }
    if (!title.trim()) {
      notifyError(null, 'Enter a plan title.')
      return
    }
    if (sessions.length !== totalSessions) {
      notifyError(null, 'Add one session for every planned session.')
      return
    }

    const sessionPayload = sessions.map((session, index) => ({
      sessionNumber: index + 1,
      scheduledAt: toDateTimeIso(session.date, session.time) ?? '',
      durationMinutes: Number(session.durationMinutes),
      notes: session.notes.trim() || undefined,
    }))

    if (sessionPayload.some((session) => !session.scheduledAt)) {
      notifyError(null, 'Choose a date and time for every session.')
      return
    }

    if (isEdit && planId) {
      updatePlan.mutate(
        {
          planId,
          payload: {
            title: title.trim(),
            totalSessions,
            sessionFee: effectiveSessionFee,
            sessions: sessionPayload,
          },
        },
        {
          onSuccess: (updated) => {
            notifySuccess('Treatment plan updated.')
            onSaved?.(updated)
            onClose()
          },
          onError: (error) => notifyError(error),
        },
      )
      return
    }

    createPlan.mutate(
      {
        childId: resolvedChildId,
        title: title.trim(),
        description: description.trim() || undefined,
        treatmentGoals: treatmentGoals.trim() || undefined,
        totalSessions,
        sessionDurationMinutes: Number(sessions[0]?.durationMinutes ?? 30),
        sessionFee: effectiveSessionFee,
        currency,
        discount: Number(discount),
        sessions: sessionPayload,
        consultationBookingId: bookingId || undefined,
      },
      {
        onSuccess: (created) => {
          notifySuccess('Treatment plan created as a draft.')
          onSaved?.(created)
          onClose()
        },
        onError: (error) => notifyError(error),
      },
    )
  }

  return (
    <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {!isEdit ? (
            <Field label="Patient" htmlFor="plan-child">
              <Select
                id="plan-child"
                disabled={isSaving || patientOptions.length === 0}
                value={selectedChildId}
                onChange={(event) => setSelectedChildId(event.target.value)}
              >
                <option value="">Select a patient</option>
                {patientOptions.map((patient) => (
                  <option value={patient.id} key={patient.id}>
                    {patient.firstName} {patient.lastName}
                  </option>
                ))}
              </Select>
            </Field>
          ) : null}
          <Field label="Title" htmlFor="plan-title">
            <Input
              id="plan-title"
              disabled={isSaving}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Treatment plan title"
            />
          </Field>
        </div>

        <Field label="Description" htmlFor="plan-description" optional>
          <Textarea
            id="plan-description"
            disabled={isSaving || isEdit}
            rows={2}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Short overview"
          />
        </Field>

        <Field label="Treatment goals" htmlFor="plan-goals" optional>
          <Textarea
            id="plan-goals"
            disabled={isSaving || isEdit}
            rows={2}
            value={treatmentGoals}
            onChange={(event) => setTreatmentGoals(event.target.value)}
            placeholder="Goals for this plan"
          />
        </Field>

        <div className="grid grid-cols-3 gap-2">
          <Field
            label={<span className="whitespace-nowrap">Consult fee</span>}
            htmlFor="plan-consultation-fee"
          >
            <Input
              id="plan-consultation-fee"
              min={0}
              step={10}
              type="number"
              disabled={isSaving}
              value={effectiveSessionFee}
              onChange={(event) => setSessionFee(Number(event.target.value))}
              aria-label="Consultation fee"
            />
          </Field>
          <Field label="Sessions" htmlFor="plan-total-sessions">
            <Input
              id="plan-total-sessions"
              min={1}
              max={30}
              type="number"
              disabled={isSaving}
              value={totalSessions}
              onChange={(event) =>
                changeTotalSessions(Number(event.target.value))
              }
            />
          </Field>
          <Field label="Currency" htmlFor="plan-currency">
            <Input id="plan-currency" disabled value={currency} readOnly />
          </Field>
        </div>

        {!isEdit ? (
          <Field label="Discount" htmlFor="plan-discount" optional>
            <Input
              id="plan-discount"
              min={0}
              type="number"
              disabled={isSaving}
              value={discount}
              onChange={(event) => setDiscount(Number(event.target.value))}
            />
          </Field>
        ) : null}

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-slate-900">
              Session schedule
            </p>
            <span className="rounded-full border border-slate-300 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600">
              {sessions.length} scheduled
            </span>
          </div>
          <div className="space-y-3">
            {sessions.map((session, index) => (
              <div
                className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 sm:grid-cols-[auto_1fr_1fr_100px]"
                key={session.sessionNumber}
              >
                <span className="flex items-center text-[11px] font-semibold text-slate-500">
                  #{session.sessionNumber}
                </span>
                <Field label="Date" htmlFor={`plan-session-date-${index}`}>
                  <Input
                    id={`plan-session-date-${index}`}
                    min={toDateKey(new Date())}
                    type="date"
                    disabled={isSaving}
                    value={session.date}
                    onChange={(event) =>
                      updateSession(index, { date: event.target.value })
                    }
                  />
                </Field>
                <Field label="Time" htmlFor={`plan-session-time-${index}`}>
                  <Input
                    id={`plan-session-time-${index}`}
                    type="time"
                    disabled={isSaving}
                    value={session.time}
                    onChange={(event) =>
                      updateSession(index, { time: event.target.value })
                    }
                  />
                </Field>
                <Field label="Minutes" htmlFor={`plan-session-minutes-${index}`}>
                  <Input
                    id={`plan-session-minutes-${index}`}
                    min={5}
                    step={5}
                    type="number"
                    disabled={isSaving}
                    value={session.durationMinutes}
                    onChange={(event) =>
                      updateSession(index, {
                        durationMinutes: Number(event.target.value),
                      })
                    }
                  />
                </Field>
                <Field
                  className="sm:col-span-4"
                  label="Session notes"
                  htmlFor={`plan-session-notes-${index}`}
                  optional
                >
                  <Input
                    id={`plan-session-notes-${index}`}
                    disabled={isSaving}
                    value={session.notes}
                    onChange={(event) =>
                      updateSession(index, { notes: event.target.value })
                    }
                    placeholder="Focus for this session"
                  />
                </Field>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-slate-300 bg-slate-50/60 px-5 py-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          disabled={isSaving}
          type="button"
        >
          Cancel
        </Button>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span
            aria-live="polite"
            className="rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1 text-[11px] font-semibold text-teal-900"
          >
            Total: {currency} {planTotal.toLocaleString()}
            <span className="ml-1 font-normal text-teal-700">
              ({sessions.length} × {effectiveSessionFee.toLocaleString()})
            </span>
          </span>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!title.trim() || !resolvedChildId || isSaving}
            aria-busy={isSaving}
          >
            <Icon name="check" size={13} />
            {isSaving
              ? 'Saving…'
              : isEdit
                ? 'Save changes'
                : 'Create draft plan'}
          </Button>
        </div>
      </div>
    </form>
  )
}

export function TreatmentPlanFormModal({
  open,
  childId,
  bookingId,
  planId,
  onClose,
  onSaved,
}: TreatmentPlanFormModalProps) {
  const plan = useTreatmentPlan(open && planId ? planId : null)

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

  if (!open) {
    return null
  }

  const isEdit = Boolean(planId)

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        aria-labelledby="treatment-plan-form-title"
        aria-modal="true"
        className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-slate-300 bg-white shadow-2xl"
        role="dialog"
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-300 px-5 py-3.5">
          <div className="min-w-0">
            <h2
              className="truncate text-sm font-semibold text-slate-900"
              id="treatment-plan-form-title"
            >
              {isEdit ? 'Edit treatment plan' : 'Create treatment plan'}
            </h2>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Define the plan and schedule every session.
            </p>
          </div>
          <button
            aria-label="Close treatment plan form"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            onClick={onClose}
            type="button"
          >
            <Icon name="close" size={15} />
          </button>
        </div>

        {isEdit && plan.isLoading ? (
          <div className="px-5 py-8">
            <Spinner label="Loading treatment plan…" />
          </div>
        ) : isEdit && plan.isError ? (
          <div className="p-5">
            <ApiErrorNotice
              error={plan.error}
              title="Could not load treatment plan"
            />
          </div>
        ) : (
          <PlanFields
            key={`${planId ?? 'new'}-${childId ?? ''}-${bookingId ?? ''}-${plan.data?.updatedAt ?? ''}`}
            plan={plan.data}
            childId={childId}
            bookingId={bookingId}
            planId={planId}
            onClose={onClose}
            onSaved={onSaved}
          />
        )}
      </div>
    </div>
  )
}
