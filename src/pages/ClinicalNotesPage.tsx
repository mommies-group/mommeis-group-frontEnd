import { useState } from 'react'
import type { FormEvent } from 'react'
import { Icon } from '../components/icons/Icon'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { buttonStyles } from '../components/ui/buttonStyles'
import { Callout } from '../components/ui/Callout'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Field, Input, Textarea } from '../components/ui/Field'
import { InlineNotice } from '../components/ui/InlineNotice'
import { PageHeader } from '../components/ui/PageHeader'
import { StatusRow } from '../components/ui/StatusRow'
import { ROUTES } from '../router/routes'

export function ClinicalNotesPage() {
  const [note, setNote] = useState('')
  const [showStructured, setShowStructured] = useState(false)
  const [observationDate, setObservationDate] = useState('')
  const [observationContext, setObservationContext] = useState('')
  const [observationSummary, setObservationSummary] = useState('')
  const [notice, setNotice] = useState('')

  const hasDraft =
    note.trim().length > 0 ||
    observationDate.length > 0 ||
    observationContext.trim().length > 0 ||
    observationSummary.trim().length > 0

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setNotice(
      'Preview only — this note was not saved. Saving will be connected to the clinical records API later.',
    )
  }

  const clearDraft = () => {
    setNote('')
    setObservationDate('')
    setObservationContext('')
    setObservationSummary('')
    setNotice('')
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Clinical documentation"
        title="Clinical Notes"
        description="Document session observations and progress while clinical access is valid."
        actions={
          <a
            className={buttonStyles({ variant: 'secondary' })}
            href={`#${ROUTES.patientRecord}`}
          >
            <Icon name="id-card" size={15} />
            View patient record
          </a>
        }
      />

      <Callout tone="warning" title="Access is required before saving" icon="lock">
        New notes can only be saved while both active consent and an active or
        recently completed appointment are valid. This static preview does not
        verify access or persist notes.
      </Callout>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
        <Card>
          <CardHeader
            title="New clinical note"
            description="Free-text note with an optional structured observation."
            action={
              hasDraft ? (
                <Badge tone="info" dot>
                  Unsaved draft
                </Badge>
              ) : (
                <Badge tone="neutral">Empty draft</Badge>
              )
            }
          />

          <form onSubmit={handleSubmit}>
            <CardBody>
              <div className="grid gap-5">
                <Field
                  label="Clinical note"
                  htmlFor="clinical-note"
                  hint="Document observations, session progress, and next steps. Parent-provided and AI-generated information is read-only."
                >
                  <Textarea
                    id="clinical-note"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Write your clinical note for this session."
                    rows={9}
                  />
                </Field>

                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800">
                        Structured observation
                      </p>
                      <p className="mt-1 text-[11px] leading-4 text-slate-500">
                        Optional. Add a small amount of session structure
                        without changing parent-provided or AI data.
                      </p>
                    </div>
                    <label className="inline-flex w-fit shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-600">
                      <input
                        type="checkbox"
                        className="h-3.5 w-3.5 rounded border-slate-300 accent-teal-700 focus:ring-teal-600"
                        checked={showStructured}
                        onChange={(event) =>
                          setShowStructured(event.target.checked)
                        }
                      />
                      Include
                    </label>
                  </div>

                  {showStructured ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <Field
                        label="Observation date"
                        htmlFor="observation-date"
                      >
                        <Input
                          id="observation-date"
                          type="date"
                          value={observationDate}
                          onChange={(event) =>
                            setObservationDate(event.target.value)
                          }
                        />
                      </Field>
                      <Field label="Context" htmlFor="observation-context">
                        <Input
                          id="observation-context"
                          value={observationContext}
                          onChange={(event) =>
                            setObservationContext(event.target.value)
                          }
                          placeholder="Where or when the observation occurred"
                        />
                      </Field>
                      <Field
                        label="Observation summary"
                        htmlFor="observation-summary"
                        className="sm:col-span-2"
                      >
                        <Textarea
                          id="observation-summary"
                          value={observationSummary}
                          onChange={(event) =>
                            setObservationSummary(event.target.value)
                          }
                          placeholder="Summarise the structured observation."
                          rows={3}
                        />
                      </Field>
                    </div>
                  ) : null}
                </div>

                {notice ? <InlineNotice tone="info">{notice}</InlineNotice> : null}
              </div>
            </CardBody>

            <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/60 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
                <Icon name="info" size={13} />
                Visual control only — notes are not stored.
              </p>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button variant="ghost" onClick={clearDraft} disabled={!hasDraft}>
                  <Icon name="trash" size={14} />
                  Clear draft
                </Button>
                <Button type="submit" variant="primary">
                  <Icon name="check" size={14} />
                  Save note
                </Button>
              </div>
            </div>
          </form>
        </Card>

        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader
              title="Patient context"
              action={<Badge tone="neutral">None selected</Badge>}
            />
            <CardBody>
              <EmptyState
                compact
                icon="user"
                title="No patient selected"
                description="Open a patient from My Patients to associate a note with an active care relationship."
                action={
                  <a
                    className={buttonStyles({
                      variant: 'secondary',
                      size: 'sm',
                    })}
                    href={`#${ROUTES.patients}`}
                  >
                    <Icon name="users" size={13} />
                    My Patients
                  </a>
                }
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Access context"
              description="Both conditions must be active to save."
              action={<Badge tone="warning">Required</Badge>}
            />
            <CardBody>
              <div>
                <StatusRow
                  icon="shield"
                  label="Parental consent"
                  value={<Badge tone="neutral">Not verified</Badge>}
                />
                <StatusRow
                  icon="calendar"
                  label="Appointment"
                  value={<Badge tone="neutral">Not verified</Badge>}
                />
                <StatusRow
                  icon="notes"
                  label="Note saving"
                  value={<Badge tone="danger">Locked</Badge>}
                />
              </div>
              <p className="mt-3 text-[11px] leading-4 text-slate-500">
                <a
                  className="font-semibold text-teal-700 underline underline-offset-2 hover:text-teal-900"
                  href={`#${ROUTES.privacy}`}
                >
                  Review the access rules
                </a>
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Writing guidance" />
            <CardBody>
              <div className="grid gap-3">
                <p className="flex gap-2.5 text-xs leading-5 text-slate-600">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                    <Icon name="lock" size={14} />
                  </span>
                  <span>
                    Mother-provided observations and AI scores are read-only; do
                    not rewrite them as specialist findings.
                  </span>
                </p>
                <p className="flex gap-2.5 text-xs leading-5 text-slate-600">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                    <Icon name="alert" size={14} />
                  </span>
                  <span>Do not present AI triage as a medical diagnosis.</span>
                </p>
                <p className="flex gap-2.5 text-xs leading-5 text-slate-600">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                    <Icon name="shield" size={14} />
                  </span>
                  <span>
                    Saving is blocked when either consent or appointment access
                    is missing.
                  </span>
                </p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Recent notes" />
            <CardBody>
              <EmptyState
                compact
                icon="notes"
                title="No notes to display"
                description="Previous specialist-authored notes will appear here once clinical access and note data are connected."
              />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
