import { useMemo, useState } from 'react'
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
import { PageHeader } from '../components/ui/PageHeader'
import { Skeleton } from '../components/ui/Skeleton'
import {
  useCreateActivity,
  useRetractActivity,
  useUpdateActivity,
} from '../hooks/mutations/activities/activities.mutations'
import { useActivities } from '../hooks/queries/activities/activities.queries'
import { usePatients } from '../hooks/queries/patients/patients.queries'
import { formatDate, toDueDateIso } from '../lib/format'
import { notifyError, notifySuccess } from '../lib/toast'
import type {
  Activity,
  ActivityCategory,
  ActivityStatus,
} from '../types/activity.types'
import { getActivityStatus } from '../types/activity.types'
import { ROUTES } from '../router/routes'

const CATEGORY_OPTIONS: Array<{ value: ActivityCategory; label: string }> = [
  { value: 'SOCIAL_EMOTIONAL', label: 'Social & emotional' },
  { value: 'COGNITIVE', label: 'Cognitive' },
  { value: 'LANGUAGE', label: 'Language' },
  { value: 'MOTOR', label: 'Motor skills' },
  { value: 'SENSORY', label: 'Sensory' },
  { value: 'BEHAVIORAL', label: 'Behavioral' },
  { value: 'SELF_CARE', label: 'Self care' },
]

const STATUS_LABELS: Record<ActivityStatus, string> = {
  ASSIGNED: 'Assigned',
  COMPLETED: 'Completed',
  RETRACTED: 'Retracted',
}

const STATUS_TONES: Record<ActivityStatus, 'neutral' | 'success' | 'danger'> = {
  ASSIGNED: 'neutral',
  COMPLETED: 'success',
  RETRACTED: 'danger',
}

const EDITABLE_STATUSES: ActivityStatus[] = ['ASSIGNED', 'COMPLETED']

function categoryLabel(category: Activity['category']) {
  return (
    CATEGORY_OPTIONS.find((option) => option.value === category)?.label ??
    (category ? String(category).replaceAll('_', ' ').toLowerCase() : 'General')
  )
}

