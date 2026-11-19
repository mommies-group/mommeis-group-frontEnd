import { useState } from 'react'
import { Icon } from '../components/icons/Icon'
import { ApiErrorNotice } from '../components/ui/ApiErrorNotice'
import { Button } from '../components/ui/Button'
import { Callout } from '../components/ui/Callout'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { Field, Input, Select } from '../components/ui/Field'
import { InlineNotice } from '../components/ui/InlineNotice'
import { PageHeader } from '../components/ui/PageHeader'
import { Skeleton } from '../components/ui/Skeleton'
import { useReplaceAvailability } from '../hooks/mutations/profile/profile.mutations'
import { useAvailability } from '../hooks/queries/profile/profile.queries'
import { getApiErrorMessage } from '../lib/api-error'
import type { AvailabilitySlot, DayOfWeek } from '../types/profile.types'

const DAYS: Array<{ label: string; short: string; value: DayOfWeek }> = [
  { label: 'Monday', short: 'Mon', value: 1 },
  { label: 'Tuesday', short: 'Tue', value: 2 },
  { label: 'Wednesday', short: 'Wed', value: 3 },
  { label: 'Thursday', short: 'Thu', value: 4 },
  { label: 'Friday', short: 'Fri', value: 5 },
  { label: 'Saturday', short: 'Sat', value: 6 },
  { label: 'Sunday', short: 'Sun', value: 0 },
]

type DayWindow = {
  start: string
  end: string
}

type AvailabilityDraft = Partial<Record<DayOfWeek, DayWindow>>

type Feedback = {
  tone: 'success' | 'info' | 'warning' | 'danger'
  text: string
}

function toMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number)
  return hours * 60 + minutes
}

function formatRange(start: string, end: string): string {
  return `${start} – ${end}`
}

function buildDraft(serverSlots: AvailabilitySlot[]): AvailabilityDraft {
  const draft: AvailabilityDraft = {}
  serverSlots.forEach((slot) => {
    draft[slot.dayOfWeek] = {
      start: slot.startTime,
      end: slot.endTime,
    }
  })
  return draft
}

