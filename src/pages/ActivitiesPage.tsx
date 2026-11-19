import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Icon } from '../components/icons/Icon'
import { ApiErrorNotice } from '../components/ui/ApiErrorNotice'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { buttonStyles } from '../components/ui/buttonStyles'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Field, Input, Select, Textarea } from '../components/ui/Field'
import { InlineNotice } from '../components/ui/InlineNotice'
import { PageHeader } from '../components/ui/PageHeader'
import { Skeleton } from '../components/ui/Skeleton'
import {
  useCreateActivity,
  useRetractActivity,
  useUpdateActivity,
} from '../hooks/mutations/activities/activities.mutations'
import { useActivities } from '../hooks/queries/activities/activities.queries'
import { usePatients } from '../hooks/queries/patients/patients.queries'
import { getApiErrorMessage } from '../lib/api-error'
import {
  formatDate,
  toDateInputValue,
  toDueDateIso,
} from '../lib/format'
import type { Activity } from '../types/activity.types'
import { ROUTES } from '../router/routes'

type EditForm = {
  title: string
  instructions: string
  mediaReference: string
  duration: string
  frequency: string
  dueDate: string
}

const emptyEditForm: EditForm = {
  title: '',
  instructions: '',
  mediaReference: '',
  duration: '',
  frequency: '',
  dueDate: '',
}

