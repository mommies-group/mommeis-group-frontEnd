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
import { formatClockTime } from '../lib/format'
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

type DayOption = (typeof DAYS)[number]

type DaySlotsRowProps = {
  item: DayOption
  slots: AvailabilitySlot[]
  editingId: string | null
  deleteId: string | null
  isBusy: boolean
  onEdit: (slot: AvailabilitySlot) => void
  onDelete: (slotId: string) => void
  onRequestDelete: (slotId: string) => void
  onCancelDelete: () => void
  onStatusChange: (slot: AvailabilitySlot, status: AvailabilityStatus) => void
}

const STATUS_LABELS: Record<AvailabilityStatus, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
}

const SLOT_DURATION_MINUTES = 30
const MINUTES_PER_DAY = 24 * 60

function toMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number)
  return hours * 60 + minutes
}

function addMinutes(value: string, deltaMinutes: number): string {
  if (!value) {
    return ''
  }

  const total = toMinutes(value) + deltaMinutes
  if (!Number.isFinite(total) || total < 0 || total >= MINUTES_PER_DAY) {
    return ''
  }

  const hours = Math.floor(total / 60)
  const minutes = total % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

function formatRange(start: string, end: string): string {
  return `${formatClockTime(start)} – ${formatClockTime(end)}`
}

function slotStatus(slot: AvailabilitySlot): AvailabilityStatus {
  return slot.status ?? 'ACTIVE'
}

function DaySlotsRow({
  item,
  slots,
  editingId,
  deleteId,
  isBusy,
  onEdit,
  onDelete,
  onRequestDelete,
  onCancelDelete,
  onStatusChange,
}: DaySlotsRowProps) {
  return (
    <div className="grid gap-2 px-4 py-3 sm:grid-cols-[110px_minmax(0,1fr)] sm:items-start">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-600">
          {item.short}
        </span>
        <span className="text-xs font-semibold text-slate-800">
          {item.label}
        </span>
      </div>

      <div className="min-w-0">
        <div className="flex min-h-9 flex-wrap items-center gap-2">
          {slots.length > 0 ? (
            slots.map((slot) => {
              const currentStatus = slotStatus(slot)
              return (
                <div
                  className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 ${
                    editingId === slot.id
                      ? 'ring-2 ring-teal-400 ring-offset-1'
                      : ''
                  } ${
                    currentStatus === 'ACTIVE'
                      ? 'border-teal-200 bg-teal-50/70'
                      : 'border-slate-300 bg-slate-50'
                  }`}
                  key={slot.id}
                >
                  <span className="text-[11px] font-semibold text-slate-700">
                    {formatRange(slot.startTime, slot.endTime)}
                  </span>
                  <Select
                    aria-label={`Status for ${item.label} ${formatRange(slot.startTime, slot.endTime)}`}
                    value={currentStatus}
                    disabled={isBusy}
                    className="h-7 w-24 text-[11px]"
                    onChange={(event) =>
                      onStatusChange(
                        slot,
                        event.target.value as AvailabilityStatus,
                      )
                    }
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </Select>
                  <button
                    type="button"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-teal-50 hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                    aria-label={`Edit ${item.label} ${formatRange(slot.startTime, slot.endTime)}`}
                    onClick={() => onEdit(slot)}
                  >
                    <Icon name="edit" size={13} />
                  </button>
                  {deleteId === slot.id ? (
                    <span className="flex items-center gap-1">
                      <Button
                        variant="danger"
                        size="sm"
                        disabled={isBusy}
                        onClick={() => onDelete(slot.id)}
                      >
                        Delete
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isBusy}
                        onClick={onCancelDelete}
                      >
                        Cancel
                      </Button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                      aria-label={`Delete ${item.label} ${formatRange(slot.startTime, slot.endTime)}`}
                      onClick={() => onRequestDelete(slot.id)}
                    >
                      <Icon name="trash" size={13} />
                    </button>
                  )}
                </div>
              )
            })
          ) : (
            <span className="text-[11px] text-slate-500">No slots</span>
          )}
        </div>
      </div>
    </div>
  )
}

export function AvailabilityPage() {
  const availability = useAvailability()
  const createSlot = useCreateAvailabilitySlot()
  const updateSlot = useUpdateAvailabilitySlot()
  const deleteSlot = useDeleteAvailabilitySlot()

  const [day, setDay] = useState<DayOfWeek>(1)
  const [start, setStart] = useState('')
  const [status, setStatus] = useState<AvailabilityStatus>('ACTIVE')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editStart, setEditStart] = useState('')
  const [editStatus, setEditStatus] = useState<AvailabilityStatus>('ACTIVE')

  const editingSlot =
    (availability.data ?? []).find((slot) => slot.id === editingId) ?? null
  const isEditing = Boolean(editingSlot)
  const activeDay = editingSlot?.dayOfWeek ?? day
  const activeStart = editingSlot ? editStart : start
  const activeEnd = addMinutes(activeStart, SLOT_DURATION_MINUTES)
  const activeStatus = editingSlot ? editStatus : status
  const isBusy =
    createSlot.isPending || updateSlot.isPending || deleteSlot.isPending

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

  const startEditing = (slot: AvailabilitySlot) => {
    setDeleteId(null)
    createSlot.reset()
    updateSlot.reset()
    setEditingId(slot.id)
    setEditStart(slot.startTime)
    setEditStatus(slotStatus(slot))
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditStart('')
    setEditStatus('ACTIVE')
    updateSlot.reset()
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    createSlot.reset()
    updateSlot.reset()

    if (!activeStart) {
      notifyError(null, 'Choose a start time.')
      return
    }

    if (!activeEnd) {
      notifyError(
        null,
        'Start time must be 11:29 PM or earlier for a 30-minute slot.',
      )
      return
    }

    const overlapsExistingSlot = (availability.data ?? []).some(
      (slot) =>
        slot.id !== editingId &&
        slot.dayOfWeek === activeDay &&
        toMinutes(activeStart) < toMinutes(slot.endTime) &&
        toMinutes(activeEnd) > toMinutes(slot.startTime),
    )

    if (overlapsExistingSlot) {
      notifyError(null, 'This time overlaps an existing slot — edit it instead.')
      return
    }

    if (editingSlot) {
      updateSlot.mutate(
        {
          id: editingSlot.id,
          payload: {
            startTime: activeStart,
            endTime: activeEnd,
            status: activeStatus,
          },
        },
        {
          onSuccess: () => {
            cancelEditing()
            notifySuccess('Availability slot updated.')
          },
          onError: (error) => notifyError(error),
        },
      )
      return
    }

    createSlot.mutate(
      { dayOfWeek: day, startTime: activeStart, endTime: activeEnd, status },
      {
        onSuccess: () => {
          setStart('')
          setStatus('ACTIVE')
          notifySuccess('Availability slot added.')
        },
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
        onSuccess: () => {
          if (editingId === slot.id) {
            setEditStatus(nextStatus)
          }
          notifySuccess('Slot status updated.')
        },
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
        if (editingId === slotId) {
          cancelEditing()
        }
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
              <div className="divide-y divide-slate-200">
                {DAYS.map((item) => (
                  <DaySlotsRow
                    deleteId={deleteId}
                    editingId={editingId}
                    isBusy={isBusy}
                    item={item}
                    key={item.value}
                    onCancelDelete={() => setDeleteId(null)}
                    onDelete={handleDelete}
                    onEdit={startEditing}
                    onRequestDelete={setDeleteId}
                    onStatusChange={handleStatusChange}
                    slots={slotsByDay.get(item.value) ?? []}
                  />
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title={isEditing ? 'Edit slot' : 'Add slot'}
            action={
              <Badge tone={activeStatus === 'ACTIVE' ? 'success' : 'neutral'}>
                {STATUS_LABELS[activeStatus]}
              </Badge>
            }
          />
          <form onSubmit={handleSubmit}>
            <CardBody>
              <div className="grid gap-4">
                {editingSlot ? (
                  <div className="rounded-lg border border-teal-200 bg-teal-50/60 px-3 py-2 text-[11px] text-teal-900">
                    Editing {formatRange(editingSlot.startTime, editingSlot.endTime)}
                  </div>
                ) : null}
                <Field label="Day" htmlFor="availability-day">
                  <Select
                    id="availability-day"
                    value={activeDay}
                    disabled={isEditing || isBusy}
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
                      lang="en-US"
                      value={activeStart}
                      disabled={isBusy}
                      onChange={(event) =>
                        isEditing
                          ? setEditStart(event.target.value)
                          : setStart(event.target.value)
                      }
                    />
                  </Field>
                  <Field label="End" htmlFor="availability-end">
                    <Input
                      id="availability-end"
                      type="time"
                      lang="en-US"
                      value={activeEnd}
                      readOnly
                      disabled
                    />
                  </Field>
                </div>
                {activeStart && activeEnd ? (
                  <p className="-mt-2 text-[11px] font-medium text-slate-500">
                    Selected: {formatRange(activeStart, activeEnd)} (30 min)
                  </p>
                ) : activeStart ? (
                  <p className="-mt-2 text-[11px] font-medium text-rose-600">
                    Start time must be 11:29 PM or earlier for a 30-minute slot.
                  </p>
                ) : (
                  <p className="-mt-2 text-[11px] font-medium text-slate-500">
                    End time is set automatically (+30 min).
                  </p>
                )}
                <Field label="Status" htmlFor="availability-status">
                  <Select
                    id="availability-status"
                    value={activeStatus}
                    disabled={isBusy}
                    onChange={(event) => {
                      const next = event.target.value as AvailabilityStatus
                      if (isEditing) {
                        setEditStatus(next)
                      } else {
                        setStatus(next)
                      }
                    }}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </Select>
                </Field>

                {!isEditing && availability.data && availability.data.length === 0 ? (
                  <EmptyState compact icon="clock" title="No availability yet" />
                ) : null}
              </div>
            </CardBody>
            <div className="flex items-center gap-2 border-t border-slate-300 bg-slate-50/60 px-4 py-3">
              {isEditing ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={cancelEditing}
                  disabled={isBusy}
                >
                  Cancel
                </Button>
              ) : null}
              <Button
                type="submit"
                variant="primary"
                size="sm"
                block={!isEditing}
                disabled={isBusy}
                aria-busy={isBusy}
              >
                <Icon name={isEditing ? 'check' : 'plus'} size={13} />
                {isBusy
                  ? isEditing
                    ? 'Saving…'
                    : 'Adding…'
                  : isEditing
                    ? 'Save changes'
                    : 'Add slot'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
