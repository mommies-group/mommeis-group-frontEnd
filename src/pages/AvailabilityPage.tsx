import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Icon } from '../components/icons/Icon'
import { ApiErrorNotice } from '../components/ui/ApiErrorNotice'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Field, Input, Select } from '../components/ui/Field'
import { PageHeader } from '../components/ui/PageHeader'
import { Skeleton } from '../components/ui/Skeleton'
import {
  useCreateAvailabilitySlot,
  useDeleteAvailabilitySlot,
  useUpdateAvailabilitySlot,
} from '../hooks/mutations/profile/profile.mutations'
import { useAvailability } from '../hooks/queries/profile/profile.queries'
import { notifyError, notifySuccess } from '../lib/toast'
import type {
  AvailabilitySlot,
  AvailabilityStatus,
  DayOfWeek,
} from '../types/profile.types'

const DAYS: Array<{ label: string; short: string; value: DayOfWeek }> = [
  { label: 'Monday', short: 'Mon', value: 1 },
  { label: 'Tuesday', short: 'Tue', value: 2 },
  { label: 'Wednesday', short: 'Wed', value: 3 },
  { label: 'Thursday', short: 'Thu', value: 4 },
  { label: 'Friday', short: 'Fri', value: 5 },
  { label: 'Saturday', short: 'Sat', value: 6 },
  { label: 'Sunday', short: 'Sun', value: 0 },
]

const STATUS_LABELS: Record<AvailabilityStatus, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
}

function toMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number)
  return hours * 60 + minutes
}

function formatRange(start: string, end: string): string {
  return `${start} – ${end}`
}

function slotStatus(slot: AvailabilitySlot): AvailabilityStatus {
  return slot.status ?? 'ACTIVE'
}

