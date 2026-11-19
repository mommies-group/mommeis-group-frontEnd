import type { ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Icon, type IconName } from '../components/icons/Icon'
import { ApiErrorNotice } from '../components/ui/ApiErrorNotice'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { buttonStyles } from '../components/ui/buttonStyles'
import { Callout } from '../components/ui/Callout'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader } from '../components/ui/PageHeader'
import { Skeleton } from '../components/ui/Skeleton'
import { SourceBadge, type DataSource } from '../components/ui/SourceBadge'
import { useClinicalRecord } from '../hooks/queries/patients/patients.queries'
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
import {
  ROUTES,
  clinicalNotesPath,
} from '../router/routes'

type RecordSectionProps = {
  title: string
  description: string
  icon: IconName
  source?: DataSource
  wide?: boolean
  action?: ReactNode
  children: ReactNode
}

function RecordSection({
  title,
  description,
  icon,
  source,
  wide = false,
  action,
  children,
}: RecordSectionProps) {
  return (
    <Card className={wide ? 'xl:col-span-2' : ''}>
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <span className="text-teal-700">
              <Icon name={icon} size={16} />
            </span>
            {title}
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {source ? <SourceBadge source={source} /> : null}
          {action}
        </div>
      </div>
      <div className="p-5">
        {source === 'parent' || source === 'ai' ? (
          <p className="mb-3 flex items-start gap-2 rounded-lg border border-sky-100 bg-sky-50 px-3 py-2 text-[11px] leading-4 text-sky-800">
            <span className="mt-0.5 shrink-0">
              <Icon name="lock" size={11} />
            </span>
            This information is read-only. Specialists cannot edit
            parent-provided observations or AI-generated results.
          </p>
        ) : null}
        {children}
      </div>
    </Card>
  )
}

