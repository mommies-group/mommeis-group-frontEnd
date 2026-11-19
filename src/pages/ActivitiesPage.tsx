import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Icon } from '../components/icons/Icon'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { buttonStyles } from '../components/ui/buttonStyles'
import { Callout } from '../components/ui/Callout'
import { Card, CardBody, CardFooter, CardHeader } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Field, Input, Select } from '../components/ui/Field'
import { InlineNotice } from '../components/ui/InlineNotice'
import { PageHeader } from '../components/ui/PageHeader'
import { ROUTES } from '../router/routes'

export function ActivitiesPage() {
  const [patient, setPatient] = useState('')
  const [title, setTitle] = useState('')
  const [steps, setSteps] = useState<string[]>([''])
  const [mediaName, setMediaName] = useState('')
  const [duration, setDuration] = useState('')
  const [frequency, setFrequency] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [notice, setNotice] = useState('')

  const updateStep = (index: number, value: string) => {
    setSteps((current) =>
      current.map((step, itemIndex) => (itemIndex === index ? value : step)),
    )
  }

  const addStep = () => {
    setSteps((current) => [...current, ''])
  }

  const removeStep = (index: number) => {
    setSteps((current) => {
      if (current.length === 1) {
        return current
      }
      return current.filter((_, itemIndex) => itemIndex !== index)
    })
  }

  const handleMediaChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setMediaName(file.name)
    }
  }

  const clearForm = () => {
    setPatient('')
    setTitle('')
    setSteps([''])
    setMediaName('')
    setDuration('')
    setFrequency('')
    setDueDate('')
    setEndDate('')
    setNotice('')
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setNotice(
      'Preview only — this activity was not created. Creation will be connected to the activities API later.',
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Care plans"
        title="Activities"
        description="Create a personalised therapeutic activity for an eligible patient. Completion becomes visible only after the mother confirms it."
        actions={
          <a
            className={buttonStyles({ variant: 'secondary' })}
            href={`#${ROUTES.patients}`}
          >
            <Icon name="users" size={15} />
            View patients
          </a>
        }
      />

      <Callout
        tone="brand"
        title="Assigned activities require an eligible patient"
        icon="shield"
      >
        Only children with active consent for your specialist–child relationship
        and an active or recently completed appointment are eligible. This
        preview does not load patient records.
      </Callout>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.9fr)]">
        <Card>
          <CardHeader
            title="Create an activity"
            description="Write clear, step-by-step instructions for the family."
            action={<Badge tone="warning">Local preview</Badge>}
          />

          <form onSubmit={handleSubmit}>
            <CardBody>
              <div className="grid gap-6">
                <div className="grid gap-3 border-b border-slate-100 pb-6">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Recipient
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Choose an eligible patient from your active care list.
                    </p>
                  </div>
                  <Field
                    label="Patient"
                    htmlFor="activity-patient"
                    hint="No eligible patients are available in this preview."
                  >
                    <Select
                      id="activity-patient"
                      value={patient}
                      onChange={(event) => setPatient(event.target.value)}
                    >
                      <option value="">Select an eligible patient</option>
                    </Select>
                  </Field>
                </div>

                <div className="grid gap-4 border-b border-slate-100 pb-6">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Activity content
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Keep the title short and make each instruction easy to
                      follow at home.
                    </p>
                  </div>

                  <Field label="Activity title" htmlFor="activity-title">
                    <Input
                      id="activity-title"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder="Give the activity a clear title"
                    />
                  </Field>

                  <div className="grid gap-1.5">
                    <span className="text-xs font-semibold text-slate-800">
                      Step-by-step instructions
                    </span>
                    <div className="grid gap-2">
                      {steps.map((step, index) => (
                        <div
                          className="flex items-center gap-2"
                          key={`activity-step-${index}`}
                        >
                          <span
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-50 text-[11px] font-semibold text-teal-700"
                            aria-hidden="true"
                          >
                            {index + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <Input
                              value={step}
                              aria-label={`Instruction step ${index + 1}`}
                              placeholder={`Describe step ${index + 1}`}
                              onChange={(event) =>
                                updateStep(index, event.target.value)
                              }
                            />
                          </div>
                          <button
                            type="button"
                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-500"
                            aria-label={`Remove step ${index + 1}`}
                            disabled={steps.length === 1}
                            onClick={() => removeStep(index)}
                          >
                            <Icon name="trash" size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-1 flex">
                      <Button variant="ghost" size="sm" onClick={addStep}>
                        <Icon name="plus" size={13} />
                        Add step
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-4 py-6 text-center">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-500 ring-1 ring-slate-200">
                      <Icon name="upload" size={17} />
                    </span>
                    <p className="mt-2 text-xs font-semibold text-slate-800">
                      Media attachment{' '}
                      <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                        Optional
                      </span>
                    </p>
                    <p className="mt-1 max-w-md text-[11px] leading-4 text-slate-500">
                      Add an image or PDF to support the instructions. Files are
                      not uploaded in this static preview.
                    </p>
                    <label className="mt-3 inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus-within:ring-2 focus-within:ring-teal-600 focus-within:ring-offset-2">
                      <Icon name="file" size={13} />
                      Choose file
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="sr-only"
                        onChange={handleMediaChange}
                      />
                    </label>
                    {mediaName ? (
                      <span className="mt-2 inline-flex items-center gap-1 text-[10px] text-slate-500">
                        <Icon name="file" size={11} />
                        {mediaName} (not uploaded)
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Schedule
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Set how long the activity should take, how often it
                      repeats, and when it is due.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field
                      label="Estimated duration"
                      htmlFor="activity-duration"
                    >
                      <span className="relative block">
                        <Input
                          id="activity-duration"
                          type="number"
                          min={1}
                          value={duration}
                          onChange={(event) => setDuration(event.target.value)}
                          placeholder="—"
                          className="pr-9"
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500">
                          min
                        </span>
                      </span>
                    </Field>
                    <Field
                      label="Frequency or repetition"
                      htmlFor="activity-frequency"
                    >
                      <Input
                        id="activity-frequency"
                        value={frequency}
                        onChange={(event) => setFrequency(event.target.value)}
                        placeholder="e.g. once daily for two weeks"
                      />
                    </Field>
                    <Field label="Due date" htmlFor="activity-due-date">
                      <Input
                        id="activity-due-date"
                        type="date"
                        value={dueDate}
                        onChange={(event) => setDueDate(event.target.value)}
                      />
                    </Field>
                    <Field
                      label="End date"
                      htmlFor="activity-end-date"
                      optional
                    >
                      <Input
                        id="activity-end-date"
                        type="date"
                        value={endDate}
                        onChange={(event) => setEndDate(event.target.value)}
                      />
                    </Field>
                  </div>
                </div>

                {notice ? <InlineNotice tone="info">{notice}</InlineNotice> : null}
              </div>
            </CardBody>

            <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/60 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
                <Icon name="info" size={13} />
                Visual control only — no activity is created.
              </p>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button variant="ghost" onClick={clearForm}>
                  <Icon name="trash" size={14} />
                  Clear form
                </Button>
                <Button type="submit" variant="primary">
                  <Icon name="check" size={14} />
                  Save activity
                </Button>
              </div>
            </div>
          </form>
        </Card>

        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader
              title="Assigned activities"
              description="Activities you have assigned to eligible patients."
              action={<Badge tone="neutral">No live data</Badge>}
            />
            <CardBody>
              <EmptyState
                compact
                icon="activity"
                title="No activities assigned"
                description="Created activities will appear here when the activities service is connected."
              />
            </CardBody>
            <CardFooter>
              <p className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
                <Icon name="clock" size={13} />
                Completion status is visible only after the mother confirms it.
              </p>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader
              title="Activity controls"
              description="Edit and retract remain available for each assigned activity."
              action={<Badge tone="info">UI preview</Badge>}
            />
            <CardBody>
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      Assigned activity actions
                    </p>
                    <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
                      Actions appear per activity once live data is loaded.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled
                      title="Available when an assigned activity is loaded"
                    >
                      <Icon name="edit" size={12} />
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      disabled
                      title="Available when an assigned activity is loaded"
                    >
                      <Icon name="trash" size={12} />
                      Retract
                    </Button>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Callout tone="warning" title="Completion visibility" icon="clock">
            The specialist sees completion only after the mother confirms it.
            Do not show an activity as complete before that confirmation.
          </Callout>

          <Card>
            <CardHeader title="Activity guidance" />
            <CardBody>
              <div className="grid gap-3">
                <p className="flex gap-2.5 text-xs leading-5 text-slate-600">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                    <Icon name="activity" size={14} />
                  </span>
                  <span>
                    Activities are written instructions with optional media,
                    duration, repetition, and dates.
                  </span>
                </p>
                <p className="flex gap-2.5 text-xs leading-5 text-slate-600">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                    <Icon name="edit" size={14} />
                  </span>
                  <span>
                    Edit or retract an activity after assignment when needed.
                  </span>
                </p>
                <p className="flex gap-2.5 text-xs leading-5 text-slate-600">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                    <Icon name="sparkles" size={14} />
                  </span>
                  <span>
                    This portal does not generate AI activity recommendations.
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
