import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Icon } from '../icons/Icon'
import { ApiErrorNotice } from '../ui/ApiErrorNotice'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Field, Input, Select, Textarea } from '../ui/Field'
import { Spinner } from '../ui/Spinner'
import { useDeleteClinicalNote, useUpdateClinicalNote } from '../../hooks/mutations/clinical-notes/clinical-notes.mutations'
import { useCatalogActivities } from '../../hooks/queries/activities/activity-catalog.queries'
import { useBookings } from '../../hooks/queries/bookings/bookings.queries'
import { useClinicalNote } from '../../hooks/queries/clinical-notes/clinical-notes.queries'
import { formatScheduledDateTime } from '../../lib/format'
import { notifyError, notifySuccess } from '../../lib/toast'

type ClinicalNoteEditModalProps = {
  noteId: string | null
  open: boolean
  onClose: () => void
  onChanged?: () => void
  startInDeleteConfirm?: boolean
}

type ActivityOption = {
  id: string
  title: string
  durationMinutes: number
  isRemoved: boolean
}

export function ClinicalNoteEditModal({
  noteId,
  open,
  onClose,
  onChanged,
  startInDeleteConfirm = false,
}: ClinicalNoteEditModalProps) {
  const note = useClinicalNote(open ? noteId : null)
  const activities = useCatalogActivities()
  const bookings = useBookings()
  const updateNote = useUpdateClinicalNote()
  const deleteNote = useDeleteClinicalNote()

  const [content, setContent] = useState('')
  const [recommendation, setRecommendation] = useState('')
  const [selectedBookingId, setSelectedBookingId] = useState('')
  const [selectedActivityIds, setSelectedActivityIds] = useState<string[]>([])
  const [specialistNotes, setSpecialistNotes] = useState<
    Record<string, string>
  >({})
  const [confirmingDelete, setConfirmingDelete] = useState(
    startInDeleteConfirm,
  )
  const initializedFor = useRef<string | null>(null)
  const initialActivityIds = useRef<string[]>([])

  useEffect(() => {
    if (!open || !note.data || initializedFor.current === note.data.id) {
      return
    }

    initializedFor.current = note.data.id
    const snapshots = note.data.activities ?? []
    initialActivityIds.current = snapshots.map((snapshot) => snapshot.activityId)
    setContent(note.data.content)
    setRecommendation(note.data.recommendation ?? '')
    setSelectedBookingId(note.data.booking?.id ?? note.data.bookingId ?? '')
    setSelectedActivityIds(initialActivityIds.current)
    setSpecialistNotes(
      snapshots.reduce<Record<string, string>>((result, snapshot) => {
        if (snapshot.specialistNotes) {
          result[snapshot.activityId] = snapshot.specialistNotes
        }
        return result
      }, {}),
    )
  }, [open, note.data])

  useEffect(() => {
    if (!open) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return
      }
      if (confirmingDelete) {
        setConfirmingDelete(false)
      } else {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [confirmingDelete, onClose, open])

  const activityOptions = useMemo<ActivityOption[]>(() => {
    const catalog = (activities.data ?? []).filter((activity) => activity.isActive)
    const snapshots = note.data?.activities ?? []
    const extra = snapshots
      .filter((snapshot) => !catalog.some((activity) => activity.id === snapshot.activityId))
      .map((snapshot) => ({
        id: snapshot.activityId,
        title: snapshot.title ?? snapshot.activityId,
        durationMinutes: snapshot.durationMinutes ?? 0,
        isRemoved: Boolean(snapshot.isRemoved),
      }))

    return [
      ...catalog.map((activity) => ({
        id: activity.id,
        title: activity.title,
        durationMinutes: activity.durationMinutes,
        isRemoved: false,
      })),
      ...extra,
    ]
  }, [activities.data, note.data])

  const appointmentOptions = useMemo(() => {
    const childId = note.data?.childId
    return (bookings.data ?? []).filter(
      (booking) =>
        booking.childId === childId &&
        (booking.status === 'CONFIRMED' || booking.status === 'COMPLETED'),
    )
  }, [bookings.data, note.data?.childId])

  if (!open || !noteId) {
    return null
  }

  const isSaving = updateNote.isPending || deleteNote.isPending

  const toggleActivity = (id: string) => {
    setSelectedActivityIds((current) =>
      current.includes(id)
        ? current.filter((activityId) => activityId !== id)
        : [...current, id],
    )
  }

  const finish = (message: string) => {
    setContent('')
    setRecommendation('')
    setSelectedBookingId('')
    setSelectedActivityIds([])
    setSpecialistNotes({})
    setConfirmingDelete(false)
    initializedFor.current = null
    initialActivityIds.current = []
    notifySuccess(message)
    onChanged?.()
    onClose()
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    updateNote.reset()

    if (!content.trim()) {
      notifyError(null, 'Write a note before saving.')
      return
    }

    const notesForActivities = selectedActivityIds.reduce<
      Record<string, string>
    >((result, id) => {
      const activityNote = specialistNotes[id]?.trim()
      if (activityNote) {
        result[id] = activityNote
      }
      return result
    }, {})

    const addActivityIds = selectedActivityIds.filter(
      (id) => !initialActivityIds.current.includes(id),
    )
    const removeActivityIds = initialActivityIds.current.filter(
      (id) => !selectedActivityIds.includes(id),
    )

    updateNote.mutate(
      {
        noteId,
        payload: {
          content: content.trim(),
          recommendation: recommendation.trim() || undefined,
          bookingId: selectedBookingId || undefined,
          addActivityIds: addActivityIds.length ? addActivityIds : undefined,
          removeActivityIds: removeActivityIds.length
            ? removeActivityIds
            : undefined,
          specialistNotes: Object.keys(notesForActivities).length
            ? notesForActivities
            : undefined,
        },
      },
      {
        onSuccess: () => finish('Clinical note updated.'),
        onError: (error) => notifyError(error),
      },
    )
  }

  const handleDelete = () => {
    deleteNote.reset()
    deleteNote.mutate(
      { noteId },
      {
        onSuccess: () => finish('Clinical note deleted.'),
        onError: (error) => notifyError(error),
      },
    )
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
      />
      <div
        aria-labelledby="clinical-note-edit-title"
        aria-modal="true"
        className="relative z-10 flex max-h-[88vh] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-slate-300 bg-white shadow-2xl"
        role="dialog"
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-300 px-5 py-3.5">
          <h2
            className="truncate text-base font-semibold text-slate-900"
            id="clinical-note-edit-title"
          >
            {confirmingDelete ? 'Delete clinical note' : 'Edit clinical note'}
          </h2>
          <button
            aria-label="Close note editor"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            onClick={confirmingDelete ? () => setConfirmingDelete(false) : onClose}
            type="button"
          >
            <Icon name="close" size={15} />
          </button>
        </div>

        {note.isLoading ? (
          <div className="px-5 py-6">
            <Spinner label="Loading note…" />
          </div>
        ) : note.isError ? (
          <div className="px-5 py-4">
            <ApiErrorNotice
              error={note.error}
              title="Could not load this note"
              onRetry={() => {
                void note.refetch()
              }}
            />
          </div>
        ) : note.data ? (
          confirmingDelete ? (
            <div className="px-5 py-5">
              <p className="text-sm text-slate-700">
                Delete this note? This will hide it from the child’s record.
              </p>
              <p className="mt-2 line-clamp-3 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                {note.data.content}
              </p>
              <div className="mt-5 flex justify-end gap-2">
                <Button
                  disabled={isSaving}
                  onClick={() => setConfirmingDelete(false)}
                  size="sm"
                  type="button"
                  variant="secondary"
                >
                  Cancel
                </Button>
                <Button
                  aria-busy={deleteNote.isPending}
                  disabled={isSaving}
                  onClick={handleDelete}
                  size="sm"
                  type="button"
                  variant="danger"
                >
                  <Icon name="trash" size={13} />
                  {deleteNote.isPending ? 'Deleting…' : 'Delete note'}
                </Button>
              </div>
            </div>
          ) : (
            <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    label="Appointment"
                    htmlFor="note-edit-booking"
                    optional
                  >
                    <Select
                      id="note-edit-booking"
                      value={selectedBookingId}
                      disabled={appointmentOptions.length === 0 || isSaving}
                      onChange={(event) => setSelectedBookingId(event.target.value)}
                    >
                      <option value="">No appointment</option>
                      {appointmentOptions.map((booking) => (
                        <option value={booking.id} key={booking.id}>
                          {formatScheduledDateTime(booking.scheduledAt)}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>

                <div className="rounded-xl border border-slate-300 bg-slate-50/60 p-3">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Activities
                  </p>
                  <div className="space-y-2">
                    {activityOptions.map((activity) => {
                      const selected = selectedActivityIds.includes(activity.id)
                      return (
                        <div
                          className="rounded-lg border border-slate-300 bg-white p-2"
                          key={activity.id}
                        >
                          <label className="flex cursor-pointer items-start gap-2">
                            <input
                              aria-label={`Select ${activity.title}`}
                              checked={selected}
                              className="mt-0.5 h-3.5 w-3.5 accent-teal-600"
                              disabled={isSaving}
                              onChange={() => toggleActivity(activity.id)}
                              type="checkbox"
                            />
                            <span className="min-w-0">
                              <span className="block truncate text-xs font-semibold text-slate-900">
                                {activity.title}
                              </span>
                              <span className="block text-[12px] text-slate-500">
                                {activity.durationMinutes} min
                              </span>
                            </span>
                            {activity.isRemoved ? (
                              <Badge tone="neutral">Removed</Badge>
                            ) : null}
                          </label>
                          {selected ? (
                            <Input
                              aria-label={`Note for ${activity.title}`}
                              className="mt-2 h-8 text-xs"
                              disabled={isSaving}
                              onChange={(event) =>
                                setSpecialistNotes((current) => ({
                                  ...current,
                                  [activity.id]: event.target.value,
                                }))
                              }
                              placeholder="Specialist note for this activity"
                              value={specialistNotes[activity.id] ?? ''}
                            />
                          ) : null}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <Field label="Note" htmlFor="note-edit-content">
                  <Textarea
                    id="note-edit-content"
                    value={content}
                    disabled={isSaving}
                    onChange={(event) => setContent(event.target.value)}
                    placeholder="Session observations and progress"
                    rows={6}
                  />
                </Field>

                <Field
                  label="Recommendation"
                  htmlFor="note-edit-recommendation"
                  optional
                >
                  <Input
                    id="note-edit-recommendation"
                    value={recommendation}
                    disabled={isSaving}
                    onChange={(event) => setRecommendation(event.target.value)}
                    placeholder="Follow-up recommendation"
                  />
                </Field>
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-slate-300 bg-slate-50/60 px-5 py-3">
                <Button
                  disabled={isSaving}
                  onClick={() => setConfirmingDelete(true)}
                  size="sm"
                  type="button"
                  variant="danger"
                >
                  <Icon name="trash" size={13} />
                  Delete note
                </Button>
                <div className="flex gap-2">
                  <Button
                    disabled={isSaving}
                    onClick={onClose}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    Cancel
                  </Button>
                  <Button
                    aria-busy={updateNote.isPending}
                    disabled={!content.trim() || isSaving}
                    size="sm"
                    type="submit"
                    variant="primary"
                  >
                    <Icon name="check" size={13} />
                    {updateNote.isPending ? 'Saving…' : 'Save changes'}
                  </Button>
                </div>
              </div>
            </form>
          )
        ) : null}
      </div>
    </div>
  )
}