export function ActivitiesPage() {
  const [searchParams] = useSearchParams()
  const initialChildId = searchParams.get('childId') ?? ''
  const [patientId, setPatientId] = useState(initialChildId)
  const [title, setTitle] = useState('')
  const [instructions, setInstructions] = useState('')
  const [category, setCategory] =
    useState<ActivityCategory>('SOCIAL_EMOTIONAL')
  const [mediaReference, setMediaReference] = useState('')
  const [duration, setDuration] = useState('')
  const [frequency, setFrequency] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | ActivityStatus>('ALL')
  const [statusDraft, setStatusDraft] = useState<Record<string, ActivityStatus>>(
    {},
  )
  const [retractingId, setRetractingId] = useState<string | null>(null)

  const patients = usePatients()
  const activities = useActivities()
  const createActivity = useCreateActivity()
  const updateActivity = useUpdateActivity()
  const retractActivity = useRetractActivity()

  const filteredActivities = useMemo(() => {
    const items = activities.data ?? []
    if (statusFilter === 'ALL') {
      return items
    }
    return items.filter(
      (activity) => getActivityStatus(activity) === statusFilter,
    )
  }, [activities.data, statusFilter])

  const resetForm = () => {
    setPatientId('')
    setTitle('')
    setInstructions('')
    setCategory('SOCIAL_EMOTIONAL')
    setMediaReference('')
    setDuration('')
    setFrequency('')
    setDueDate('')
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    createActivity.reset()

    const durationMinutes = Number(duration)

    if (!patientId) {
      notifyError(null, 'Choose a patient.')
      return
    }

    if (!title.trim() || !instructions.trim()) {
      notifyError(null, 'Add a title and instructions.')
      return
    }

    if (!Number.isInteger(durationMinutes) || durationMinutes < 1) {
      notifyError(null, 'Enter a duration of at least 1 minute.')
      return
    }

    if (!frequency.trim()) {
      notifyError(null, 'Add a frequency.')
      return
    }

    createActivity.mutate(
      {
        childId: patientId,
        payload: {
          title: title.trim(),
          instructions: instructions.trim(),
          category,
          mediaReference: mediaReference.trim() || null,
          durationMinutes,
          frequency: frequency.trim(),
          dueDate: toDueDateIso(dueDate),
          status: 'ASSIGNED',
          source: 'SPECIALIST',
        },
      },
      {
        onSuccess: () => {
          resetForm()
          notifySuccess('Activity assigned.')
        },
        onError: (error) => notifyError(error),
      },
    )
  }

  const handleStatusUpdate = (activity: Activity) => {
    const nextStatus =
      statusDraft[activity.id] ?? getActivityStatus(activity)

    updateActivity.mutate(
      { id: activity.id, payload: { status: nextStatus } },
      {
        onSuccess: () => {
          setStatusDraft((current) => {
            const next = { ...current }
            delete next[activity.id]
            return next
          })
          notifySuccess('Activity status updated.')
        },
        onError: (error) => notifyError(error),
      },
    )
  }

  const handleRetract = (activityId: string) => {
    if (retractingId !== activityId) {
      setRetractingId(activityId)
      return
    }

    retractActivity.mutate(activityId, {
      onSuccess: () => {
        setRetractingId(null)
        notifySuccess('Activity retracted.')
      },
      onError: (error) => {
        setRetractingId(null)
        notifyError(error)
      },
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Activities"
        icon="activity"
        actions={
          <Link
            className={buttonStyles({ variant: 'secondary', size: 'sm' })}
            to={ROUTES.patients}
          >
            <Icon name="users" size={14} />
            Patients
          </Link>
        }
      />

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader
            title="Create activity"
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
              <div className="grid gap-4">
                <Field label="Patient" htmlFor="activity-patient">
                  <Select
                    id="activity-patient"
                    value={patientId}
                    disabled={patients.isLoading || createActivity.isPending}
                    onChange={(event) => setPatientId(event.target.value)}
                  >
                    <option value="">Select patient</option>
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

                <Field label="Title" htmlFor="activity-title">
                  <Input
                    id="activity-title"
                    value={title}
                    disabled={createActivity.isPending}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Activity title"
                  />
                </Field>

                <Field label="Instructions" htmlFor="activity-instructions">
                  <Textarea
                    id="activity-instructions"
                    value={instructions}
                    disabled={createActivity.isPending}
                    onChange={(event) => setInstructions(event.target.value)}
                    placeholder="Step-by-step instructions for the family"
                    rows={4}
                  />
                </Field>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Category" htmlFor="activity-category">
                    <Select
                      id="activity-category"
                      value={category}
                      disabled={createActivity.isPending}
                      onChange={(event) =>
                        setCategory(event.target.value as ActivityCategory)
                      }
                    >
                      {CATEGORY_OPTIONS.map((option) => (
                        <option value={option.value} key={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Duration" htmlFor="activity-duration">
                    <span className="relative block">
                      <Input
                        id="activity-duration"
                        type="number"
                        min={1}
                        value={duration}
                        disabled={createActivity.isPending}
                        onChange={(event) => setDuration(event.target.value)}
                        placeholder="15"
                        className="pr-9"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500">
                        min
                      </span>
                    </span>
                  </Field>
                  <Field label="Frequency" htmlFor="activity-frequency">
                    <Input
                      id="activity-frequency"
                      value={frequency}
                      disabled={createActivity.isPending}
                      onChange={(event) => setFrequency(event.target.value)}
                      placeholder="3 times per week"
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

                <Field
                  label="Media reference"
                  htmlFor="activity-media"
                  optional
                >
                  <Input
                    id="activity-media"
                    value={mediaReference}
                    disabled={createActivity.isPending}
                    onChange={(event) => setMediaReference(event.target.value)}
                    placeholder="emotion-cards.pdf"
                  />
                </Field>
              </div>
            </CardBody>
            <div className="flex items-center justify-between gap-2 border-t border-slate-200 bg-slate-50/60 px-5 py-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={resetForm}
                disabled={createActivity.isPending}
              >
                Clear
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={createActivity.isPending}
                aria-busy={createActivity.isPending}
              >
                <Icon name="check" size={13} />
                {createActivity.isPending ? 'Saving…' : 'Assign activity'}
              </Button>
            </div>
          </form>
        </Card>

        <Card>
          <CardHeader
            title="Assigned activities"
            action={
              <div className="flex items-center gap-2">
                <Badge tone="neutral">
                  {filteredActivities.length} total
                </Badge>
                <Select
                  aria-label="Filter activities by status"
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as 'ALL' | ActivityStatus)
                  }
                  className="h-8 w-32 text-xs"
                >
                  <option value="ALL">All statuses</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="RETRACTED">Retracted</option>
                </Select>
              </div>
            }
          />
          <CardBody flush>
            {activities.isLoading ? (
              <div className="grid gap-2 p-4">
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            ) : activities.isError ? (
              <div className="p-4">
                <ApiErrorNotice
                  error={activities.error}
                  title="Could not load activities"
                  onRetry={() => {
                    void activities.refetch()
                  }}
                />
              </div>
            ) : filteredActivities.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {filteredActivities.map((activity) => {
                  const currentStatus = getActivityStatus(activity)
                  const draftStatus =
                    statusDraft[activity.id] ?? currentStatus
                  const dirty = draftStatus !== currentStatus

                  return (
                    <article className="p-4" key={activity.id}>
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
                        <Badge tone={STATUS_TONES[currentStatus]}>
                          {STATUS_LABELS[currentStatus]}
                        </Badge>
                      </div>
                      <p className="mt-2 line-clamp-2 whitespace-pre-wrap text-[11px] leading-4 text-slate-600">
                        {activity.instructions}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500">
                        <span className="capitalize">
                          {categoryLabel(activity.category)}
                        </span>
                        <span>{activity.durationMinutes} min</span>
                        <span>{activity.frequency}</span>
                        <span>Due {formatDate(activity.dueDate)}</span>
                        {activity.mediaReference ? (
                          <span className="truncate">
                            {activity.mediaReference}
                          </span>
                        ) : null}
                      </div>

                      {retractingId === activity.id ? (
                        <div className="mt-2.5 flex flex-wrap items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2">
                          <span className="text-[10px] text-rose-900">
                            Retract this activity?
                          </span>
                          <Button
                            variant="danger"
                            size="sm"
                            disabled={retractActivity.isPending}
                            onClick={() => handleRetract(activity.id)}
                          >
                            Confirm
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
                      ) : (
                        <div className="mt-2.5 flex flex-wrap items-end gap-2">
                          <Select
                            aria-label={`Status for ${activity.title}`}
                            value={draftStatus}
                            className="h-8 w-32 text-xs"
                            onChange={(event) =>
                              setStatusDraft((current) => ({
                                ...current,
                                [activity.id]: event.target
                                  .value as ActivityStatus,
                              }))
                            }
                          >
                            {EDITABLE_STATUSES.map((status) => (
                              <option value={status} key={status}>
                                {STATUS_LABELS[status]}
                              </option>
                            ))}
                          </Select>
                          {dirty ? (
                            <Button
                              variant="primary"
                              size="sm"
                              disabled={updateActivity.isPending}
                              onClick={() => handleStatusUpdate(activity)}
                            >
                              Save
                            </Button>
                          ) : null}
                          <Button
                            variant="danger"
                            size="sm"
                            className="ml-auto"
                            onClick={() => setRetractingId(activity.id)}
                          >
                            <Icon name="trash" size={12} />
                            Retract
                          </Button>
                        </div>
                      )}
                    </article>
                  )
                })}
              </div>
            ) : (
              <div className="p-4">
                <EmptyState
                  compact
                  icon="activity"
                  title="No activities"
                  description={
                    statusFilter === 'ALL'
                      ? 'Assigned activities will appear here.'
                      : 'No activities with this status.'
                  }
                />
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
