import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Icon } from '../components/icons/Icon'
import { ApiErrorNotice } from '../components/ui/ApiErrorNotice'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Field, Input, Select, Textarea } from '../components/ui/Field'
import { PageHeader } from '../components/ui/PageHeader'
import { Pagination } from '../components/ui/Pagination'
import { Skeleton } from '../components/ui/Skeleton'
import {
  useCreateCustomActivity,
  useDeactivateCustomActivity,
  useUpdateCustomActivity,
} from '../hooks/mutations/activities/activity-catalog.mutations'
import { useCatalogActivities } from '../hooks/queries/activities/activity-catalog.queries'
import { usePagination } from '../hooks/use-pagination'
import { notifyError, notifySuccess } from '../lib/toast'
import type {
  CatalogActivity,
  CatalogActivitySourceFilter,
  CreateCustomActivityRequest,
} from '../types/activity-catalog.types'

const CATEGORY_OPTIONS = [
  'GENERAL',
  'SOCIAL_EMOTIONAL',
  'COGNITIVE',
  'LANGUAGE',
  'MOTOR',
  'FINE_MOTOR',
  'SENSORY',
  'BEHAVIORAL',
  'BEHAVIOR',
  'SELF_CARE',
  'WELLBEING',
]

const DIFFICULTY_OPTIONS = ['EASY', 'MEDIUM', 'HARD']

const SOURCE_OPTIONS: Array<{
  value: CatalogActivitySourceFilter
  label: string
}> = [
  { value: 'all', label: 'All activities' },
  { value: 'global', label: 'Global library' },
  { value: 'custom', label: 'My activities' },
]

type CustomForm = {
  title: string
  description: string
  instructions: string
  category: string
  developmentalArea: string
  minAge: string
  maxAge: string
  durationMinutes: string
  difficultyLevel: string
  materials: string
}

const emptyForm: CustomForm = {
  title: '',
  description: '',
  instructions: '',
  category: 'GENERAL',
  developmentalArea: '',
  minAge: '',
  maxAge: '',
  durationMinutes: '',
  difficultyLevel: 'EASY',
  materials: '',
}

function categoryLabel(value: string | null) {
  if (!value) {
    return 'General'
  }
  return value.replaceAll('_', ' ').toLowerCase().replace(/^./, (letter) => letter.toUpperCase())
}

function ageLabel(minAge: number | null, maxAge: number | null) {
  if (minAge === null && maxAge === null) {
    return 'All ages'
  }
  if (minAge !== null && maxAge !== null) {
    return `${minAge}–${maxAge} months`
  }
  if (minAge !== null) {
    return `${minAge}+ months`
  }
  return `Up to ${maxAge} months`
}

