import { useRef, useState } from 'react'
import { Icon } from '../components/icons/Icon'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Callout } from '../components/ui/Callout'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { Field, Input, Select } from '../components/ui/Field'
import { InlineNotice } from '../components/ui/InlineNotice'
import { PageHeader } from '../components/ui/PageHeader'

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

type AvailabilityBlock = {
  id: number
  day: number
  start: string
  end: string
}

type Feedback = {
  tone: 'success' | 'info' | 'warning'
  text: string
}

function toMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number)
  return hours * 60 + minutes
}

function formatRange(start: string, end: string): string {
  return `${start} – ${end}`
}

export function AvailabilityPage() {
  const [blocks, setBlocks] = useState<AvailabilityBlock[]>([])
  const [draftDay, setDraftDay] = useState('0')
  const [draftStart, setDraftStart] = useState('09:00')
  const [draftEnd, setDraftEnd] = useState('12:00')
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const nextBlockId = useRef(1)

  const addBlock = () => {
    const startMinutes = toMinutes(draftStart)
    const endMinutes = toMinutes(draftEnd)

    if (endMinutes <= startMinutes) {
      setFeedback({
        tone: 'warning',
        text: 'End time must be later than start time.',
      })
      return
    }

    const id = nextBlockId.current
    nextBlockId.current += 1
    setBlocks((current) => [
      ...current,
      { id, day: Number(draftDay), start: draftStart, end: draftEnd },
    ])
    setFeedback({
      tone: 'success',
      text: 'Block added to this local preview. Nothing has been saved.',
    })
  }

  const removeBlock = (id: number) => {
    setBlocks((current) => current.filter((block) => block.id !== id))
  }

  const focusForm = (day: number) => {
    setDraftDay(String(day))
    const form = document.getElementById('availability-form')
    form?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    document.getElementById('availability-day')?.focus()
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Practice settings"
        title="Availability"
        description="Build a weekly working pattern. Times outside your available blocks are shown as unavailable."
        actions={
          <>
            <Badge tone="warning">Local preview</Badge>
            <Button
              variant="primary"
              onClick={() =>
                setFeedback({
                  tone: 'info',
                  text: 'Preview only — availability is not saved to a server.',
                })
              }
            >
              <Icon name="check" size={15} />
              Save availability
            </Button>
          </>
        }
      />

      {feedback ? (
        <InlineNotice tone={feedback.tone}>{feedback.text}</InlineNotice>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader
              title="Weekly availability"
              description="Set the days and time ranges when booking requests can be offered."
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
              <div className="divide-y divide-slate-100">
                {DAYS.map((day, dayIndex) => {
                  const dayBlocks = blocks.filter(
                    (block) => block.day === dayIndex,
                  )

                  return (
                    <div
                      className="grid gap-3 px-5 py-3 sm:grid-cols-[130px_minmax(0,1fr)_auto] sm:items-center"
                      key={day}
                    >
                      <div>
                        <span className="block text-xs font-semibold text-slate-800">
                          {day}
                        </span>
                        <span className="mt-0.5 block text-[10px] text-slate-500">
                          {dayBlocks.length > 0
                            ? `${dayBlocks.length} block${dayBlocks.length === 1 ? '' : 's'} set`
                            : 'Unavailable'}
                        </span>
                      </div>

                      <div className="min-h-10 rounded-lg border border-slate-200 bg-slate-50/60 px-2 py-1.5">
                        {dayBlocks.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {dayBlocks.map((block) => (
                              <span
                                className="inline-flex items-center gap-1 rounded-md border border-teal-200 bg-teal-50 px-2 py-1 text-[10px] font-semibold text-teal-800"
                                key={block.id}
                              >
                                {formatRange(block.start, block.end)}
                                <button
                                  type="button"
                                  className="flex h-3.5 w-3.5 items-center justify-center rounded-full transition hover:bg-teal-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                                  aria-label={`Remove availability on ${day} from ${block.start} to ${block.end}`}
                                  onClick={() => removeBlock(block.id)}
                                >
                                  <Icon name="close" size={9} />
                                </button>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="flex min-h-7 items-center text-[10px] text-slate-500">
                            Unavailable all day
                          </span>
                        )}
                      </div>

                      <div className="justify-self-start sm:justify-self-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => focusForm(dayIndex)}
                        >
                          <Icon name="plus" size={13} />
                          <span>Add block</span>
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Week overview"
              description="A visual representation of available windows across the week."
              action={<Badge tone="neutral">Local time</Badge>}
            />
            <CardBody>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                {DAY_SHORT.map((shortDay, dayIndex) => {
                  const dayBlocks = blocks.filter(
                    (block) => block.day === dayIndex,
                  )

                  return (
                    <div
                      className="rounded-xl border border-slate-200 bg-slate-50/60 p-2"
                      key={shortDay}
                    >
                      <span className="block text-center text-[10px] font-bold uppercase tracking-wide text-slate-500">
                        {shortDay}
                      </span>
                      <div
                        className="mt-2 flex min-h-28 flex-col gap-1 rounded-lg border border-dashed border-slate-200 bg-slate-100 p-1.5"
                        role="img"
                        aria-label={`${DAYS[dayIndex]}: ${
                          dayBlocks.length > 0
                            ? dayBlocks
                                .map((block) =>
                                  formatRange(block.start, block.end),
                                )
                                .join(', ')
                            : 'unavailable all day'
                        }`}
                      >
                        {dayBlocks.length > 0 ? (
                          dayBlocks.map((block) => (
                            <span
                              className="rounded bg-teal-600 px-1 py-1 text-center text-[9px] font-semibold leading-3 text-white"
                              key={block.id}
                            >
                              <span className="block">{block.start}</span>
                              <span className="block">– {block.end}</span>
                            </span>
                          ))
                        ) : (
                          <span className="flex flex-1 items-center justify-center text-center text-[9px] leading-3 text-slate-500">
                            Unavailable
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              <Callout tone="neutral" className="mt-4">
                Neutral columns are unavailable. Only blocks you add here become
                bookable windows in the final product.
              </Callout>
            </CardBody>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader
              title="Add availability block"
              description="Choose a day and a time range for a bookable window."
              action={<Badge tone="brand">Preview</Badge>}
            />
            <CardBody>
              <div className="grid gap-4" id="availability-form">
                <Field label="Working day" htmlFor="availability-day">
                  <Select
                    id="availability-day"
                    value={draftDay}
                    onChange={(event) => setDraftDay(event.target.value)}
                  >
                    {DAYS.map((day, index) => (
                      <option value={index} key={day}>
                        {day}
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
                      onChange={(event) => setDraftStart(event.target.value)}
                    />
                  </Field>
                  <Field label="End time" htmlFor="availability-end">
                    <Input
                      id="availability-end"
                      type="time"
                      value={draftEnd}
                      onChange={(event) => setDraftEnd(event.target.value)}
                    />
                  </Field>
                </div>
                <Button variant="secondary" block onClick={addBlock}>
                  <Icon name="plus" size={14} />
                  Add block to week
                </Button>
                <p className="text-[11px] leading-4 text-slate-500">
                  Times are shown in your local time zone. This preview does not
                  save availability.
                </p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="How availability works" />
            <CardBody>
              <div className="grid gap-3">
                <p className="flex gap-2.5 text-xs leading-5 text-slate-600">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                    <Icon name="clock" size={14} />
                  </span>
                  <span>
                    All time outside your available blocks is treated as
                    unavailable.
                  </span>
                </p>
                <p className="flex gap-2.5 text-xs leading-5 text-slate-600">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                    <Icon name="calendar" size={14} />
                  </span>
                  <span>
                    Booking requests can only be offered inside the windows you
                    configure.
                  </span>
                </p>
                <p className="flex gap-2.5 text-xs leading-5 text-slate-600">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                    <Icon name="info" size={14} />
                  </span>
                  <span>
                    Saving is not connected in this static preview. The layout is
                    ready for an availability API later.
                  </span>
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