export function AvailabilityPage() {
  const availability = useAvailability()
  const createSlot = useCreateAvailabilitySlot()
  const updateSlot = useUpdateAvailabilitySlot()
  const deleteSlot = useDeleteAvailabilitySlot()

  const [day, setDay] = useState<DayOfWeek>(1)
  const [start, setStart] = useState('09:00')
  const [end, setEnd] = useState('17:00')
  const [status, setStatus] = useState<AvailabilityStatus>('ACTIVE')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const slotsByDay = useMemo(() => {
    const grouped = new Map<DayOfWeek, AvailabilitySlot[]>()

    for (const slot of availability.data ?? []) {
      const items = grouped.get(slot.dayOfWeek) ?? []
      items.push(slot)
      grouped.set(slot.dayOfWeek, items)
    }

    for (const items of grouped.values()) {
      items.sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime))
    }

    return grouped
  }, [availability.data])

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    createSlot.reset()

    if (toMinutes(end) <= toMinutes(start)) {
      notifyError(null, 'End time must be after start time.')
      return
    }

    createSlot.mutate(
      { dayOfWeek: day, startTime: start, endTime: end, status },
      {
        onSuccess: () => notifySuccess('Availability slot added.'),
        onError: (error) => notifyError(error),
      },
    )
  }

  const handleStatusChange = (
    slot: AvailabilitySlot,
    nextStatus: AvailabilityStatus,
  ) => {
    updateSlot.mutate(
      { id: slot.id, payload: { status: nextStatus } },
      {
        onSuccess: () => notifySuccess('Slot status updated.'),
        onError: (error) => notifyError(error),
      },
    )
  }

  const handleDelete = (slotId: string) => {
    if (deleteId !== slotId) {
      setDeleteId(slotId)
      return
    }

    deleteSlot.mutate(slotId, {
      onSuccess: () => {
        setDeleteId(null)
        notifySuccess('Availability slot removed.')
      },
      onError: (error) => {
        setDeleteId(null)
        notifyError(error)
      },
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Availability"
        icon="clock"
        actions={
          <Badge tone="brand">
            {(availability.data ?? []).length} weekly slots
          </Badge>
        }
      />

      {availability.isError ? (
        <ApiErrorNotice
          error={availability.error}
          title="Could not load availability"
          onRetry={() => {
            void availability.refetch()
          }}
        />
      ) : null}

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)]">
        <Card>
          <CardHeader
            title="Weekly availability"
            action={
              <div className="flex items-center gap-3 text-[10px] font-medium text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-teal-600" />
                  Active
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-slate-300" />
                  Inactive
                </span>
              </div>
            }
          />
          <CardBody flush>
            {availability.isLoading ? (
              <div className="grid gap-2 p-4">
                {[0, 1, 2, 3, 4].map((item) => (
                  <Skeleton className="h-14 w-full rounded-lg" key={item} />
                ))}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {DAYS.map((item) => {
                  const slots = slotsByDay.get(item.value) ?? []

                  return (
                    <div
                      className="grid gap-2 px-4 py-3 sm:grid-cols-[110px_minmax(0,1fr)] sm:items-start"
                      key={item.value}
                    >
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-600">
                          {item.short}
                        </span>
                        <span className="text-xs font-semibold text-slate-800">
                          {item.label}
                        </span>
                      </div>

                      <div className="flex min-h-9 flex-wrap items-center gap-2">
                        {slots.length > 0 ? (
                          slots.map((slot) => {
                            const currentStatus = slotStatus(slot)
                            return (
                              <div
                                className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 ${
                                  currentStatus === 'ACTIVE'
                                    ? 'border-teal-200 bg-teal-50/70'
                                    : 'border-slate-200 bg-slate-50'
                                }`}
                                key={slot.id}
                              >
                                <span className="text-[11px] font-semibold text-slate-700">
                                  {formatRange(
                                    slot.startTime,
                                    slot.endTime,
                                  )}
                                </span>
                                <Select
                                  aria-label={`Status for ${item.label} ${formatRange(slot.startTime, slot.endTime)}`}
                                  value={currentStatus}
                                  disabled={updateSlot.isPending}
                                  className="h-7 w-24 text-[11px]"
                                  onChange={(event) =>
                                    handleStatusChange(
                                      slot,
                                      event.target
                                        .value as AvailabilityStatus,
                                    )
                                  }
                                >
                                  <option value="ACTIVE">Active</option>
                                  <option value="INACTIVE">Inactive</option>
                                </Select>
                                {deleteId === slot.id ? (
                                  <span className="flex items-center gap-1">
                                    <Button
                                      variant="danger"
                                      size="sm"
                                      disabled={deleteSlot.isPending}
                                      onClick={() => handleDelete(slot.id)}
                                    >
                                      Delete
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      disabled={deleteSlot.isPending}
                                      onClick={() => setDeleteId(null)}
                                    >
                                      Cancel
                                    </Button>
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                                    aria-label={`Delete ${item.label} ${formatRange(slot.startTime, slot.endTime)}`}
                                    onClick={() => setDeleteId(slot.id)}
                                  >
                                    <Icon name="trash" size={13} />
                                  </button>
                                )}
                              </div>
                            )
                          })
                        ) : (
                          <span className="text-[11px] text-slate-500">
                            No slots
                          </span>
                        )}
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
            title="Add slot"
            action={
              <Badge tone={status === 'ACTIVE' ? 'success' : 'neutral'}>
                {STATUS_LABELS[status]}
              </Badge>
            }
          />
          <form onSubmit={handleCreate}>
            <CardBody>
              <div className="grid gap-4">
                <Field label="Day" htmlFor="availability-day">
                  <Select
                    id="availability-day"
                    value={day}
                    disabled={createSlot.isPending}
                    onChange={(event) =>
                      setDay(Number(event.target.value) as DayOfWeek)
                    }
                  >
                    {DAYS.map((item) => (
                      <option value={item.value} key={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </Select>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Start" htmlFor="availability-start">
                    <Input
                      id="availability-start"
                      type="time"
                      value={start}
                      disabled={createSlot.isPending}
                      onChange={(event) => setStart(event.target.value)}
                    />
                  </Field>
                  <Field label="End" htmlFor="availability-end">
                    <Input
                      id="availability-end"
                      type="time"
                      value={end}
                      disabled={createSlot.isPending}
                      onChange={(event) => setEnd(event.target.value)}
                    />
                  </Field>
                </div>
                <Field label="Status" htmlFor="availability-status">
                  <Select
                    id="availability-status"
                    value={status}
                    disabled={createSlot.isPending}
                    onChange={(event) =>
                      setStatus(event.target.value as AvailabilityStatus)
                    }
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </Select>
                </Field>

                {availability.data && availability.data.length === 0 ? (
                  <EmptyState
                    compact
                    icon="clock"
                    title="No availability yet"
                  />
                ) : null}
              </div>
            </CardBody>
            <div className="border-t border-slate-200 bg-slate-50/60 px-4 py-3">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                block
                disabled={createSlot.isPending}
                aria-busy={createSlot.isPending}
              >
                <Icon name="plus" size={13} />
                {createSlot.isPending ? 'Adding…' : 'Add slot'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
