import type { ReactNode } from 'react'
import { Icon } from '../components/icons/Icon'
import { Badge, type BadgeTone } from '../components/ui/Badge'
import { Callout } from '../components/ui/Callout'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { SourceBadge } from '../components/ui/SourceBadge'
import { StatusRow } from '../components/ui/StatusRow'

function ConditionRow({
  met,
  children,
}: {
  met: boolean
  children: ReactNode
}) {
  return (
    <p className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-[11px] font-medium text-slate-700">
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
          met
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-rose-100 text-rose-600'
        }`}
      >
        <Icon name={met ? 'check' : 'close'} size={12} />
      </span>
      {children}
    </p>
  )
}

type AccessStateTone = 'ok' | 'locked' | 'expired' | 'none'

const stateToneClasses: Record<
  AccessStateTone,
  { card: string; result: string }
> = {
  ok: {
    card: 'border-emerald-200 bg-emerald-50/50',
    result: 'text-emerald-800',
  },
  locked: {
    card: 'border-rose-200 bg-rose-50/40',
    result: 'text-rose-800',
  },
  expired: {
    card: 'border-amber-200 bg-amber-50/40',
    result: 'text-amber-800',
  },
  none: {
    card: 'border-slate-200 bg-slate-50',
    result: 'text-slate-600',
  },
}

type AccessStateProps = {
  tone: AccessStateTone
  title: string
  copy: string
  badge: string
  badgeTone: BadgeTone
  consent: boolean
  appointment: boolean
  result: string
}

function AccessState({
  tone,
  title,
  copy,
  badge,
  badgeTone,
  consent,
  appointment,
  result,
}: AccessStateProps) {
  const toneClasses = stateToneClasses[tone]

  return (
    <article className={`rounded-2xl border p-4 ${toneClasses.card}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-[11px] leading-4 text-slate-600">{copy}</p>
        </div>
        <Badge tone={badgeTone}>{badge}</Badge>
      </div>

      <div className="mt-4 grid gap-2">
        <ConditionRow met={consent}>Active parental consent</ConditionRow>
        <ConditionRow met={appointment}>
          Active or recently completed appointment
        </ConditionRow>
      </div>

      <p
        className={`mt-4 flex items-start gap-2 border-t border-slate-200/70 pt-3 text-[11px] font-medium leading-4 ${toneClasses.result}`}
      >
        <span className="mt-0.5 shrink-0">
          <Icon
            name={
              tone === 'ok' ? 'check' : tone === 'expired' ? 'clock' : 'lock'
            }
            size={13}
          />
        </span>
        {result}
      </p>
    </article>
  )
}

export function PrivacyConsentPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Privacy"
        title="Privacy & Consent"
        description="Understand when clinical information is accessible, when it is locked, and which information is read-only."
        actions={<Badge tone="warning">Policy preview</Badge>}
      />

      <section className="rounded-2xl border border-teal-200 bg-teal-50/60 p-5 shadow-sm">
        <div className="flex gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white">
            <Icon name="shield" size={18} />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-tight text-teal-950">
              Two conditions. One access decision.
            </h2>
            <p className="mt-1 max-w-3xl text-xs leading-5 text-teal-900/80">
              A specialist can access a child&apos;s clinical record only when
              active parental consent for the specific specialist–child
              relationship and an active or recently completed appointment are
              both present. Either condition alone is never sufficient.
            </p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-teal-800">
            <Icon name="shield" size={12} />
            Active parental consent
          </span>
          <span
            className="inline-flex items-center rounded-full border border-teal-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-teal-800"
            aria-hidden="true"
          >
            +
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-teal-800">
            <Icon name="calendar" size={12} />
            Active / recent appointment
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-teal-800">
            <Icon name="check" size={12} />
            Both required
          </span>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.85fr)]">
        <Card>
          <CardHeader
            title="Current access context"
            description="No patient context is selected in this preview."
            action={<Badge tone="neutral">No patient selected</Badge>}
          />
          <CardBody>
            <div>
              <StatusRow
                icon="shield"
                label="Consent status"
                value={<Badge tone="neutral">Not available</Badge>}
              />
              <StatusRow
                icon="calendar"
                label="Appointment access status"
                value={<Badge tone="neutral">Not available</Badge>}
              />
              <StatusRow
                icon="notes"
                label="Clinical records"
                value={<Badge tone="danger">Locked</Badge>}
              />
            </div>
            <p className="mt-3 text-[11px] leading-4 text-slate-500">
              Selecting a patient in a future connected portal will not bypass
              these rules. Access checks must be enforced by the data layer.
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Read-only information"
            description="Parent and AI sources remain unchanged in specialist views."
          />
          <CardBody>
            <div className="grid gap-2">
              <SourceBadge source="parent" />
              <p className="text-xs leading-5 text-slate-600">
                Developmental milestones and behavioral observations provided
                by the mother are read-only. Specialists cannot edit them.
              </p>
              <hr className="my-1 border-slate-100" />
              <SourceBadge source="ai" />
              <p className="text-xs leading-5 text-slate-600">
                Assessment game scores and AI triage history are read-only
                screening context. AI triage is not a medical diagnosis.
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            Access states explained
          </h2>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-600">
            The same record can move between accessible and locked states as
            consent and appointment conditions change.
          </p>
        </div>
        <Badge tone="brand">Both conditions required</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <AccessState
          tone="ok"
          title="Consent and appointment active"
          copy="Both required conditions are satisfied."
          badge="Accessible"
          badgeTone="success"
          consent
          appointment
          result="Clinical records are accessible and specialist notes can be saved while access remains valid."
        />
        <AccessState
          tone="locked"
          title="Consent revoked"
          copy="The appointment may still be active, but consent is no longer present."
          badge="Locked"
          badgeTone="danger"
          consent={false}
          appointment
          result="Clinical records and note-saving lock immediately. A consultation already in progress is not terminated by consent revocation."
        />
        <AccessState
          tone="expired"
          title="Appointment ended"
          copy="Consent remains active, but there is no active or recently completed appointment."
          badge="Locked"
          badgeTone="warning"
          consent
          appointment={false}
          result="Clinical records lock when the appointment is no longer active. Consent alone is not sufficient."
        />
        <AccessState
          tone="none"
          title="No active relationship"
          copy="Neither access condition is available."
          badge="No access"
          badgeTone="neutral"
          consent={false}
          appointment={false}
          result="No clinical record access. A single condition is never sufficient on its own."
        />
      </div>

      <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
          <Icon name="alert" size={16} />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-amber-950">
            Revoking consent does not end an active consultation
          </p>
          <p className="mt-1 text-[11px] leading-4 text-amber-900/80">
            Revocation must lock clinical records and prevent saving new notes,
            but it must not automatically terminate a call already in progress.
            Live telehealth is outside this static UI phase.
          </p>
        </div>
      </div>

      <Callout
        tone="neutral"
        title="Frontend presentation only"
        icon="shield"
      >
        These cards explain the required behaviour; they do not enforce access.
        Consent and appointment checks must be enforced by the backend/API
        layer. Hiding interface elements alone is not a security control, and
        this preview contains no clinical records.
      </Callout>
    </div>
  )
}
