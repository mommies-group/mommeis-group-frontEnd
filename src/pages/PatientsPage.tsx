import { Link } from 'react-router-dom'
import { Icon } from '../components/icons/Icon'
import { ApiErrorNotice } from '../components/ui/ApiErrorNotice'
import { Badge } from '../components/ui/Badge'
import { buttonStyles } from '../components/ui/buttonStyles'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader } from '../components/ui/PageHeader'
import { Skeleton } from '../components/ui/Skeleton'
import { usePatients } from '../hooks/queries/patients/patients.queries'
import { formatBirthDate, initials } from '../lib/format'
import { clinicalNotesPath, patientRecordPath } from '../router/routes'

export function PatientsPage() {
  const patients = usePatients()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Care"
        title="My Patients"
        description="Only children in an active care relationship with you are listed here. Access depends on both consent and an appointment."
      />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
        <Card>
          <CardHeader
            title="Assigned patients"
            description="Consent-eligible children assigned to your care."
          />

          {patients.isError ? (
            <div className="p-5">
              <ApiErrorNotice
                error={patients.error}
                title="Could not load your patients"
                onRetry={() => {
                  void patients.refetch()
                }}
              />
            </div>
          ) : (
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
                      Date of birth
                    </th>
                    <th
                      className="whitespace-nowrap border-b border-slate-200 px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500"
                      scope="col"
                    >
                      Parent/guardian
                    </th>
                    <th
                      className="whitespace-nowrap border-b border-slate-200 px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500"
                      scope="col"
                    >
                      Access
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
                  {patients.isLoading ? (
                    [0, 1, 2].map((row) => (
                      <tr key={row}>
                        <td className="border-b border-slate-100 px-4 py-4">
                          <div className="flex items-center gap-2.5">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                        </td>
                        <td className="border-b border-slate-100 px-4 py-4">
                          <Skeleton className="h-3 w-24" />
                        </td>
                        <td className="border-b border-slate-100 px-4 py-4">
                          <Skeleton className="h-3 w-32" />
                        </td>
                        <td className="border-b border-slate-100 px-4 py-4">
                          <Skeleton className="h-5 w-16 rounded-full" />
                        </td>
                        <td className="border-b border-slate-100 px-4 py-4">
                          <Skeleton className="h-8 w-28 rounded-lg" />
                        </td>
                      </tr>
                    ))
                  ) : patients.data && patients.data.length > 0 ? (
                    patients.data.map((patient) => (
                      <tr
                        className="transition hover:bg-slate-50/70"
                        key={patient.id}
                      >
                        <td className="border-b border-slate-100 px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-teal-200 bg-teal-50 text-[10px] font-bold text-teal-800">
                              {initials(
                                patient.firstName,
                                patient.lastName,
                              )}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-xs font-semibold text-slate-900">
                                {patient.firstName} {patient.lastName}
                              </p>
                              <p className="mt-0.5 text-[10px] text-slate-500">
                                Child ID: {patient.id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="border-b border-slate-100 px-4 py-3.5 text-xs text-slate-600">
                          {formatBirthDate(patient.dateOfBirth)}
                        </td>
                        <td className="border-b border-slate-100 px-4 py-3.5">
                          <p className="text-xs font-medium text-slate-800">
                            {patient.parent.fullName}
                          </p>
                          <p className="mt-0.5 text-[10px] text-slate-500">
                            {patient.parent.email ?? 'No email on file'}
                          </p>
                        </td>
                        <td className="border-b border-slate-100 px-4 py-3.5">
                          <Badge tone="success" dot>
                            Eligible
                          </Badge>
                        </td>
                        <td className="border-b border-slate-100 px-4 py-3.5">
                          <div className="flex flex-wrap gap-1.5">
                            <Link
                              className={buttonStyles({
                                variant: 'secondary',
                                size: 'sm',
                              })}
                              to={patientRecordPath(patient.id)}
                            >
                              <Icon name="id-card" size={12} />
                              Record
                            </Link>
                            <Link
                              className={buttonStyles({
                                variant: 'ghost',
                                size: 'sm',
                              })}
                              to={clinicalNotesPath(patient.id)}
                            >
                              <Icon name="notes" size={12} />
                              Notes
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-4 py-8" colSpan={5}>
                        <EmptyState
                          icon="users"
                          title="No patients to display"
                          description="Patients appear here only when both the consent and appointment conditions are active."
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader
              title="Access requirements"
              description="Both conditions must be active at the same time."
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
        </div>
      </div>
    </div>
  )
}
