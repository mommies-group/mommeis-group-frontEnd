import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ClinicalNoteEditModal } from '../components/notes/ClinicalNoteEditModal'
import { ClinicalNoteModal } from '../components/notes/ClinicalNoteModal'
import { Icon, type IconName } from '../components/icons/Icon'
import { ApiErrorNotice } from '../components/ui/ApiErrorNotice'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { buttonStyles } from '../components/ui/buttonStyles'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader } from '../components/ui/PageHeader'
import { Pagination } from '../components/ui/Pagination'
import { Skeleton } from '../components/ui/Skeleton'
import { Spinner } from '../components/ui/Spinner'
import { useClinicalNotes } from '../hooks/queries/clinical-notes/clinical-notes.queries'
import { useClinicalRecord } from '../hooks/queries/patients/patients.queries'
import { usePagination } from '../hooks/use-pagination'
import {
  getApiErrorMessage,
  getApiErrorCode,
  isAccessError,
} from '../lib/api-error'
import {
  formatBirthDate,
  formatDate,
  formatDateTime,
} from '../lib/format'
import { ROUTES } from '../router/routes'

type RecordSectionProps = {
  title: string
  icon: IconName
  wide?: boolean
  action?: ReactNode
  children: ReactNode
}

function RecordSection({
  title,
  icon,
  wide = false,
  action,
  children,
}: RecordSectionProps) {
  return (
    <Card
      className={`flex h-full min-h-0 flex-col ${wide ? 'xl:col-span-2' : ''}`}
    >
      <div className="flex flex-col gap-2 border-b border-slate-300 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-900">
          <span className="text-teal-700">
            <Icon name={icon} size={15} />
          </span>
          <span className="truncate">{title}</span>
        </h2>
        {action ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {action}
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-6">{children}</div>
    </Card>
  )
}

function RiskBadge({ level }: { level: string }) {
  if (level === 'LOW') {
    return <Badge tone="success">Low</Badge>
  }
  if (level === 'MODERATE') {
    return <Badge tone="warning">Moderate</Badge>
  }
  if (level === 'HIGH') {
    return <Badge tone="danger">High</Badge>
  }
  return <Badge tone="neutral">{level}</Badge>
}

export function PatientRecordPage() {
  const [searchParams] = useSearchParams()
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [deleteMode, setDeleteMode] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const childId = searchParams.get('childId')
  const record = useClinicalRecord(childId)
  const clinicalNotes = useClinicalNotes(childId)
  const milestonesPager = usePagination(
    record.data?.milestones ?? [],
    5,
    'record-milestones',
  )
  const observationsPager = usePagination(
    record.data?.observations ?? [],
    5,
    'record-observations',
  )
  const assessmentsPager = usePagination(
    record.data?.assessments ?? [],
    5,
    'record-assessments',
  )
  const triagePager = usePagination(
    record.data?.triageHistory ?? [],
    5,
    'record-triage',
  )
  const notesPager = usePagination(clinicalNotes.data ?? [], 5, 'record-notes')
  const accessError = record.isError && isAccessError(record.error)

  const pageTitle = record.data
    ? `${record.data.child.firstName} ${record.data.child.lastName}`
    : 'Clinical record'

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={pageTitle}
        icon="id-card"
        actions={
          <>
            <Link
              className={buttonStyles({ variant: 'secondary', size: 'sm' })}
              to={ROUTES.patients}
            >
              <Icon name="arrow-left" size={14} />
              Patients
            </Link>

          </>
        }
      />

      {!childId ? (
        <Card>
          <div className="p-6">
            <EmptyState
              icon="id-card"
              title="No patient selected"
              description="Open a patient from My Patients."
            />
          </div>
        </Card>
      ) : null}

      {childId && record.isLoading ? (
        <div className="grid gap-5 xl:grid-cols-2">
          {[0, 1, 2, 3].map((item) => (
            <Card key={item} className="p-6">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="mt-3 h-3 w-full" />
              <Skeleton className="mt-2 h-3 w-5/6" />
              <Skeleton className="mt-3 h-16 w-full rounded-xl" />
            </Card>
          ))}
        </div>
      ) : null}

      {childId && accessError ? (
        <Card>
          <div className="flex items-start gap-3 p-6">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Icon name="lock" size={19} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">
                Clinical record locked
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                {getApiErrorMessage(record.error)}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge
                  tone={
                    getApiErrorCode(record.error) === 'NO_ELIGIBLE_APPOINTMENT'
                      ? 'success'
                      : 'danger'
                  }
                >
                  Consent
                </Badge>
                <Badge
                  tone={
                    getApiErrorCode(record.error) === 'NO_ELIGIBLE_APPOINTMENT'
                      ? 'danger'
                      : 'neutral'
                  }
                >
                  Appointment
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      ) : null}

      {childId && record.isError && !accessError ? (
        <ApiErrorNotice
          error={record.error}
          title="Could not load the clinical record"
          onRetry={() => {
            void record.refetch()
          }}
        />
      ) : null}

      {record.data ? (
        <div className="grid gap-5 xl:grid-cols-2">
          <RecordSection
            title="Patient"
            icon="user"
            wide
          >
            <dl className="grid gap-3 sm:grid-cols-4">
              <div>
                <dt className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                  Name
                </dt>
                <dd className="mt-0.5 text-xs font-semibold text-slate-900">
                  {record.data.child.firstName} {record.data.child.lastName}
                </dd>
              </div>
              <div>
                <dt className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                  Born
                </dt>
                <dd className="mt-0.5 text-xs font-medium text-slate-700">
                  {formatBirthDate(record.data.child.dateOfBirth)}
                </dd>
              </div>
              <div>
                <dt className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                  Parent
                </dt>
                <dd className="mt-0.5 text-xs font-medium text-slate-700">
                  {record.data.parent.fullName}
                </dd>
              </div>
              <div>
                <dt className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                  Email
                </dt>
                <dd className="mt-0.5 truncate text-xs font-medium text-slate-700">
                  {record.data.parent.email ?? '—'}
                </dd>
              </div>
            </dl>
          </RecordSection>

          <RecordSection
            title="Milestones"
            icon="sparkles"
          >
            {record.data.milestones.length > 0 ? (
              <ol className="relative grid gap-3 border-l border-slate-300 pl-4 pb-4">
                {milestonesPager.visibleItems.map((milestone) => (
                  <li className="relative" key={milestone.id}>
                    <span
                      className="absolute -left-[22px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-teal-600"
                      aria-hidden="true"
                    />
                    <p className="text-xs font-semibold text-slate-900">
                      {milestone.title}
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-500">
                      {formatDate(milestone.achievedAt)}
                      {milestone.description
                        ? ` · ${milestone.description}`
                        : ''}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <EmptyState compact icon="sparkles" title="No milestones" />
            )}
            <Pagination
              compact
              flush
              label="Milestones"
              onPageChange={milestonesPager.setPage}
              page={milestonesPager.page}
              rangeEnd={milestonesPager.rangeEnd}
              rangeStart={milestonesPager.rangeStart}
              total={milestonesPager.total}
              totalPages={milestonesPager.totalPages}
            />
          </RecordSection>

          <RecordSection
            title="Observations"
            icon="message"
          >
            {record.data.observations.length > 0 ? (
              <div className="divide-y divide-slate-200">
                {observationsPager.visibleItems.map((observation) => (
                  <div className="py-2.5 first:pt-0 last:pb-0" key={observation.id}>
                    <p className="whitespace-pre-wrap text-[11px] leading-5 text-slate-700">
                      {observation.content}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-500">
                      {formatDateTime(observation.observedAt)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState compact icon="message" title="No observations" />
            )}
            <Pagination
              compact
              flush
              label="Observations"
              onPageChange={observationsPager.setPage}
              page={observationsPager.page}
              rangeEnd={observationsPager.rangeEnd}
              rangeStart={observationsPager.rangeStart}
              total={observationsPager.total}
              totalPages={observationsPager.totalPages}
            />
          </RecordSection>

          <RecordSection
            title="Assessments"
            icon="activity"
          >
            {record.data.assessments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr>
                      <th className="border-b border-slate-300 pb-2 text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                        Assessment
                      </th>
                      <th className="border-b border-slate-300 pb-2 text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                        Score
                      </th>
                      <th className="border-b border-slate-300 pb-2 text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {assessmentsPager.visibleItems.map((assessment) => (
                      <tr key={assessment.id}>
                        <td className="py-2 text-xs font-medium text-slate-800">
                          {assessment.gameName}
                        </td>
                        <td className="py-2 text-xs text-slate-600">
                          {assessment.score} / {assessment.maxScore}
                        </td>
                        <td className="py-2 text-[10px] text-slate-500">
                          {formatDate(assessment.playedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState compact icon="activity" title="No assessments" />
            )}
            <Pagination
              compact
              flush
              label="Assessments"
              onPageChange={assessmentsPager.setPage}
              page={assessmentsPager.page}
              rangeEnd={assessmentsPager.rangeEnd}
              rangeStart={assessmentsPager.rangeStart}
              total={assessmentsPager.total}
              totalPages={assessmentsPager.totalPages}
            />
          </RecordSection>

          <RecordSection
            title="Triage history"
            icon="sparkles"
          >
            {record.data.triageHistory.length > 0 ? (
              <div className="grid gap-2">
                {triagePager.visibleItems.map((triage) => (
                  <div
                    className="rounded-lg border border-violet-100 bg-violet-50/50 p-2.5"
                    key={triage.id}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <RiskBadge level={triage.riskLevel} />
                      <span className="text-[10px] text-slate-500">
                        {formatDateTime(triage.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[11px] leading-5 text-slate-700">
                      {triage.summary}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState compact icon="sparkles" title="No triage entries" />
            )}
            <Pagination
              compact
              flush
              label="Triage history"
              onPageChange={triagePager.setPage}
              page={triagePager.page}
              rangeEnd={triagePager.rangeEnd}
              rangeStart={triagePager.rangeStart}
              total={triagePager.total}
              totalPages={triagePager.totalPages}
            />
          </RecordSection>

          <RecordSection
            title="Clinical notes"
            icon="notes"
            wide
            action={
              <Button
                onClick={() => setNotesOpen(true)}
                size="sm"
                type="button"
                variant="primary"
              >
                <Icon name="plus" size={13} />
                Add note
              </Button>
            }
          >
            {clinicalNotes.isLoading ? (
              <Spinner label="Loading notes…" />
            ) : clinicalNotes.data && clinicalNotes.data.length > 0 ? (
              <div className="space-y-4">
                {notesPager.visibleItems.map((note) => (
                  <article
                    className="rounded-xl border border-slate-200 bg-white p-5"
                    key={note.id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-4">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                            Notes
                          </p>
                          <p className="mt-1 whitespace-pre-wrap text-[11px] leading-5 text-slate-700">
                            {note.content}
                          </p>
                        </div>
                        {note.recommendation ? (
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                              Instructions
                            </p>
                            <p className="mt-1 rounded-md bg-teal-50 px-2.5 py-1.5 text-[10px] leading-4 text-teal-900">
                              {note.recommendation}
                            </p>
                          </div>
                        ) : null}
                        {note.activities && note.activities.length > 0 ? (
                          <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                              Activities
                            </p>
                            {note.activities.map((activity, index) => (
                              <div
                                className="rounded-md border border-slate-200 bg-white p-3"
                                key={`${activity.activityId}-${index}`}
                              >
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                  Activity
                                </p>
                                <p className="mt-0.5 text-[11px] font-medium text-slate-800">
                                  {activity.title ?? 'Activity'}
                                  {activity.durationMinutes ? (
                                    <span className="ml-2 text-[10px] font-normal text-slate-500">
                                      {activity.durationMinutes} min
                                    </span>
                                  ) : null}
                                </p>
                                {activity.specialistNotes ? (
                                  <div className="mt-2">
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                      Your note
                                    </p>
                                    <p className="mt-0.5 whitespace-pre-wrap text-[10px] leading-4 text-slate-600">
                                      {activity.specialistNotes}
                                    </p>
                                  </div>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button
                          aria-label={`Edit note from ${formatDateTime(note.createdAt)}`}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-teal-50 hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                          onClick={() => {
                            setDeleteMode(false)
                            setEditingNoteId(note.id)
                          }}
                          type="button"
                        >
                          <Icon name="edit" size={13} />
                        </button>
                        <button
                          aria-label={`Delete note from ${formatDateTime(note.createdAt)}`}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                          onClick={() => {
                            setDeleteMode(true)
                            setEditingNoteId(note.id)
                          }}
                          type="button"
                        >
                          <Icon name="trash" size={13} />
                        </button>
                      </div>
                    </div>
                    <p className="mt-4 border-t border-slate-100 pt-3 text-[10px] text-slate-500">
                      {formatDateTime(note.createdAt)}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState compact icon="notes" title="No clinical notes" />
            )}
            <Pagination
              compact
              flush
              label="Clinical notes"
              onPageChange={notesPager.setPage}
              page={notesPager.page}
              rangeEnd={notesPager.rangeEnd}
              rangeStart={notesPager.rangeStart}
              total={notesPager.total}
              totalPages={notesPager.totalPages}
            />
          </RecordSection>
        </div>
      ) : null}

      {editingNoteId ? (
        <ClinicalNoteEditModal
          key={`${editingNoteId}-${deleteMode}`}
          noteId={editingNoteId}
          open
          startInDeleteConfirm={deleteMode}
          onClose={() => {
            setEditingNoteId(null)
            setDeleteMode(false)
          }}
          onChanged={() => {
            void record.refetch()
            void clinicalNotes.refetch()
          }}
        />
      ) : null}

      {notesOpen && childId ? (
        <ClinicalNoteModal
          childId={childId}
          open
          onClose={() => setNotesOpen(false)}
          onCompleted={() => {
            void record.refetch()
            void clinicalNotes.refetch()
          }}
        />
      ) : null}
    </div>
  )
}
