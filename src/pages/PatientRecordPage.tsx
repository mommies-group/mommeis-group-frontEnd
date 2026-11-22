import type { ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Icon, type IconName } from '../components/icons/Icon'
import { ApiErrorNotice } from '../components/ui/ApiErrorNotice'
import { Badge } from '../components/ui/Badge'
import { buttonStyles } from '../components/ui/buttonStyles'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader } from '../components/ui/PageHeader'
import { Pagination } from '../components/ui/Pagination'
import { Skeleton } from '../components/ui/Skeleton'
import { SourceBadge, type DataSource } from '../components/ui/SourceBadge'
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
  source?: DataSource
  wide?: boolean
  action?: ReactNode
  children: ReactNode
}

function RecordSection({
  title,
  icon,
  source,
  wide = false,
  action,
  children,
}: RecordSectionProps) {
  return (
    <Card className={wide ? 'xl:col-span-2' : ''}>
      <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-900">
          <span className="text-teal-700">
            <Icon name={icon} size={15} />
          </span>
          <span className="truncate">{title}</span>
        </h2>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {source ? <SourceBadge source={source} /> : null}
          {action}
        </div>
      </div>
      <div className="p-4">{children}</div>
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
  const childId = searchParams.get('childId')
  const record = useClinicalRecord(childId)
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
  const notesPager = usePagination(
    record.data?.clinicalNotes ?? [],
    5,
    'record-notes',
  )
  const accessError = record.isError && isAccessError(record.error)

  const pageTitle = record.data
    ? `${record.data.child.firstName} ${record.data.child.lastName}`
    : 'Clinical record'

  return (
    <div className="flex flex-col gap-5">
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
          <div className="p-4">
            <EmptyState
              icon="id-card"
              title="No patient selected"
              description="Open a patient from My Patients."
            />
          </div>
        </Card>
      ) : null}

      {childId && record.isLoading ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {[0, 1, 2, 3].map((item) => (
            <Card key={item} className="p-4">
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
          <div className="flex items-start gap-3 p-4">
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
        <div className="grid gap-4 xl:grid-cols-2">
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
            source="parent"
          >
            {record.data.milestones.length > 0 ? (
              <ol className="relative grid gap-3 border-l border-slate-200 pl-4">
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
            source="parent"
          >
            {record.data.observations.length > 0 ? (
              <div className="divide-y divide-slate-100">
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
            source="ai"
          >
            {record.data.assessments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr>
                      <th className="border-b border-slate-200 pb-2 text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                        Assessment
                      </th>
                      <th className="border-b border-slate-200 pb-2 text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                        Score
                      </th>
                      <th className="border-b border-slate-200 pb-2 text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
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
            source="ai"
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
            source="specialist"
            wide
          >
            {record.data.clinicalNotes.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {notesPager.visibleItems.map((note) => (
                  <article className="py-2.5 first:pt-0 last:pb-0" key={note.id}>
                    <p className="whitespace-pre-wrap text-[11px] leading-5 text-slate-700">
                      {note.content}
                    </p>
                    {note.recommendation ? (
                      <p className="mt-1.5 rounded-md bg-teal-50 px-2 py-1 text-[10px] text-teal-900">
                        {note.recommendation}
                      </p>
                    ) : null}
                    <p className="mt-1 text-[10px] text-slate-500">
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
    </div>
  )
}
