import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Icon } from '../icons/Icon'
import { Button } from '../ui/Button'
import { EmptyState } from '../ui/EmptyState'
import { Field, Input, Select, Textarea } from '../ui/Field'
import { useCompleteBooking } from '../../hooks/mutations/bookings/bookings.mutations'
import { useCreateClinicalNote } from '../../hooks/mutations/clinical-notes/clinical-notes.mutations'
import { useActivities } from '../../hooks/queries/activities/activities.queries'
import { useBookings } from '../../hooks/queries/bookings/bookings.queries'
import { useClinicalNotes } from '../../hooks/queries/clinical-notes/clinical-notes.queries'
import { usePatients } from '../../hooks/queries/patients/patients.queries'
import { formatDateTime } from '../../lib/format'
import { notifyError, notifySuccess } from '../../lib/toast'

type ClinicalNoteModalProps = {
  open: boolean
  childId: string
  bookingId?: string | null
  completeBookingId?: string | null
  onClose: () => void
  onCompleted?: () => void
}

export function ClinicalNoteModal({
  open,
  childId,
  bookingId,
  completeBookingId,
  onClose,
  onCompleted,
}: ClinicalNoteModalProps) {
  const patients = usePatients()
  const bookings = useBookings()
  const activities = useActivities()
  const notes = useClinicalNotes(open ? childId : null)
  const createNote = useCreateClinicalNote()
  const completeBooking = useCompleteBooking()

  const [note, setNote] = useState('')
  const [recommendation, setRecommendation] = useState('')
  const [selectedBookingId, setSelectedBookingId] = useState(bookingId ?? '')
  const [activityId, setActivityId] = useState('')

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
    () => (activities.data ?? []).filter((activity) => activity.childId === childId),
    [activities.data, childId],
  )

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

  const finish = (message: string) => {
    setNote('')
    setRecommendation('')
    setSelectedBookingId('')
    setActivityId('')
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

    const payload = {
      content: note.trim(),
      recommendation: recommendation.trim() || undefined,
      bookingId: selectedBookingId || undefined,
    }

    if (completeBookingId) {
      createNote.mutate(
        { childId, payload },
        {
          onSuccess: () => {
            completeBooking.mutate(
              { id: completeBookingId, payload: { note: note.trim() } },
              {
                onSuccess: () =>
                  finish('Clinical note saved and booking completed.'),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        aria-labelledby="clinical-note-modal-title"
        aria-modal="true"
        className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
        role="dialog"
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-3.5">
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
              <Field label="Activity" htmlFor="note-modal-activity" optional>
                <Select
                  id="note-modal-activity"
                  value={activityId}
                  disabled={isSaving}
                  onChange={(event) => setActivityId(event.target.value)}
                >
                  <option value="">No activity</option>
                  {activityOptions.map((activity) => (
                    <option value={activity.id} key={activity.id}>
                      {activity.title}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <p className="text-[10px] text-slate-500">
              Activity selection is preview only until the backend endpoint is
              connected.
            </p>

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

            <div className="border-t border-slate-100 pt-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Saved notes
              </p>
              {notes.isLoading ? (
                <p className="text-[11px] text-slate-500">Loading notes…</p>
              ) : (notes.data ?? []).length > 0 ? (
                <div className="max-h-40 divide-y divide-slate-100 overflow-y-auto">
                  {notes.data?.map((savedNote) => (
                    <article className="py-2" key={savedNote.id}>
                      <p className="whitespace-pre-wrap text-[11px] leading-5 text-slate-700">
                        {savedNote.content}
                      </p>
                      {savedNote.recommendation ? (
                        <p className="mt-1 rounded-md bg-teal-50 px-2 py-1 text-[10px] text-teal-900">
                          {savedNote.recommendation}
                        </p>
                      ) : null}
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
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-slate-200 bg-slate-50/60 px-5 py-3">
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
  )
}
