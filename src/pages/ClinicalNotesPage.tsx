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
import { Field, Select, Textarea } from '../components/ui/Field'
import { InlineNotice } from '../components/ui/InlineNotice'
import { PageHeader } from '../components/ui/PageHeader'
import { Skeleton } from '../components/ui/Skeleton'
import { StatusRow } from '../components/ui/StatusRow'
import { useCreateClinicalNote } from '../hooks/mutations/clinical-notes/clinical-notes.mutations'
import { useClinicalNotes } from '../hooks/queries/clinical-notes/clinical-notes.queries'
import { usePatients } from '../hooks/queries/patients/patients.queries'
import {
  getApiErrorMessage,
  getApiErrorCode,
  isAccessError,
} from '../lib/api-error'
import { formatBirthDate, formatDateTime } from '../lib/format'
import {
  ROUTES,
  patientRecordPath,
} from '../router/routes'

export function ClinicalNotesPage() {
  const [searchParams] = useSearchParams()
  const initialChildId = searchParams.get('childId') ?? ''
  const [selectedChildId, setSelectedChildId] = useState(initialChildId)

  useEffect(() => {
    const childId = searchParams.get('childId')
    if (childId) {
      setSelectedChildId(childId)
    }
  }, [searchParams])
  const [note, setNote] = useState('')
  const [notice, setNotice] = useState('')
  const [formError, setFormError] = useState('')

  const patients = usePatients()
  const notes = useClinicalNotes(selectedChildId || null)
  const createNote = useCreateClinicalNote()

  const selectedPatient = patients.data?.find(
    (patient) => patient.id === selectedChildId,
  )
  const accessError = notes.isError && isAccessError(notes.error)
  const accessCode = accessError ? getApiErrorCode(notes.error) : null
  const hasDraft = note.trim().length > 0
  const savingDisabled =
    !selectedChildId ||
    !note.trim() ||
    createNote.isPending ||
    Boolean(accessCode)

  const consentState =
    accessCode === 'NO_ELIGIBLE_APPOINTMENT'
      ? 'Verified'
      : accessCode === 'CONSENT_REQUIRED'
        ? 'Not active'
        : selectedPatient || notes.isSuccess
          ? 'Verified'
          : 'Checking'
  const appointmentState =
    accessCode === 'NO_ELIGIBLE_APPOINTMENT'
      ? 'Not eligible'
      : selectedPatient || notes.isSuccess
        ? 'Verified'
        : 'Checking'
  const savingState = accessCode
    ? 'Locked'
    : selectedChildId
      ? notes.isLoading
        ? 'Checking'
        : 'Available'
      : 'Locked'

  const handlePatientChange = (childId: string) => {
    setSelectedChildId(childId)
    setNote('')
    setNotice('')
    setFormError('')
    createNote.reset()
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setNotice('')
    setFormError('')
    createNote.reset()

    if (!selectedChildId) {
      setFormError('Select an eligible patient before saving a clinical note.')
      return
    }

    if (!note.trim()) {
      setFormError('Write a clinical note before saving.')
      return
    }

    createNote.mutate(
      { childId: selectedChildId, content: note.trim() },
      {
        onSuccess: () => {
          setNote('')
          setNotice('Clinical note saved to this patient record.')
        },
      },
    )
  }

  const clearDraft = () => {
    setNote('')
    setNotice('')
    setFormError('')
    createNote.reset()
  }

  const recordHref = selectedChildId
    ? patientRecordPath(selectedChildId)
    : ROUTES.patients

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Clinical documentation"
        title="Clinical Notes"
        description="Document session observations and progress while clinical access is valid."
        actions={
          <Link
            className={buttonStyles({ variant: 'secondary' })}
            to={recordHref}
          >
            <Icon name="id-card" size={15} />
            View patient record
          </Link>
        }
      />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
        <Card>
          <CardHeader
            title="New clinical note"
            description="Notes are stored as free text for the selected patient."
          />

          <form onSubmit={handleSubmit}>
            <CardBody>
              <div className="grid gap-5">
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  <Field
                    label="Patient"
                    htmlFor="note-patient"
                    hint="Only consent-eligible patients from My Patients are listed."
                  >
                    <Select
                      id="note-patient"
                      value={selectedChildId}
                      disabled={patients.isLoading || createNote.isPending}
                      onChange={(event) =>
                        handlePatientChange(event.target.value)
                      }
                    >
                      <option value="">Select a patient</option>
                      {patients.data?.map((patient) => (
                        <option value={patient.id} key={patient.id}>
                          {patient.firstName} {patient.lastName}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  {patients.isError ? (
                    <div className="mt-3">
                      <ApiErrorNotice
                        error={patients.error}
                        title="Could not load patients"
                        onRetry={() => {
                          void patients.refetch()
                        }}
                      />
                    </div>
                  ) : null}
                </div>

                <Field
                  label="Clinical note"
                  htmlFor="clinical-note"
                  hint="Document observations, session progress, and next steps. Parent-provided and AI-generated information is read-only."
                >
                  <Textarea
                    id="clinical-note"
                    value={note}
                    disabled={
                      !selectedChildId ||
                      Boolean(accessCode) ||
                      createNote.isPending
                    }
                    onChange={(event) => {
                      setNote(event.target.value)
                      setNotice('')
                      setFormError('')
                      createNote.reset()
                    }}
                    placeholder={
                      selectedChildId
                        ? 'Write your clinical note for this session.'
                        : 'Select a patient before writing a note.'
                    }
                    rows={9}
                  />
                </Field>

                {formError ? (
                  <InlineNotice tone="warning">{formError}</InlineNotice>
                ) : null}

                {notice ? (
                  <InlineNotice tone="success">{notice}</InlineNotice>
                ) : null}

                {createNote.isError ? (
                  <InlineNotice tone="danger">
                    {getApiErrorMessage(createNote.error)}
                  </InlineNotice>
                ) : null}
              </div>
            </CardBody>

            <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/60 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
                <Icon name="shield" size={13} />
                Saving is checked against consent and appointment access.
              </p>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button variant="ghost" onClick={clearDraft} disabled={!hasDraft}>
                  <Icon name="trash" size={14} />
                  Clear draft
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={savingDisabled}
                  aria-busy={createNote.isPending}
                >
                  {createNote.isPending ? (
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
                      Save note
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
              title="Patient context"
            />
            <CardBody>
              {selectedPatient ? (
                <div className="grid gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-teal-200 bg-teal-50 text-teal-700">
                      <Icon name="user" size={17} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {selectedPatient.firstName}{' '}
                        {selectedPatient.lastName}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        Born {formatBirthDate(selectedPatient.dateOfBirth)}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3 text-[11px] leading-4 text-slate-600">
                    Parent/guardian: {selectedPatient.parent.fullName}
                  </div>
                  <Link
                    className={buttonStyles({ variant: 'secondary', size: 'sm' })}
                    to={patientRecordPath(selectedPatient.id)}
                  >
                    <Icon name="id-card" size={12} />
                    Open clinical record
                  </Link>
                </div>
              ) : (
                <EmptyState
                  compact
                  icon="user"
                  title="No patient selected"
                  description="Choose an eligible patient in the note form to associate this note with an active care relationship."
                  action={
                    <Link
                      className={buttonStyles({
                        variant: 'secondary',
                        size: 'sm',
                      })}
                      to={ROUTES.patients}
                    >
                      <Icon name="users" size={13} />
                      My Patients
                    </Link>
                  }
                />
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Access context"
              description="Both conditions must be active to save."
            />
            <CardBody>
              <div>
                <StatusRow
                  icon="shield"
                  label="Parental consent"
                  value={
                    <Badge
                      tone={
                        consentState === 'Verified'
                          ? 'success'
                          : consentState === 'Not active'
                            ? 'danger'
                            : 'neutral'
                      }
                    >
                      {consentState}
                    </Badge>
                  }
                />
                <StatusRow
                  icon="calendar"
                  label="Appointment"
                  value={
                    <Badge
                      tone={
                        appointmentState === 'Verified'
                          ? 'success'
                          : appointmentState === 'Not eligible'
                            ? 'danger'
                            : 'neutral'
                      }
                    >
                      {appointmentState}
                    </Badge>
                  }
                />
                <StatusRow
                  icon="notes"
                  label="Note saving"
                  value={
                    <Badge
                      tone={
                        savingState === 'Available'
                          ? 'success'
                          : savingState === 'Locked'
                            ? 'danger'
                            : 'neutral'
                      }
                    >
                      {savingState}
                    </Badge>
                  }
                />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Recent notes"
              description="Notes already saved for the selected patient."
            />
            <CardBody>
              {!selectedChildId ? (
                <EmptyState
                  compact
                  icon="notes"
                  title="Select a patient"
                  description="Recent notes appear after a patient is selected."
                />
              ) : notes.isLoading ? (
                <div className="grid gap-2">
                  <Skeleton className="h-14 w-full rounded-lg" />
                  <Skeleton className="h-14 w-full rounded-lg" />
                </div>
              ) : accessError ? (
                <InlineNotice tone="warning">
                  {getApiErrorMessage(notes.error)}
                </InlineNotice>
              ) : notes.isError ? (
                <ApiErrorNotice
                  error={notes.error}
                  title="Could not load notes"
                  onRetry={() => {
                    void notes.refetch()
                  }}
                />
              ) : notes.data && notes.data.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {notes.data.map((savedNote) => (
                    <article
                      className="py-3 first:pt-0 last:pb-0"
                      key={savedNote.id}
                    >
                      <p className="whitespace-pre-wrap text-xs leading-5 text-slate-700">
                        {savedNote.content}
                      </p>
                      <p className="mt-1.5 text-[10px] text-slate-500">
                        {formatDateTime(savedNote.createdAt)}
                      </p>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState
                  compact
                  icon="notes"
                  title="No notes yet"
                  description="Saved notes for this patient will appear here."
                />
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
