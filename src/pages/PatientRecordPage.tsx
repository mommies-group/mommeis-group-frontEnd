import type { ReactNode } from 'react'
import { Icon, type IconName } from '../components/icons/Icon'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { buttonStyles } from '../components/ui/buttonStyles'
import { Callout } from '../components/ui/Callout'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { SourceBadge, type DataSource } from '../components/ui/SourceBadge'
import { ROUTES } from '../router/routes'

type RecordSectionProps = {
  title: string
  description: string
  icon: IconName
  source?: DataSource
  wide?: boolean
  action?: ReactNode
}

function RecordSection({
  title,
  description,
  icon,
  source,
  wide = false,
  action,
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
          <Badge tone="neutral">
            <Icon name="lock" size={10} />
            Locked
          </Badge>
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
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 ring-1 ring-slate-200">
            <Icon name="lock" size={15} />
          </span>
          <div>
            <p className="text-xs font-semibold text-slate-800">
              Content unavailable
            </p>
            <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
              This section is locked until both access conditions are verified.
              No record content is shown in this static preview.
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}

export function PatientRecordPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="My Patients"
        title="Patient clinical record"
        description="Clinical information is shown only while the relationship-specific consent and appointment conditions are both active."
        actions={
          <>
            <a
              className={buttonStyles({ variant: 'secondary' })}
              href={`#${ROUTES.patients}`}
            >
              <Icon name="arrow-left" size={15} />
              Back to patients
            </a>
            <Button
              variant="secondary"
              disabled
              title="Telehealth is a placeholder in this phase"
            >
              <Icon name="video" size={15} />
              Telehealth (placeholder)
            </Button>
          </>
        }
      />

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
              Clinical record locked
            </h2>
            <p className="mt-1 text-xs leading-5 text-amber-900/80">
              No patient context is loaded in this preview. Access requires
              active consent for the specific specialist–child relationship
              and an active or recently completed appointment at the same time.
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
                <Badge tone="neutral">Not verified</Badge>
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
                <Badge tone="neutral">Not verified</Badge>
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

      <Callout tone="info" title="Read-only sources" icon="info">
        Mother-provided observations and AI-generated scores or triage results
        are visually marked as read-only. AI triage is screening context and is
        not a medical diagnosis.
      </Callout>

      <div className="grid gap-5 xl:grid-cols-2">
        <RecordSection
          title="Patient profile summary"
          description="Basic child information shared for this care relationship."
          icon="id-card"
          wide
        />

        <RecordSection
          title="Developmental milestones"
          description="Milestone history provided by the mother."
          icon="sparkles"
          source="parent"
        />

        <RecordSection
          title="Behavioral observations"
          description="Observations shared by the mother from the family app."
          icon="message"
          source="parent"
        />

        <RecordSection
          title="Game and assessment scores"
          description="Screening outputs from assessment games. Scores are not a diagnosis."
          icon="activity"
          source="ai"
        />

        <RecordSection
          title="AI triage history"
          description="AI triage entries provide screening context only and are not a medical diagnosis."
          icon="sparkles"
          source="ai"
        />

        <RecordSection
          title="Specialist clinical notes"
          description="Notes authored by you for this care relationship."
          icon="notes"
          source="specialist"
          wide
          action={
            <a
              className={buttonStyles({ variant: 'secondary', size: 'sm' })}
              href={`#${ROUTES.clinicalNotes}`}
            >
              <Icon name="notes" size={13} />
              Open notes workspace
            </a>
          }
        />
      </div>

      <Callout tone="warning" title="Consent revocation and active consultations">
        Revoking consent locks clinical records and prevents saving new notes.
        It must not automatically terminate a consultation that is already in
        progress. This portal does not implement live telehealth sessions.
      </Callout>
    </div>
  )
}