function LockedRecord({
  code,
  title,
  description,
}: {
  code: string | null
  title: string
  description: string
}) {
  const consentValue =
    code === 'NO_ELIGIBLE_APPOINTMENT' ? 'Verified' : 'Not verified'
  const appointmentValue =
    code === 'NO_ELIGIBLE_APPOINTMENT' ? 'Not eligible' : 'Not verified'

  return (
    <section
      className="overflow-hidden rounded-2xl border border-amber-200 bg-amber-50/60 shadow-sm"
      aria-labelledby="record-gate-title"
    >
      <div className="flex gap-3 p-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
          <Icon name="lock" size={20} />
        </span>
        <div className="min-w-0">
          <h2
            className="text-base font-semibold tracking-tight text-amber-950"
            id="record-gate-title"
          >
            {title}
          </h2>
          <p className="mt-1 text-xs leading-5 text-amber-900/80">
            {description}
          </p>
        </div>
      </div>

      <div className="grid gap-3 border-t border-amber-200/70 p-5 sm:grid-cols-3">
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200/70 bg-white/70 p-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
            <Icon name="shield" size={14} />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-800">
              Active parental consent
            </p>
            <span className="mt-1 inline-flex">
              <Badge tone={consentValue === 'Verified' ? 'success' : 'neutral'}>
                {consentValue}
              </Badge>
            </span>
          </div>
        </div>
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200/70 bg-white/70 p-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
            <Icon name="calendar" size={14} />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-800">
              Active or recent appointment
            </p>
            <span className="mt-1 inline-flex">
              <Badge
                tone={appointmentValue === 'Not eligible' ? 'danger' : 'neutral'}
              >
                {appointmentValue}
              </Badge>
            </span>
          </div>
        </div>
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200/70 bg-white/70 p-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
            <Icon name="lock" size={14} />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-800">
              Clinical record access
            </p>
            <span className="mt-1 inline-flex">
              <Badge tone="danger">Locked</Badge>
            </span>
          </div>
        </div>
      </div>
    </section>
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
  const childId = searchParams.get('childId')
  const record = useClinicalRecord(childId)
  const accessError = record.isError && isAccessError(record.error)
  const accessCode = accessError ? getApiErrorCode(record.error) : null

  const pageTitle = record.data
    ? `${record.data.child.firstName} ${record.data.child.lastName}`
    : 'Patient clinical record'

  const pageDescription = record.data
    ? `${formatBirthDate(record.data.child.dateOfBirth)} · Parent/guardian: ${record.data.parent.fullName}`
    : 'Clinical information is shown only while the relationship-specific consent and appointment conditions are both active.'

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="My Patients"
        title={pageTitle}
        description={pageDescription}
        actions={
          <>
            <Link
              className={buttonStyles({ variant: 'secondary' })}
              to={ROUTES.patients}
            >
              <Icon name="arrow-left" size={15} />
              Back to patients
            </Link>
            <Button
              variant="secondary"
              disabled
              title="Telehealth is not implemented in this portal"
            >
              <Icon name="video" size={15} />
              Telehealth (placeholder)
            </Button>
          </>
        }
      />

      {!childId ? (
        <LockedRecord
          code={null}
          title="Select a patient first"
          description="No patient context is loaded. Open a patient from My Patients to request the clinical record through the consent and appointment checks."
        />
      ) : null}

      {childId && record.isLoading ? (
        <div
          className="grid gap-5 xl:grid-cols-2"
          aria-label="Loading clinical record"
        >
          {[0, 1, 2, 3].map((item) => (
            <Card key={item} className="p-5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="mt-3 h-3 w-full" />
              <Skeleton className="mt-2 h-3 w-5/6" />
              <Skeleton className="mt-4 h-20 w-full rounded-xl" />
            </Card>
          ))}
        </div>
      ) : null}

      {childId && accessError ? (
        <LockedRecord
          code={accessCode}
          title="Clinical record locked"
          description={
            accessCode
              ? getApiErrorMessage(record.error)
              : 'Clinical access could not be verified for this patient.'
          }
        />
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
        <>
          <section
            className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 sm:flex-row sm:items-start sm:justify-between"
            aria-label="Verified clinical access"
          >
            <div className="flex gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Icon name="shield" size={20} />
              </span>
              <div className="min-w-0">
                <h2 className="text-base font-semibold tracking-tight text-emerald-950">
                  Clinical access verified
                </h2>
                <p className="mt-1 text-xs leading-5 text-emerald-900/80">
                  The API confirmed active consent and an eligible appointment
                  for this specialist–child relationship before returning this
                  record.
                </p>
              </div>
            </div>
            <Link
              className={buttonStyles({ variant: 'secondary', size: 'sm' })}
              to={clinicalNotesPath(record.data.child.id)}
            >
              <Icon name="notes" size={13} />
              Open notes
            </Link>
          </section>

          <Callout tone="info" title="Read-only sources" icon="info">
            Mother-provided observations and AI-generated scores or triage
            results are visually marked as read-only. AI triage is screening
            context and is not a medical diagnosis.
          </Callout>

          <div className="grid gap-5 xl:grid-cols-2">
            <RecordSection
              title="Patient profile summary"
              description="Basic child information shared for this care relationship."
              icon="id-card"
              wide
            >
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Child
                  </dt>
                  <dd className="mt-1 text-xs font-semibold text-slate-900">
                    {record.data.child.firstName} {record.data.child.lastName}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Date of birth
                  </dt>
                  <dd className="mt-1 text-xs font-medium text-slate-700">
                    {formatBirthDate(record.data.child.dateOfBirth)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Parent/guardian
                  </dt>
                  <dd className="mt-1 text-xs font-medium text-slate-700">
                    {record.data.parent.fullName}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Parent email
                  </dt>
                  <dd className="mt-1 truncate text-xs font-medium text-slate-700">
                    {record.data.parent.email ?? 'Not provided'}
                  </dd>
                </div>
              </dl>
            </RecordSection>

            <RecordSection
              title="Developmental milestones"
              description="Milestone history provided by the mother."
              icon="sparkles"
              source="parent"
            >
              {record.data.milestones.length > 0 ? (
                <ol className="relative grid gap-4 border-l border-slate-200 pl-4">
                  {record.data.milestones.map((milestone) => (
                    <li className="relative" key={milestone.id}>
                      <span
                        className="absolute -left-[22px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-teal-600"
                        aria-hidden="true"
                      />
                      <p className="text-xs font-semibold text-slate-900">
                        {milestone.title}
                      </p>
                      <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
                        {milestone.description ?? 'No description provided.'}
                      </p>
                      <p className="mt-1 text-[10px] text-slate-500">
                        {formatDate(milestone.achievedAt)}
                      </p>
                    </li>
                  ))}
                </ol>
              ) : (
                <EmptyState
                  compact
                  icon="sparkles"
                  title="No milestones shared"
                  description="No developmental milestones have been recorded for this child."
                />
              )}
            </RecordSection>

            <RecordSection
              title="Behavioral observations"
              description="Observations shared by the mother from the family app."
              icon="message"
              source="parent"
            >
              {record.data.observations.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {record.data.observations.map((observation) => (
                    <div
                      className="py-3 first:pt-0 last:pb-0"
                      key={observation.id}
                    >
                      <p className="whitespace-pre-wrap text-xs leading-5 text-slate-700">
                        {observation.content}
                      </p>
                      <p className="mt-1.5 text-[10px] text-slate-500">
                        Observed {formatDateTime(observation.observedAt)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  compact
                  icon="message"
                  title="No parent observations"
                  description="Parent-provided observations will appear here."
                />
              )}
            </RecordSection>

            <RecordSection
              title="Game and assessment scores"
              description="Screening outputs from assessment games. Scores are not a diagnosis."
              icon="activity"
              source="ai"
            >
              {record.data.assessments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr>
                        <th className="border-b border-slate-200 pb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          Assessment
                        </th>
                        <th className="border-b border-slate-200 pb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          Score
                        </th>
                        <th className="border-b border-slate-200 pb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          Played
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {record.data.assessments.map((assessment) => (
                        <tr key={assessment.id}>
                          <td className="py-2.5 text-xs font-medium text-slate-800">
                            {assessment.gameName}
                          </td>
                          <td className="py-2.5 text-xs text-slate-600">
                            {assessment.score} / {assessment.maxScore}
                          </td>
                          <td className="py-2.5 text-[10px] text-slate-500">
                            {formatDate(assessment.playedAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  compact
                  icon="activity"
                  title="No assessment scores"
                  description="Screening game results will appear here."
                />
              )}
            </RecordSection>

            <RecordSection
              title="AI triage history"
              description="AI triage entries provide screening context only and are not a medical diagnosis."
              icon="sparkles"
              source="ai"
            >
              {record.data.triageHistory.length > 0 ? (
                <div className="grid gap-3">
                  {record.data.triageHistory.map((triage) => (
                    <div
                      className="rounded-xl border border-violet-100 bg-violet-50/50 p-3"
                      key={triage.id}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <RiskBadge level={triage.riskLevel} />
                        <span className="text-[10px] text-slate-500">
                          {formatDateTime(triage.createdAt)}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-slate-700">
                        {triage.summary}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  compact
                  icon="sparkles"
                  title="No AI triage entries"
                  description="Screening triage history will appear here."
                />
              )}
            </RecordSection>

            <RecordSection
              title="Specialist clinical notes"
              description="Notes authored by you for this care relationship."
              icon="notes"
              source="specialist"
              wide
              action={
                <Link
                  className={buttonStyles({ variant: 'secondary', size: 'sm' })}
                  to={clinicalNotesPath(record.data.child.id)}
                >
                  <Icon name="notes" size={13} />
                  Open notes workspace
                </Link>
              }
            >
              {record.data.clinicalNotes.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {record.data.clinicalNotes.map((note) => (
                    <article
                      className="py-3 first:pt-0 last:pb-0"
                      key={note.id}
                    >
                      <p className="whitespace-pre-wrap text-xs leading-5 text-slate-700">
                        {note.content}
                      </p>
                      <p className="mt-1.5 text-[10px] text-slate-500">
                        {formatDateTime(note.createdAt)}
                      </p>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState
                  compact
                  icon="notes"
                  title="No clinical notes yet"
                  description="Notes you save for this patient will appear here."
                  action={
                    <Link
                      className={buttonStyles({
                        variant: 'secondary',
                        size: 'sm',
                      })}
                      to={clinicalNotesPath(record.data.child.id)}
                    >
                      <Icon name="plus" size={12} />
                      Write a note
                    </Link>
                  }
                />
              )}
            </RecordSection>
          </div>
        </>
      ) : null}

      <Callout tone="warning" title="Consent revocation and active consultations">
        Revoking consent locks clinical records and prevents saving new notes.
        It must not automatically terminate a consultation that is already in
        progress. This portal does not implement live telehealth sessions.
      </Callout>
    </div>
  )
}
