import { Icon } from '../components/icons/Icon'
import { Badge } from '../components/ui/Badge'
import { buttonStyles } from '../components/ui/buttonStyles'
import { Callout } from '../components/ui/Callout'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader } from '../components/ui/PageHeader'
import { ROUTES } from '../router/routes'

export function PatientsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Care"
        title="My Patients"
        description="Only children in an active care relationship with you are listed here. Access depends on both consent and an appointment."
        actions={<Badge tone="brand">Relationship-based access</Badge>}
      />

      <Callout
        tone="brand"
        title="No platform-wide patient directory"
        icon="shield"
      >
        This portal does not expose a global patient registry or global search.
        A child appears only when active parental consent for your
        specialist–child relationship and an active or recently completed
        appointment are both present.
      </Callout>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
        <Card>
          <CardHeader
            title="Assigned patients"
            description="Consent-eligible children assigned to your care."
            action={<Badge tone="neutral">No live data</Badge>}
          />
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th
                    className="whitespace-nowrap border-b border-slate-200 px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500"
                    scope="col"
                  >
                    Child
                  </th>
                  <th
                    className="whitespace-nowrap border-b border-slate-200 px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500"
                    scope="col"
                  >
                    Access status
                  </th>
                  <th
                    className="whitespace-nowrap border-b border-slate-200 px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500"
                    scope="col"
                  >
                    Next session
                  </th>
                  <th
                    className="whitespace-nowrap border-b border-slate-200 px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500"
                    scope="col"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-8" colSpan={4}>
                    <EmptyState
                      icon="users"
                      title="No patients to display"
                      description="Patients appear here only when both the consent and appointment conditions are active. No patient records are included in this static preview."
                      action={
                        <a
                          className={buttonStyles({
                            variant: 'secondary',
                            size: 'sm',
                          })}
                          href={`#${ROUTES.privacy}`}
                        >
                          <Icon name="shield" size={13} />
                          Review access rules
                        </a>
                      }
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader
              title="Access requirements"
              description="Both conditions must be active at the same time."
              action={<Badge tone="warning">Both required</Badge>}
            />
            <CardBody>
              <div className="divide-y divide-slate-100">
                <div className="flex gap-3 py-3 first:pt-0">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                    <Icon name="shield" size={13} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800">
                      Active parental consent
                    </p>
                    <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
                      Consent must be active for this specific specialist–child
                      relationship.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 py-3 last:pb-0">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                    <Icon name="calendar" size={13} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800">
                      Active or recently completed appointment
                    </p>
                    <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
                      A booking relationship must be open or recently completed.
                    </p>
                  </div>
                </div>
              </div>

              <hr className="my-4 border-slate-100" />

              <p className="text-[11px] leading-4 text-slate-500">
                If consent is revoked or the appointment expires, clinical
                access and note-saving are locked. One condition alone is never
                sufficient.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="What opens a patient record" />
            <CardBody>
              <div className="grid gap-3">
                <p className="flex gap-2.5 text-xs leading-5 text-slate-600">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                    <Icon name="shield" size={14} />
                  </span>
                  <span>
                    Consent must belong to the exact child–specialist pair.
                  </span>
                </p>
                <p className="flex gap-2.5 text-xs leading-5 text-slate-600">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                    <Icon name="calendar" size={14} />
                  </span>
                  <span>
                    The appointment must be active or recently completed.
                  </span>
                </p>
                <p className="flex gap-2.5 text-xs leading-5 text-slate-600">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                    <Icon name="lock" size={14} />
                  </span>
                  <span>
                    Clinical content stays locked when either condition is
                    missing.
                  </span>
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