export function ActivitiesPage() {
  const [source, setSource] = useState<CatalogActivitySourceFilter>('all')
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState<CustomForm>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null)

  const activities = useCatalogActivities({
    source,
    category: category || undefined,
    search: search.trim() || undefined,
  })
  const createActivity = useCreateCustomActivity()
  const updateActivity = useUpdateCustomActivity()
  const deactivateActivity = useDeactivateCustomActivity()

  const editingActivity = useMemo(
    () => (activities.data ?? []).find((item) => item.id === editingId) ?? null,
    [activities.data, editingId],
  )

  const activitiesList = activities.data ?? []
  const pager = usePagination(
    activitiesList,
    5,
    `${source}:${category}:${search.trim()}`,
  )

  const isBusy =
    createActivity.isPending || updateActivity.isPending || deactivateActivity.isPending

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
    createActivity.reset()
    updateActivity.reset()
  }

  const startEditing = (activity: CatalogActivity) => {
    setDeactivatingId(null)
    setEditingId(activity.id)
    setForm({
      title: activity.title,
      description: activity.description ?? '',
      instructions: activity.instructions,
      category: activity.category ?? 'GENERAL',
      developmentalArea: activity.developmentalArea ?? '',
      minAge: activity.minAge === null ? '' : String(activity.minAge),
      maxAge: activity.maxAge === null ? '' : String(activity.maxAge),
      durationMinutes: String(activity.durationMinutes),
      difficultyLevel: activity.difficultyLevel ?? 'EASY',
      materials: activity.materials ?? '',
    })
  }

  const updateField = (field: keyof CustomForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
    createActivity.reset()
    updateActivity.reset()
  }

  const buildPayload = (): CreateCustomActivityRequest | null => {
    const durationMinutes = Number(form.durationMinutes)
    const minAge = form.minAge.trim() ? Number(form.minAge) : null
    const maxAge = form.maxAge.trim() ? Number(form.maxAge) : null

    if (!form.title.trim() || !form.instructions.trim()) {
      notifyError(null, 'Add a title and instructions.')
      return null
    }

    if (!Number.isInteger(durationMinutes) || durationMinutes < 1) {
      notifyError(null, 'Enter a duration of at least 1 minute.')
      return null
    }

    if (
      (minAge !== null && !Number.isInteger(minAge)) ||
      (maxAge !== null && !Number.isInteger(maxAge)) ||
      (minAge !== null && minAge < 0) ||
      (maxAge !== null && maxAge < 0) ||
      (minAge !== null && maxAge !== null && minAge > maxAge)
    ) {
      notifyError(null, 'Check the age range.')
      return null
    }

    return {
      title: form.title.trim(),
      description: form.description.trim() || null,
      instructions: form.instructions.trim(),
      category: form.category,
      developmentalArea: form.developmentalArea.trim() || null,
      minAge,
      maxAge,
      durationMinutes,
      difficultyLevel: form.difficultyLevel,
      materials: form.materials.trim() || null,
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const payload = buildPayload()
    if (!payload) {
      return
    }

    if (editingId) {
      updateActivity.mutate(
        { id: editingId, payload },
        {
          onSuccess: () => {
            resetForm()
            notifySuccess('Custom activity updated.')
          },
          onError: (error) => notifyError(error),
        },
      )
      return
    }

    createActivity.mutate(payload, {
      onSuccess: () => {
        resetForm()
        notifySuccess('Custom activity created.')
      },
      onError: (error) => notifyError(error),
    })
  }

  const handleDeactivate = (id: string) => {
    if (deactivatingId !== id) {
      setDeactivatingId(id)
      return
    }

    deactivateActivity.mutate(id, {
      onSuccess: () => {
        setDeactivatingId(null)
        if (editingId === id) {
          resetForm()
        }
        notifySuccess('Custom activity deactivated.')
      },
      onError: (error) => {
        setDeactivatingId(null)
        notifyError(error)
      },
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Activity library"
        icon="activity"
        actions={
          <Badge tone="neutral">{activities.data?.length ?? 0} activities</Badge>
        }
      />

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader
            title="Catalog"
            action={
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  aria-label="Filter activities by source"
                  className="h-8 w-32 text-xs"
                  onChange={(event) =>
                    setSource(event.target.value as CatalogActivitySourceFilter)
                  }
                  value={source}
                >
                  {SOURCE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                <Select
                  aria-label="Filter activities by category"
                  className="h-8 w-32 text-xs"
                  onChange={(event) => setCategory(event.target.value)}
                  value={category}
                >
                  <option value="">All categories</option>
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {categoryLabel(option)}
                    </option>
                  ))}
                </Select>
                <Input
                  aria-label="Search activities"
                  className="h-8 w-40 text-xs"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search"
                  value={search}
                />
              </div>
            }
          />
          <CardBody flush>
            {activities.isLoading ? (
              <div className="grid gap-2 p-4">
                <Skeleton className="h-24 w-full rounded-xl" />
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
            ) : activitiesList.length > 0 ? (
              <div className="divide-y divide-slate-200">
                {pager.visibleItems.map((activity) => (
                  <article className="p-4" key={activity.id}>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-xs font-semibold text-slate-900">
                            {activity.title}
                          </p>
                          <Badge
                            tone={activity.isGlobal ? 'info' : 'success'}
                          >
                            {activity.source === 'GLOBAL' ? 'Global' : 'Custom'}
                          </Badge>
                          {!activity.isActive ? (
                            <Badge tone="neutral">Inactive</Badge>
                          ) : null}
                        </div>
                        <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-slate-600">
                          {activity.description ?? activity.instructions}
                        </p>
                      </div>
                      {!activity.isGlobal && activity.isActive ? (
                        <div className="flex items-center gap-1">
                          <button
                            aria-label={`Edit ${activity.title}`}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-teal-50 hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                            onClick={() => startEditing(activity)}
                            type="button"
                          >
                            <Icon name="edit" size={13} />
                          </button>
                          {deactivatingId === activity.id ? (
                            <>
                              <Button
                                disabled={isBusy}
                                onClick={() => handleDeactivate(activity.id)}
                                size="sm"
                                variant="danger"
                              >
                                Confirm
                              </Button>
                              <Button
                                disabled={isBusy}
                                onClick={() => setDeactivatingId(null)}
                                size="sm"
                                variant="ghost"
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <button
                              aria-label={`Deactivate ${activity.title}`}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                              onClick={() => setDeactivatingId(activity.id)}
                              type="button"
                            >
                              <Icon name="trash" size={13} />
                            </button>
                          )}
                        </div>
                      ) : null}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500">
                      <span>{categoryLabel(activity.category)}</span>
                      {activity.developmentalArea ? (
                        <span>{activity.developmentalArea}</span>
                      ) : null}
                      <span>{ageLabel(activity.minAge, activity.maxAge)}</span>
                      <span>{activity.durationMinutes} min</span>
                      {activity.difficultyLevel ? (
                        <span>{activity.difficultyLevel.toLowerCase()}</span>
                      ) : null}
                      {activity.materials ? <span>{activity.materials}</span> : null}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="p-4">
                <EmptyState
                  compact
                  icon="activity"
                  title="No activities"
                  description="Try a different source, category, or search term."
                />
              </div>
            )}
          </CardBody>
          <Pagination
            label="Activities"
            onPageChange={pager.setPage}
            page={pager.page}
            rangeEnd={pager.rangeEnd}
            rangeStart={pager.rangeStart}
            total={pager.total}
            totalPages={pager.totalPages}
          />
        </Card>

        <Card>
          <CardHeader
            title={editingActivity ? 'Edit custom activity' : 'Create custom activity'}
            action={
              <Badge tone={editingActivity ? 'info' : 'neutral'}>
                {editingActivity ? 'Editing' : 'New'}
              </Badge>
            }
          />
          <form onSubmit={handleSubmit}>
            <CardBody>
              <div className="grid gap-4">
                <Field label="Title" htmlFor="catalog-title">
                  <Input
                    disabled={isBusy}
                    id="catalog-title"
                    onChange={(event) => updateField('title', event.target.value)}
                    placeholder="Activity title"
                    value={form.title}
                  />
                </Field>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Category" htmlFor="catalog-category">
                    <Select
                      disabled={isBusy}
                      id="catalog-category"
                      onChange={(event) =>
                        updateField('category', event.target.value)
                      }
                      value={form.category}
                    >
                      {CATEGORY_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {categoryLabel(option)}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field
                    label="Developmental area"
                    htmlFor="catalog-area"
                    optional
                  >
                    <Input
                      disabled={isBusy}
                      id="catalog-area"
                      onChange={(event) =>
                        updateField('developmentalArea', event.target.value)
                      }
                      placeholder="Fine Motor Coordination"
                      value={form.developmentalArea}
                    />
                  </Field>
                  <Field label="Min age (months)" htmlFor="catalog-min-age" optional>
                    <Input
                      disabled={isBusy}
                      id="catalog-min-age"
                      min={0}
                      onChange={(event) =>
                        updateField('minAge', event.target.value)
                      }
                      placeholder="36"
                      type="number"
                      value={form.minAge}
                    />
                  </Field>
                  <Field label="Max age (months)" htmlFor="catalog-max-age" optional>
                    <Input
                      disabled={isBusy}
                      id="catalog-max-age"
                      min={0}
                      onChange={(event) =>
                        updateField('maxAge', event.target.value)
                      }
                      placeholder="84"
                      type="number"
                      value={form.maxAge}
                    />
                  </Field>
                  <Field label="Duration" htmlFor="catalog-duration">
                    <span className="relative block">
                      <Input
                        className="pr-9"
                        disabled={isBusy}
                        id="catalog-duration"
                        min={1}
                        onChange={(event) =>
                          updateField('durationMinutes', event.target.value)
                        }
                        placeholder="15"
                        type="number"
                        value={form.durationMinutes}
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500">
                        min
                      </span>
                    </span>
                  </Field>
                  <Field label="Difficulty" htmlFor="catalog-difficulty">
                    <Select
                      disabled={isBusy}
                      id="catalog-difficulty"
                      onChange={(event) =>
                        updateField('difficultyLevel', event.target.value)
                      }
                      value={form.difficultyLevel}
                    >
                      {DIFFICULTY_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option.toLowerCase()}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>

                <Field label="Instructions" htmlFor="catalog-instructions">
                  <Textarea
                    disabled={isBusy}
                    id="catalog-instructions"
                    onChange={(event) =>
                      updateField('instructions', event.target.value)
                    }
                    placeholder="Step-by-step instructions"
                    rows={4}
                    value={form.instructions}
                  />
                </Field>

                <Field label="Description" htmlFor="catalog-description" optional>
                  <Textarea
                    disabled={isBusy}
                    id="catalog-description"
                    onChange={(event) =>
                      updateField('description', event.target.value)
                    }
                    placeholder="Short summary"
                    rows={2}
                    value={form.description}
                  />
                </Field>

                <Field label="Materials" htmlFor="catalog-materials" optional>
                  <Input
                    disabled={isBusy}
                    id="catalog-materials"
                    onChange={(event) =>
                      updateField('materials', event.target.value)
                    }
                    placeholder="Large beads and cord"
                    value={form.materials}
                  />
                </Field>
              </div>
            </CardBody>
            <div className="flex items-center gap-2 border-t border-slate-300 bg-slate-50/60 px-5 py-3">
              {editingActivity ? (
                <Button
                  disabled={isBusy}
                  onClick={resetForm}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  Cancel
                </Button>
              ) : (
                <Button
                  disabled={isBusy}
                  onClick={resetForm}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  Clear
                </Button>
              )}
              <Button
                aria-busy={isBusy}
                block
                disabled={isBusy}
                size="sm"
                type="submit"
                variant="primary"
              >
                <Icon name="check" size={13} />
                {isBusy
                  ? 'Saving…'
                  : editingActivity
                    ? 'Save changes'
                    : 'Create activity'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