export function AvailabilityPage() {
  const availability = useAvailability()
  const replaceAvailability = useReplaceAvailability()
  const [overrides, setOverrides] = useState<AvailabilityDraft | null>(null)
  const [hasEdits, setHasEdits] = useState(false)
  const [draftDay, setDraftDay] = useState<DayOfWeek>(1)
  const [draftStart, setDraftStart] = useState('09:00')
  const [draftEnd, setDraftEnd] = useState('17:00')
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  const slots = overrides ?? buildDraft(availability.data ?? [])
  const slotCount = DAYS.filter((day) => slots[day.value]).length
  const queryReady = availability.isSuccess
  const saveDisabled =
    !queryReady ||
    !hasEdits ||
    slotCount === 0 ||
    replaceAvailability.isPending

  const applyWindow = () => {
    setFeedback(null)

    if (toMinutes(draftEnd) <= toMinutes(draftStart)) {
      setFeedback({
        tone: 'warning',
        text: 'End time must be later than start time.',
      })
      return
    }

    const current =
      overrides ?? buildDraft(availability.data ?? [])
    setOverrides({
      ...current,
      [draftDay]: { start: draftStart, end: draftEnd },
    })
    setHasEdits(true)
    const day = DAYS.find((item) => item.value === draftDay)
    setFeedback({
      tone: 'info',
      text: `${day?.label ?? 'The selected day'} window updated locally. Save availability to apply it.`,
    })
  }

  const removeWindow = (day: DayOfWeek) => {
    const current = overrides ?? buildDraft(availability.data ?? [])
    const next = { ...current }
    delete next[day]
    setOverrides(next)
    setHasEdits(true)
    setFeedback({
      tone: 'info',
      text: 'Window removed locally. Save availability to apply the change.',
    })
  }

  const focusForm = (day: DayOfWeek) => {
    setDraftDay(day)
    const form = document.getElementById('availability-form')
    form?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    document.getElementById('availability-day')?.focus()
  }

  const saveAvailability = () => {
    setFeedback(null)
    replaceAvailability.reset()

    const payload = DAYS.flatMap((day) => {
      const window = slots[day.value]

      if (!window) {
        return []
      }

      return [
        {
          dayOfWeek: day.value,
          startTime: window.start,
          endTime: window.end,
        },
      ]
    })

    if (payload.length === 0) {
      setFeedback({
        tone: 'warning',
        text: 'The availability API requires at least one weekly window.',
      })
      return
    }

    replaceAvailability.mutate(payload, {
      onSuccess: () => {
        setOverrides(null)
        setHasEdits(false)
        setFeedback({
          tone: 'success',
          text: 'Availability saved. Booking windows now use this weekly pattern.',
        })
      },
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Practice settings"
        title="Availability"
        description="Build a weekly working pattern. Times outside your available windows are shown as unavailable."
        actions={
          <Button
            variant="primary"
            onClick={saveAvailability}
            disabled={saveDisabled}
            aria-busy={replaceAvailability.isPending}
          >
            {replaceAvailability.isPending ? (
              <>
                <span
                  className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"
                  aria-hidden="true"
                />
                Saving…
              </>
            ) : (
              <>
                <Icon name="check" size={15} />
                Save availability
              </>
            )}
          </Button>
        }
      />

      {feedback ? (
        <InlineNotice tone={feedback.tone}>{feedback.text}</InlineNotice>
      ) : null}

      {replaceAvailability.isError ? (
        <InlineNotice tone="danger">
          {getApiErrorMessage(replaceAvailability.error)}
        </InlineNotice>
      ) : null}

      {availability.isError ? (
        <ApiErrorNotice
          error={availability.error}
          title="Could not load availability"
          onRetry={() => {
            void availability.refetch()
          }}
        />
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader
              title="Weekly availability"
              description="One available window can be stored per day by the current API."
              action={
                <div
                  className="flex flex-wrap items-center gap-3 text-[10px] font-medium text-slate-500"
                  aria-label="Availability legend"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-teal-600" />
                    Available
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-slate-200" />
                    Unavailable
                  </span>
                </div>
              }
            />
            <CardBody flush>
              {availability.isLoading ? (
                <div className="grid gap-3 p-5" aria-label="Loading availability">
                  {[0, 1, 2, 3, 4].map((item) => (
                    <Skeleton className="h-12 w-full rounded-lg" key={item} />
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {DAYS.map((day) => {
                    const window = slots[day.value]

                    return (
                      <div
                        className="grid gap-3 px-5 py-3 sm:grid-cols-[130px_minmax(0,1fr)_auto] sm:items-center"
                        key={day.value}
                      >
                        <div>
                          <span className="block text-xs font-semibold text-slate-800">
                            {day.label}
                          </span>
                          <span className="mt-0.5 block text-[10px] text-slate-600">
                            {window ? formatRange(window.start, window.end) : 'Unavailable'}
                          </span>
                        </div>

                        <div className="min-h-10 rounded-lg border border-slate-200 bg-slate-50/60 px-2 py-1.5">
                          {window ? (
                            <span className="inline-flex items-center gap-1 rounded-md border border-teal-200 bg-teal-50 px-2 py-1 text-[10px] font-semibold text-teal-800">
                              {formatRange(window.start, window.end)}
                              <button
                                type="button"
                                className="flex h-3.5 w-3.5 items-center justify-center rounded-full transition hover:bg-teal-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                                aria-label={`Remove availability on ${day.label} from ${window.start} to ${window.end}`}
                                onClick={() => removeWindow(day.value)}
                              >
                                <Icon name="close" size={9} />
                              </button>
                            </span>
                          ) : (
                            <span className="flex min-h-7 items-center text-[10px] text-slate-600">
                              Unavailable all day
                            </span>
                          )}
                        </div>

                        <div className="justify-self-start sm:justify-self-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={!queryReady}
                            onClick={() => focusForm(day.value)}
                          >
                            <Icon name={window ? 'edit' : 'plus'} size={13} />
                            <span>{window ? 'Edit window' : 'Add window'}</span>
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Week overview"
              description="A visual representation of available windows across the week."
            />
            <CardBody>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                {DAYS.map((day) => {
                  const window = slots[day.value]

                  return (
                    <div
                      className="rounded-xl border border-slate-200 bg-slate-50/60 p-2"
                      key={day.value}
                    >
                      <span className="block text-center text-[10px] font-bold uppercase tracking-wide text-slate-500">
                        {day.short}
                      </span>
                      <div
                        className="mt-2 flex min-h-28 flex-col gap-1 rounded-lg border border-dashed border-slate-200 bg-slate-100 p-1.5"
                        role="img"
                        aria-label={`${day.label}: ${
                          window ? formatRange(window.start, window.end) : 'unavailable all day'
                        }`}
                      >
                        {window ? (
                          <span className="rounded bg-teal-600 px-1 py-1 text-center text-[9px] font-semibold leading-3 text-white">
                            <span className="block">{window.start}</span>
                            <span className="block">– {window.end}</span>
                          </span>
                        ) : (
                          <span className="flex flex-1 items-center justify-center text-center text-[9px] leading-3 text-slate-600">
                            Unavailable
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              <Callout tone="neutral" className="mt-4">
                Neutral columns are unavailable. Only windows saved here become
                bookable availability.
              </Callout>
            </CardBody>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader
              title="Add or update a window"
              description="The API stores one start and end time for each day."
            />
            <CardBody>
              <div className="grid gap-4" id="availability-form">
                <Field label="Working day" htmlFor="availability-day">
                  <Select
                    id="availability-day"
                    value={draftDay}
                    disabled={!queryReady || replaceAvailability.isPending}
                    onChange={(event) =>
                      setDraftDay(Number(event.target.value) as DayOfWeek)
                    }
                  >
                    {DAYS.map((day) => (
                      <option value={day.value} key={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </Select>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Start time" htmlFor="availability-start">
                    <Input
                      id="availability-start"
                      type="time"
                      value={draftStart}
                      disabled={!queryReady || replaceAvailability.isPending}
                      onChange={(event) => setDraftStart(event.target.value)}
                    />
                  </Field>
                  <Field label="End time" htmlFor="availability-end">
                    <Input
                      id="availability-end"
                      type="time"
                      value={draftEnd}
                      disabled={!queryReady || replaceAvailability.isPending}
                      onChange={(event) => setDraftEnd(event.target.value)}
                    />
                  </Field>
                </div>
                <Button
                  variant="secondary"
                  block
                  onClick={applyWindow}
                  disabled={!queryReady || replaceAvailability.isPending}
                >
                  <Icon name="plus" size={14} />
                  {slots[draftDay] ? 'Update window' : 'Add window to week'}
                </Button>
                <p className="text-[11px] leading-4 text-slate-500">
                  Times are shown in your local time zone. Applying a window for
                  a day replaces the existing window for that day.
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
