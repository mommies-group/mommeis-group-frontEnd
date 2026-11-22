import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Icon } from '../icons/Icon'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { EmptyState } from '../ui/EmptyState'
import { Field, Input, Select, Textarea } from '../ui/Field'
import { Pagination } from '../ui/Pagination'
import { Spinner } from '../ui/Spinner'
import { ClinicalNoteEditModal } from './ClinicalNoteEditModal'
import { useCompleteBooking } from '../../hooks/mutations/bookings/bookings.mutations'
import { useCreateClinicalNote } from '../../hooks/mutations/clinical-notes/clinical-notes.mutations'
import { useCatalogActivities } from '../../hooks/queries/activities/activity-catalog.queries'
import { useBookings } from '../../hooks/queries/bookings/bookings.queries'
import { useClinicalNotes } from '../../hooks/queries/clinical-notes/clinical-notes.queries'
import { usePatients } from '../../hooks/queries/patients/patients.queries'
import { usePagination } from '../../hooks/use-pagination'
import { formatDateTime } from '../../lib/format'
import { notifyError, notifySuccess } from '../../lib/toast'

type ClinicalNoteModalProps = {
  open: boolean
  childId: string
  bookingId?: string | null
  completeBookingId?: string | null
  onClose: () => void
  onCompleted?: () => void
  onCreatePlan?: () => void
}