export function ActivitiesPage() {
  const [searchParams] = useSearchParams()
  const initialChildId = searchParams.get('childId') ?? ''
  const [patientId, setPatientId] = useState(initialChildId)

  useEffect(() => {
    const childId = searchParams.get('childId')
    if (childId) {
      setPatientId(childId)
    }
  }, [searchParams])
  const [title, setTitle] = useState('')
  const [steps, setSteps] = useState<string[]>([''])
  const [mediaReference, setMediaReference] = useState('')
  const [duration, setDuration] = useState('')
  const [frequency, setFrequency] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [notice, setNotice] = useState('')
  const [formError, setFormError] = useState('')

  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [editForm, setEditForm] = useState<EditForm>(emptyEditForm)
  const [editNotice, setEditNotice] = useState('')
  const [editError, setEditError] = useState('')
  const [retractingId, setRetractingId] = useState<string | null>(null)

  const patients = usePatients()
  const activities = useActivities()
  const createActivity = useCreateActivity()
  const updateActivity = useUpdateActivity()
  const retractActivity = useRetractActivity()

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

  const clearForm = () => {
    setPatientId('')
    setTitle('')
    setSteps([''])
    setMediaReference('')
    setDuration('')
    setFrequency('')
    setDueDate('')
    setNotice('')
    setFormError('')
    createActivity.reset()
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setNotice('')
    setFormError('')
    createActivity.reset()

    const instructions = steps
      .map((step) => step.trim())
      .filter(Boolean)
      .join('\n')
    const durationMinutes = Number(duration)

    if (!patientId) {
      setFormError('Choose an eligible patient for this activity.')
      return
    }

    if (!title.trim() || !instructions) {
      setFormError('Add an activity title and at least one instruction step.')
      return
    }

    if (!Number.isInteger(durationMinutes) || durationMinutes < 1) {
      setFormError('Enter an estimated duration of at least 1 minute.')
      return
    }

    if (!frequency.trim()) {
      setFormError('Describe how often the family should complete the activity.')
      return
    }

    createActivity.mutate(
      {
        childId: patientId,
        payload: {
          title: title.trim(),
          instructions,
          mediaReference: mediaReference.trim() || null,
          durationMinutes,
          frequency: frequency.trim(),
          dueDate: toDueDateIso(dueDate),
        },
      },
      {
        onSuccess: () => {
          setTitle('')
          setSteps([''])
          setMediaReference('')
          setDuration('')
          setFrequency('')
          setDueDate('')
          setNotice('Activity created and assigned to the selected patient.')
        },
      },
    )
  }

  const startEditing = (activity: Activity) => {
    setEditingActivity(activity)
    setEditForm({
      title: activity.title,
      instructions: activity.instructions,
      mediaReference: activity.mediaReference ?? '',
      duration: String(activity.durationMinutes),
      frequency: activity.frequency,
      dueDate: toDateInputValue(activity.dueDate),
    })
    setEditNotice('')
    setEditError('')
    updateActivity.reset()
    document
      .getElementById('edit-activity-card')
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const handleUpdate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setEditNotice('')
    setEditError('')
    updateActivity.reset()

    if (!editingActivity) {
      return
    }

    const durationMinutes = Number(editForm.duration)

    if (
      !editForm.title.trim() ||
      !editForm.instructions.trim() ||
      !editForm.frequency.trim() ||
      !Number.isInteger(durationMinutes) ||
      durationMinutes < 1
    ) {
      setEditError(
        'Title, instructions, duration, and frequency are required.',
      )
      return
    }

    updateActivity.mutate(
      {
        id: editingActivity.id,
        payload: {
          title: editForm.title.trim(),
          instructions: editForm.instructions.trim(),
          mediaReference: editForm.mediaReference.trim() || null,
          durationMinutes,
          frequency: editForm.frequency.trim(),
          dueDate: toDueDateIso(editForm.dueDate),
        },
      },
      {
        onSuccess: () => {
          setEditingActivity(null)
          setEditForm(emptyEditForm)
          setNotice('Activity updated.')
        },
      },
    )
  }

  const handleRetract = (activityId: string) => {
    if (retractingId !== activityId) {
      setRetractingId(activityId)
      return
    }

    setNotice('')
    setEditError('')
    retractActivity.mutate(activityId, {
      onSuccess: () => {
        setRetractingId(null)
        if (editingActivity?.id === activityId) {
          setEditingActivity(null)
          setEditForm(emptyEditForm)
        }
        setNotice('Activity retracted. It is no longer shown in the active list.')
      },
    })
  }

  const updateEditField = (field: keyof EditForm, value: string) => {
    setEditForm((current) => ({ ...current, [field]: value }))
    setEditError('')
    updateActivity.reset()
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Care plans"
        title="Activities"
        description="Create a personalised therapeutic activity for an eligible patient. Completion becomes visible only after the mother confirms it."
        actions={
          <Link
            className={buttonStyles({ variant: 'secondary' })}
            to={ROUTES.patients}
          >
            <Icon name="users" size={15} />
            View patients
          </Link>
        }
      />

      {notice ? <InlineNotice tone="success">{notice}</InlineNotice> : null}

      {retractActivity.isError ? (
        <InlineNotice tone="danger">
          {getApiErrorMessage(retractActivity.error)}
        </InlineNotice>
      ) : null}

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.9fr)]">
        <Card>
          <CardHeader
            title="Create an activity"
            description="Write clear, step-by-step instructions for the family."
            action={
              createActivity.isPending ? (
                <Badge tone="info" dot>
                  Saving
                </Badge>
              ) : null
            }
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
                    hint={
                      patients.data
                        ? `${patients.data.length} eligible ${
                            patients.data.length === 1 ? 'patient' : 'patients'
                          } available.`
                        : 'Loading eligible patients.'
                    }
                  >
                    <Select
                      id="activity-patient"
                      value={patientId}
                      disabled={patients.isLoading || createActivity.isPending}
                      onChange={(event) => setPatientId(event.target.value)}
                    >
                      <option value="">Select an eligible patient</option>
                      {patients.data?.map((patient) => (
                        <option value={patient.id} key={patient.id}>
                          {patient.firstName} {patient.lastName}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  {patients.isError ? (
                    <ApiErrorNotice
                      error={patients.error}
                      title="Could not load patients"
                      onRetry={() => {
                        void patients.refetch()
                      }}
                    />
                  ) : null}
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
                      disabled={createActivity.isPending}
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
                              disabled={createActivity.isPending}
                              onChange={(event) =>
                                updateStep(index, event.target.value)
                              }
                            />
                          </div>
                          <button
                            type="button"
                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-500"
                            aria-label={`Remove step ${index + 1}`}
                            disabled={steps.length === 1 || createActivity.isPending}
                            onClick={() => removeStep(index)}
                          >
                            <Icon name="trash" size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-1 flex">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={addStep}
                        disabled={createActivity.isPending}
                      >
                        <Icon name="plus" size={13} />
                        Add step
                      </Button>
                    </div>
                  </div>

                  <Field
                    label="Media reference"
                    htmlFor="activity-media"
                    optional
                    hint="Enter a filename or URL reference. The API does not expose a file-upload endpoint."
                  >
                    <Input
                      id="activity-media"
                      value={mediaReference}
                      disabled={createActivity.isPending}
                      onChange={(event) => setMediaReference(event.target.value)}
                      placeholder="e.g. emotion-cards.pdf"
                    />
                  </Field>
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
                          disabled={createActivity.isPending}
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
                        disabled={createActivity.isPending}
                        onChange={(event) => setFrequency(event.target.value)}
                        placeholder="e.g. once daily for two weeks"
                      />
                    </Field>
                    <Field label="Due date" htmlFor="activity-due-date" optional>
                      <Input
                        id="activity-due-date"
                        type="date"
                        value={dueDate}
                        disabled={createActivity.isPending}
                        onChange={(event) => setDueDate(event.target.value)}
                      />
                    </Field>
                  </div>
                </div>

                {formError ? (
                  <InlineNotice tone="warning">{formError}</InlineNotice>
                ) : null}

                {createActivity.isError ? (
                  <InlineNotice tone="danger">
                    {getApiErrorMessage(createActivity.error)}
                  </InlineNotice>
                ) : null}
              </div>
            </CardBody>

            <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/60 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
                <Icon name="clock" size={13} />
                Completion is recorded only after the mother confirms it.
              </p>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={clearForm}
                  disabled={createActivity.isPending}
                >
                  <Icon name="trash" size={14} />
                  Clear form
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={createActivity.isPending}
                  aria-busy={createActivity.isPending}
                >
                  {createActivity.isPending ? (
                    <>
                      <span
                        className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"
                        aria-hidden="true"
                      />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Icon name="check" size={14} />
                      Save activity
                    </>
                  )}
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
              action={
                activities.data ? (
                  <Badge tone="neutral">
                    {activities.data.length} total
                  </Badge>
                ) : null
              }
            />
            <CardBody>
              {activities.isLoading ? (
                <div className="grid gap-2">
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                </div>
              ) : activities.isError ? (
                <ApiErrorNotice
                  error={activities.error}
                  title="Could not load activities"
                  onRetry={() => {
                    void activities.refetch()
                  }}
                />
              ) : activities.data && activities.data.length > 0 ? (
                <div className="grid gap-3">
                  {activities.data.map((activity) => (
                    <article
                      className="rounded-xl border border-slate-200 bg-slate-50/50 p-3"
                      key={activity.id}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900">
                            {activity.title}
                          </p>
                          <p className="mt-0.5 text-[10px] text-slate-500">
                            {activity.child
                              ? `${activity.child.firstName} ${activity.child.lastName}`
                              : 'Patient activity'}
                          </p>
                        </div>
                        <Badge tone={activity.completed ? 'success' : 'warning'}>
                          {activity.completed
                            ? 'Parent confirmed'
                            : 'Awaiting confirmation'}
                        </Badge>
                      </div>
                      <p className="mt-2 line-clamp-2 whitespace-pre-wrap text-[11px] leading-4 text-slate-600">
                        {activity.instructions}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500">
                        <span>{activity.durationMinutes} min</span>
                        <span>{activity.frequency}</span>
                        <span>Due {formatDate(activity.dueDate)}</span>
                        {activity.mediaReference ? (
                          <span className="truncate">
                            Media: {activity.mediaReference}
                          </span>
                        ) : null}
                      </div>

                      {retractingId === activity.id ? (
                        <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-2.5">
                          <p className="text-[10px] leading-4 text-rose-900">
                            Retracting removes this activity from the active
                            list. Confirm to continue.
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Button
                              variant="danger"
                              size="sm"
                              disabled={retractActivity.isPending}
                              onClick={() => handleRetract(activity.id)}
                            >
                              <Icon name="trash" size={12} />
                              Confirm retract
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={retractActivity.isPending}
                              onClick={() => setRetractingId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => startEditing(activity)}
                          >
                            <Icon name="edit" size={12} />
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setRetractingId(activity.id)}
                          >
                            <Icon name="trash" size={12} />
                            Retract
                          </Button>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState
                  compact
                  icon="activity"
                  title="No activities assigned"
                  description="Activities you create for eligible patients will appear here."
                />
              )}
            </CardBody>
          </Card>

          <Card>
            <div id="edit-activity-card">
              <CardHeader
                title="Edit activity"
                description="Update an assigned activity or retract it from the list."
                action={
                  editingActivity ? (
                    <Badge tone="info">Editing</Badge>
                  ) : (
                    <Badge tone="neutral">No activity selected</Badge>
                  )
                }
              />
              <CardBody>
                {editingActivity ? (
                  <form className="grid gap-4" onSubmit={handleUpdate}>
                    <Field label="Activity title" htmlFor="edit-activity-title">
                      <Input
                        id="edit-activity-title"
                        value={editForm.title}
                        disabled={updateActivity.isPending}
                        onChange={(event) =>
                          updateEditField('title', event.target.value)
                        }
                      />
                    </Field>
                    <Field
                      label="Instructions"
                      htmlFor="edit-activity-instructions"
                      hint="One instruction per line is preserved in the note view."
                    >
                      <Textarea
                        id="edit-activity-instructions"
                        value={editForm.instructions}
                        disabled={updateActivity.isPending}
                        onChange={(event) =>
                          updateEditField('instructions', event.target.value)
                        }
                        rows={4}
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field
                        label="Duration"
                        htmlFor="edit-activity-duration"
                      >
                        <Input
                          id="edit-activity-duration"
                          type="number"
                          min={1}
                          value={editForm.duration}
                          disabled={updateActivity.isPending}
                          onChange={(event) =>
                            updateEditField('duration', event.target.value)
                          }
                        />
                      </Field>
                      <Field
                        label="Frequency"
                        htmlFor="edit-activity-frequency"
                      >
                        <Input
                          id="edit-activity-frequency"
                          value={editForm.frequency}
                          disabled={updateActivity.isPending}
                          onChange={(event) =>
                            updateEditField('frequency', event.target.value)
                          }
                        />
                      </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field
                        label="Due date"
                        htmlFor="edit-activity-due"
                        optional
                      >
                        <Input
                          id="edit-activity-due"
                          type="date"
                          value={editForm.dueDate}
                          disabled={updateActivity.isPending}
                          onChange={(event) =>
                            updateEditField('dueDate', event.target.value)
                          }
                        />
                      </Field>
                      <Field
                        label="Media reference"
                        htmlFor="edit-activity-media"
                        optional
                      >
                        <Input
                          id="edit-activity-media"
                          value={editForm.mediaReference}
                          disabled={updateActivity.isPending}
                          onChange={(event) =>
                            updateEditField('mediaReference', event.target.value)
                          }
                        />
                      </Field>
                    </div>

                    {editNotice ? (
                      <InlineNotice tone="success">{editNotice}</InlineNotice>
                    ) : null}

                    {editError ? (
                      <InlineNotice tone="warning">{editError}</InlineNotice>
                    ) : null}

                    {updateActivity.isError ? (
                      <InlineNotice tone="danger">
                        {getApiErrorMessage(updateActivity.error)}
                      </InlineNotice>
                    ) : null}

                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        variant="ghost"
                        disabled={updateActivity.isPending}
                        onClick={() => {
                          setEditingActivity(null)
                          setEditForm(emptyEditForm)
                          setEditError('')
                          updateActivity.reset()
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={updateActivity.isPending}
                        aria-busy={updateActivity.isPending}
                      >
                        {updateActivity.isPending ? (
                          <>
                            <span
                              className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"
                              aria-hidden="true"
                            />
                            Saving…
                          </>
                        ) : (
                          <>
                            <Icon name="check" size={14} />
                            Save changes
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                    <p className="text-xs font-semibold text-slate-800">
                      Select an activity to edit
                    </p>
                    <p className="mt-1 text-[11px] leading-4 text-slate-500">
                      Use the Edit button on an assigned activity. Completion is
                      never changed from this portal.
                    </p>
                  </div>
                )}
              </CardBody>
            </div>
          </Card>

        </div>
      </div>
    </div>
  )
}
