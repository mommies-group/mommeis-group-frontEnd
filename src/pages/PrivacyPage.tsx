import { Icon } from '../components/icons/Icon'
import { Badge } from '../components/ui/Badge'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'

const points = [
  {
    icon: 'shield' as const,
    title: 'Consent-gated clinical access',
    body: 'A patient record is available only while parental consent and an eligible appointment are both active for this specialist relationship.',
  },
  {
    icon: 'lock' as const,
    title: 'Read-only family and AI data',
    body: 'Mother-provided observations and AI-generated scores or triage entries are shown as context and cannot be edited from this portal.',
  },
  {
    icon: 'video' as const,
    title: 'Secure sessions',
    body: 'Meeting links are generated per booking and are intended for the specialist and the authorised family only.',
  },
]

export function PrivacyPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Privacy"
        icon="shield"
        actions={<Badge tone="brand">Consent-aware access</Badge>}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {points.map((point) => (
          <Card key={point.title}>
            <CardHeader title={point.title} />
            <CardBody>
              <p className="text-xs leading-5 text-slate-600">{point.body}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader title="Data handling" />
        <CardBody>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50/60 p-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-teal-700 ring-1 ring-slate-300">
                <Icon name="check" size={14} />
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  Authorised specialists
                </p>
                <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
                  Clinical information is limited to the signed-in specialist.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50/60 p-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-teal-700 ring-1 ring-slate-300">
                <Icon name="clock" size={14} />
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  Access windows
                </p>
                <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
                  Revoked consent removes record access immediately.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50/60 p-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-teal-700 ring-1 ring-slate-300">
                <Icon name="alert" size={14} />
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  Not emergency care
                </p>
                <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
                  MindBloom is not a substitute for emergency services.
                </p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