export function ClinicalNoteModal({
  open,
  childId,
  bookingId,
  completeBookingId,
  onClose,
  onCompleted,
  onCreatePlan,
}: ClinicalNoteModalProps) {
  const patients = usePatients()
  const bookings = useBookings()
  const activities = useCatalogActivities()
  const notes = useClinicalNotes(open ? childId : null)
  const createNote = useCreateClinicalNote()
  const completeBooking = useCompleteBooking()

  const [note, setNote] = useState('')
  const [recommendation, setRecommendation] = useState('')
  const [selectedBookingId, setSelectedBookingId] = useState(bookingId ?? '')
  const [selectedActivityIds, setSelectedActivityIds] = useState<string[]>([])
  const [specialistNotes, setSpecialistNotes] = useState<
    Record<string, string>
  >({})
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [deleteMode, setDeleteMode] = useState(false)
  const [completedPlanIntent, setCompletedPlanIntent] = useState<{
    childId: string
    bookingId: string
  } | null>(null)

  const selectedPatient = patients.data?.find((patient) => patient.id === childId)
  const isSaving = createNote.isPending || completeBooking.isPending

  const appointmentOptions = useMemo(
    () =>
      (bookings.data ?? []).filter(
        (booking) =>
          booking.childId === childId &&
          (booking.status === 'CONFIRMED' || booking.status === 'COMPLETED'),
      ),
    [bookings.data, childId],
  )

  const activityOptions = useMemo(
    () => (activities.data ?? []).filter((activity) => activity.isActive),
    [activities.data],
  )
  const savedNotes = notes.data ?? []
  const activityPager = usePagination(activityOptions, 5, childId)
  const notesPager = usePagination(savedNotes, 5, childId)

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

  const toggleActivity = (id: string) => {
    setSelectedActivityIds((current) =>
      current.includes(id)
        ? current.filter((activityId) => activityId !== id)
        : [...current, id],
    )
  }

  const resetForm = () => {
    setNote('')
    setRecommendation('')
    setSelectedBookingId('')
    setSelectedActivityIds([])
    setSpecialistNotes({})
  }

  const finish = (message: string) => {
    resetForm()
    notifySuccess(message)
    onCompleted?.()
    onClose()
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    createNote.reset()
    completeBooking.reset()

    if (!childId) {
      notifyError(null, 'Select a patient.')
      return
    }

    if (!note.trim()) {
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

    const payload = {
      content: note.trim(),
      recommendation: recommendation.trim() || undefined,
      bookingId: selectedBookingId || undefined,
      activityIds: selectedActivityIds.length ? selectedActivityIds : undefined,
      specialistNotes: Object.keys(notesForActivities).length
        ? notesForActivities
        : undefined,
    }

    if (completeBookingId) {
      createNote.mutate(
        { childId, payload },
        {
          onSuccess: () => {
            completeBooking.mutate(
              { id: completeBookingId, payload: { note: note.trim() } },
              {
                onSuccess: () => {
                  resetForm()
                  setCompletedPlanIntent({
                    childId,
                    bookingId: completeBookingId,
                  })
                  notifySuccess('Clinical note saved and booking completed.')
                  onCompleted?.()
                },
                onError: (error) => notifyError(error),
              },
            )
          },
          onError: (error) => notifyError(error),
        },
      )
      return
    }

    createNote.mutate(
      { childId, payload },
      {
        onSuccess: () => finish('Clinical note saved.'),
        onError: (error) => notifyError(error),
      },
    )
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        aria-labelledby="clinical-note-modal-title"
        aria-modal="true"
        className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-slate-300 bg-white shadow-2xl"
        role="dialog"
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-300 px-5 py-3.5">
          <div className="min-w-0">
            <h2
              className="truncate text-sm font-semibold text-slate-900"
              id="clinical-note-modal-title"
            >
              {completeBookingId ? 'Complete session & add note' : 'Clinical notes'}
            </h2>
            {selectedPatient ? (
              <p className="mt-0.5 truncate text-[11px] text-slate-500">
                {selectedPatient.firstName} {selectedPatient.lastName} ·{' '}
                {selectedPatient.parent.fullName}
              </p>
            ) : null}
          </div>
          <button
            aria-label="Close notes"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            onClick={onClose}
            type="button"
          >
            <Icon name="close" size={15} />
          </button>
        </div>

        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
            {completedPlanIntent ? (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50/70 p-3">
                <p className="text-[11px] leading-5 text-emerald-900">
                  Booking completed. You can now create a treatment plan for
                  this child.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onCreatePlan}
                >
                  <Icon name="plus" size={13} />
                  Create treatment plan
                </Button>
              </div>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Appointment" htmlFor="note-modal-booking" optional>
                <Select
                  id="note-modal-booking"
                  value={selectedBookingId}
                  disabled={
                    Boolean(completeBookingId) ||
                    appointmentOptions.length === 0 ||
                    isSaving
                  }
                  onChange={(event) => setSelectedBookingId(event.target.value)}
                >
                  <option value="">No appointment</option>
                  {appointmentOptions.map((booking) => (
                    <option value={booking.id} key={booking.id}>
                      {formatDateTime(booking.scheduledAt)}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="rounded-xl border border-slate-300 bg-slate-50/60 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Activities
                </p>
                <Badge tone={selectedActivityIds.length ? 'info' : 'neutral'}>
                  {selectedActivityIds.length} selected
                </Badge>
              </div>
              {activities.isLoading ? (
                <Spinner className="py-4" label="Loading activities…" />
              ) : activityOptions.length ? (
                <div className="space-y-2">
                  {activityPager.visibleItems.map((activity) => {
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
                            <span className="block truncate text-[11px] font-semibold text-slate-900">
                              {activity.title}
                            </span>
                            <span className="block text-[10px] text-slate-500">
                              {activity.durationMinutes} min ·{' '}
                              {activity.source === 'GLOBAL'
                                ? 'Global'
                                : 'Custom'}
                            </span>
                          </span>
                        </label>
                        {selected ? (
                          <Input
                            aria-label={`Note for ${activity.title}`}
                            className="mt-2 h-8 text-[11px]"
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
              ) : (
                <p className="text-[11px] text-slate-500">
                  No active activities available.
                </p>
              )}
              <Pagination
                compact
                label="Modal activities"
                onPageChange={activityPager.setPage}
                page={activityPager.page}
                rangeEnd={activityPager.rangeEnd}
                rangeStart={activityPager.rangeStart}
                total={activityPager.total}
                totalPages={activityPager.totalPages}
              />
            </div>

            <Field label="Note" htmlFor="note-modal-content">
              <Textarea
                id="note-modal-content"
                value={note}
                disabled={isSaving}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Session observations and progress"
                rows={6}
              />
            </Field>

            <Field
              label="Recommendation"
              htmlFor="note-modal-recommendation"
              optional
            >
              <Input
                id="note-modal-recommendation"
                value={recommendation}
                disabled={isSaving}
                onChange={(event) => setRecommendation(event.target.value)}
                placeholder="Follow-up recommendation"
              />
            </Field>

            <div className="border-t border-slate-200 pt-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Saved notes
              </p>
              {notes.isLoading ? (
                <Spinner className="py-4" label="Loading notes…" />
              ) : savedNotes.length > 0 ? (
                <div className="divide-y divide-slate-200">
                  {notesPager.visibleItems.map((savedNote) => (
                    <article className="py-2" key={savedNote.id}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                            Notes
                          </p>
                          <p className="mt-0.5 whitespace-pre-wrap text-[11px] leading-5 text-slate-700">
                            {savedNote.content}
                          </p>
                          {savedNote.recommendation ? (
                            <>
                              <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                Instructions
                              </p>
                              <p className="mt-0.5 rounded-md bg-teal-50 px-2 py-1 text-[10px] text-teal-900">
                                {savedNote.recommendation}
                              </p>
                            </>
                          ) : null}
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <button
                            aria-label={`Edit note from ${formatDateTime(savedNote.createdAt)}`}
                            className="inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-500 transition hover:bg-teal-50 hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                            onClick={() => {
                              setDeleteMode(false)
                              setEditingNoteId(savedNote.id)
                            }}
                            type="button"
                          >
                            <Icon name="edit" size={12} />
                          </button>
                          <button
                            aria-label={`Delete note from ${formatDateTime(savedNote.createdAt)}`}
                            className="inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                            onClick={() => {
                              setDeleteMode(true)
                              setEditingNoteId(savedNote.id)
                            }}
                            type="button"
                          >
                            <Icon name="trash" size={12} />
                          </button>
                        </div>
                      </div>
                      <p className="mt-1 text-[10px] text-slate-500">
                        {formatDateTime(savedNote.createdAt)}
                      </p>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState
                  compact
                  icon="notes"
                  title="No notes"
                  description="Saved notes will appear here."
                />
              )}
              <Pagination
                compact
                label="Saved notes"
                onPageChange={notesPager.setPage}
                page={notesPager.page}
                rangeEnd={notesPager.rangeEnd}
                rangeStart={notesPager.rangeStart}
                total={notesPager.total}
                totalPages={notesPager.totalPages}
              />
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
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!note.trim() || isSaving}
              aria-busy={isSaving}
            >
              <Icon name="check" size={13} />
              {isSaving
                ? 'Saving…'
                : completeBookingId
                  ? 'Save note & complete'
                  : 'Save note'}
            </Button>
          </div>
        </form>
      </div>
      </div>

      <ClinicalNoteEditModal
        key={`${editingNoteId}-${deleteMode}`}
        noteId={editingNoteId}
        open={Boolean(editingNoteId)}
        startInDeleteConfirm={deleteMode}
        onClose={() => {
          setEditingNoteId(null)
          setDeleteMode(false)
        }}
        onChanged={() => {
          void notes.refetch()
          onCompleted?.()
        }}
      />
    </>
  )
}
