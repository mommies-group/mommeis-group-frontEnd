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
import { InlineNotice } from '../components/ui/InlineNotice'
import { PageHeader } from '../components/ui/PageHeader'
import { Skeleton } from '../components/ui/Skeleton'
import { useCreateClinicalNote } from '../hooks/mutations/clinical-notes/clinical-notes.mutations'
import { useBookings } from '../hooks/queries/bookings/bookings.queries'
import { useClinicalNotes } from '../hooks/queries/clinical-notes/clinical-notes.queries'
import { usePatients } from '../hooks/queries/patients/patients.queries'
import {
  getApiErrorMessage,
  isAccessError,
} from '../lib/api-error'
import { formatBirthDate, formatDateTime } from '../lib/format'
import { notifyError, notifySuccess } from '../lib/toast'
import { ROUTES, patientRecordPath } from '../router/routes'

export function ClinicalNotesPage() {
  const [searchParams] = useSearchParams()
  const initialChildId = searchParams.get('childId') ?? ''
  const [selectedChildId, setSelectedChildId] = useState(initialChildId)
  const [note, setNote] = useState('')
  const [recommendation, setRecommendation] = useState('')
  const [bookingId, setBookingId] = useState('')

  const patients = usePatients()
  const bookings = useBookings()
  const notes = useClinicalNotes(selectedChildId || null)
  const createNote = useCreateClinicalNote()

  const selectedPatient = patients.data?.find(
    (patient) => patient.id === selectedChildId,
  )
  const accessError = notes.isError && isAccessError(notes.error)
  const hasDraft = note.trim().length > 0

  const appointmentOptions = useMemo(
    () =>
      (bookings.data ?? []).filter(
        (booking) =>
          booking.childId === selectedChildId &&
          (booking.status === 'CONFIRMED' || booking.status === 'COMPLETED'),
      ),
    [bookings.data, selectedChildId],
  )

  const handlePatientChange = (childId: string) => {
    setSelectedChildId(childId)
    setBookingId('')
    setNote('')
    setRecommendation('')
    createNote.reset()
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    createNote.reset()

    if (!selectedChildId) {
      notifyError(null, 'Select a patient.')
      return
    }

    if (!note.trim()) {
      notifyError(null, 'Write a note before saving.')
      return
    }

    createNote.mutate(
      {
        childId: selectedChildId,
        payload: {
          content: note.trim(),
          recommendation: recommendation.trim() || undefined,
          bookingId: bookingId || undefined,
        },
      },
      {
        onSuccess: () => {
          setNote('')
          setRecommendation('')
          setBookingId('')
          notifySuccess('Clinical note saved.')
        },
        onError: (error) => notifyError(error),
      },
    )
  }

  const recordHref = selectedChildId
    ? patientRecordPath(selectedChildId)
    : ROUTES.patients

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Clinical Notes"
        icon="notes"
        actions={
          <Link
            className={buttonStyles({ variant: 'secondary', size: 'sm' })}
            to={recordHref}
          >
            <Icon name="id-card" size={14} />
            Record
          </Link>
        }
      />

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader
            title="New note"
            action={
              createNote.isPending ? (
                <Badge tone="info" dot>
                  Saving
                </Badge>
              ) : null
            }
          />
          <form onSubmit={handleSubmit}>
            <CardBody>
              <div className="grid gap-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Patient" htmlFor="note-patient">
                    <Select
                      id="note-patient"
                      value={selectedChildId}
                      disabled={patients.isLoading || createNote.isPending}
                      onChange={(event) =>
                        handlePatientChange(event.target.value)
                      }
                    >
                      <option value="">Select patient</option>
                      {patients.data?.map((patient) => (
                        <option value={patient.id} key={patient.id}>
                          {patient.firstName} {patient.lastName}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field
                    label="Appointment"
                    htmlFor="note-booking"
                    optional
                  >
                    <Select
                      id="note-booking"
                      value={bookingId}
                      disabled={
                        !selectedChildId ||
                        appointmentOptions.length === 0 ||
                        createNote.isPending
                      }
                      onChange={(event) => setBookingId(event.target.value)}
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

                {patients.isError ? (
                  <ApiErrorNotice
                    error={patients.error}
                    title="Could not load patients"
                    onRetry={() => {
                      void patients.refetch()
                    }}
                  />
                ) : null}

                <Field label="Note" htmlFor="clinical-note">
                  <Textarea
                    id="clinical-note"
                    value={note}
                    disabled={
                      !selectedChildId || Boolean(accessError) || createNote.isPending
                    }
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Session observations and progress"
                    rows={8}
                  />
                </Field>

                <Field
                  label="Recommendation"
                  htmlFor="note-recommendation"
                  optional
                >
                  <Input
                    id="note-recommendation"
                    value={recommendation}
                    disabled={createNote.isPending}
                    onChange={(event) => setRecommendation(event.target.value)}
                    placeholder="Follow-up recommendation"
                  />
                </Field>

                {accessError ? (
                  <InlineNotice tone="warning">
                    {getApiErrorMessage(notes.error)}
                  </InlineNotice>
                ) : null}
              </div>
            </CardBody>
            <div className="flex items-center justify-between gap-2 border-t border-slate-200 bg-slate-50/60 px-5 py-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setNote('')
                  setRecommendation('')
                  setBookingId('')
                  createNote.reset()
                }}
                disabled={!hasDraft || createNote.isPending}
              >
                Clear
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={
                  !selectedChildId ||
                  !note.trim() ||
                  Boolean(accessError) ||
                  createNote.isPending
                }
                aria-busy={createNote.isPending}
              >
                <Icon name="check" size={13} />
                {createNote.isPending ? 'Saving…' : 'Save note'}
              </Button>
            </div>
          </form>
        </Card>

        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader
              title={selectedPatient ? 'Patient' : 'Recent notes'}
              action={
                selectedPatient ? (
                  <Link
                    className={buttonStyles({ variant: 'ghost', size: 'sm' })}
                    to={patientRecordPath(selectedPatient.id)}
                  >
                    Record
                    <Icon name="arrow-right" size={12} />
                  </Link>
                ) : null
              }
            />
            <CardBody flush>
              {selectedPatient ? (
                <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-teal-200 bg-teal-50 text-teal-700">
                    <Icon name="user" size={16} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-900">
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-500">
                      Born {formatBirthDate(selectedPatient.dateOfBirth)} ·{' '}
                      {selectedPatient.parent.fullName}
                    </p>
                  </div>
                </div>
              ) : null}

              {!selectedChildId ? (
                <div className="p-4">
                  <EmptyState
                    compact
                    icon="notes"
                    title="Select a patient"
                  />
                </div>
              ) : notes.isLoading ? (
                <div className="grid gap-2 p-4">
                  <Skeleton className="h-14 w-full rounded-lg" />
                  <Skeleton className="h-14 w-full rounded-lg" />
                </div>
              ) : accessError ? (
                <div className="p-4">
                  <InlineNotice tone="warning">
                    {getApiErrorMessage(notes.error)}
                  </InlineNotice>
                </div>
              ) : notes.isError ? (
                <div className="p-4">
                  <ApiErrorNotice
                    error={notes.error}
                    title="Could not load notes"
                    onRetry={() => {
                      void notes.refetch()
                    }}
                  />
                </div>
              ) : notes.data && notes.data.length > 0 ? (
                <div className="max-h-[420px] divide-y divide-slate-100 overflow-y-auto">
                  {notes.data.map((savedNote) => (
                    <article className="px-4 py-3" key={savedNote.id}>
                      <p className="whitespace-pre-wrap text-[11px] leading-5 text-slate-700">
                        {savedNote.content}
                      </p>
                      {savedNote.recommendation ? (
                        <p className="mt-1.5 rounded-md bg-teal-50 px-2 py-1 text-[10px] text-teal-900">
                          {savedNote.recommendation}
                        </p>
                      ) : null}
                      <p className="mt-1.5 text-[10px] text-slate-500">
                        {formatDateTime(savedNote.createdAt)}
                      </p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="p-4">
                  <EmptyState
                    compact
                    icon="notes"
                    title="No notes"
                    description="Saved notes will appear here."
                  />
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
