import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/icons/Icon'
import { ApiErrorNotice } from '../components/ui/ApiErrorNotice'
import { Badge } from '../components/ui/Badge'
import { buttonStyles } from '../components/ui/buttonStyles'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Input } from '../components/ui/Field'
import { PageHeader } from '../components/ui/PageHeader'
import { Skeleton } from '../components/ui/Skeleton'
import { usePatients } from '../hooks/queries/patients/patients.queries'
import { formatBirthDate, initials } from '../lib/format'
import { clinicalNotesPath, patientRecordPath } from '../router/routes'

export function PatientsPage() {
  const patients = usePatients()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    const items = patients.data ?? []

    if (!query) {
      return items
    }

    return items.filter((patient) =>
      `${patient.firstName} ${patient.lastName} ${patient.parent.fullName}`
        .toLowerCase()
        .includes(query),
    )
  }, [patients.data, search])

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="My Patients"
        icon="users"
        actions={
          <>
            <Badge tone="neutral">{patients.data?.length ?? 0} patients</Badge>
            <Link
              className={buttonStyles({ variant: 'secondary', size: 'sm' })}
              to={clinicalNotesPath()}
            >
              <Icon name="notes" size={14} />
              Notes
            </Link>
          </>
        }
      />

      <Card>
        <CardHeader
          title="Assigned patients"
          action={
            <Input
              aria-label="Search patients"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search patients"
              className="h-8 w-52 text-xs"
            />
          }
        />
        <CardBody flush>
          {patients.isError ? (
            <div className="p-4">
              <ApiErrorNotice
                error={patients.error}
                title="Could not load patients"
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
                      className="whitespace-nowrap border-b border-slate-200 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500"
                      scope="col"
                    >
                      Child
                    </th>
                    <th
                      className="whitespace-nowrap border-b border-slate-200 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500"
                      scope="col"
                    >
                      Date of birth
                    </th>
                    <th
                      className="whitespace-nowrap border-b border-slate-200 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500"
                      scope="col"
                    >
                      Parent
                    </th>
                    <th
                      className="whitespace-nowrap border-b border-slate-200 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500"
                      scope="col"
                    >
                      Access
                    </th>
                    <th
                      className="whitespace-nowrap border-b border-slate-200 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500"
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
                        <td className="border-b border-slate-100 px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                        </td>
                        <td className="border-b border-slate-100 px-4 py-3">
                          <Skeleton className="h-3 w-24" />
                        </td>
                        <td className="border-b border-slate-100 px-4 py-3">
                          <Skeleton className="h-3 w-32" />
                        </td>
                        <td className="border-b border-slate-100 px-4 py-3">
                          <Skeleton className="h-5 w-16 rounded-full" />
                        </td>
                        <td className="border-b border-slate-100 px-4 py-3">
                          <Skeleton className="h-8 w-28 rounded-lg" />
                        </td>
                      </tr>
                    ))
                  ) : filtered.length > 0 ? (
                    filtered.map((patient) => (
                      <tr
                        className="transition hover:bg-slate-50/70"
                        key={patient.id}
                      >
                        <td className="border-b border-slate-100 px-4 py-3">
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
                                {patient.id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-600">
                          {formatBirthDate(patient.dateOfBirth)}
                        </td>
                        <td className="border-b border-slate-100 px-4 py-3">
                          <p className="text-xs font-medium text-slate-800">
                            {patient.parent.fullName}
                          </p>
                          <p className="mt-0.5 truncate text-[10px] text-slate-500">
                            {patient.parent.email ?? '—'}
                          </p>
                        </td>
                        <td className="border-b border-slate-100 px-4 py-3">
                          <Badge tone="success" dot>
                            Eligible
                          </Badge>
                        </td>
                        <td className="border-b border-slate-100 px-4 py-3">
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
                          title="No patients"
                          description={
                            search
                              ? 'No patients match this search.'
                              : 'Authorised patients will appear here.'
                          }
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
