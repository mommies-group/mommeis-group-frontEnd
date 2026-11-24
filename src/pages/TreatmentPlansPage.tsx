import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Icon } from "../components/icons/Icon";
import { TreatmentPlanDetailModal } from "../components/treatment-plans/TreatmentPlanDetailModal";
import { StatusBadge } from "../components/treatment-plans/treatment-plan-status";
import { TreatmentPlanFormModal } from "../components/treatment-plans/TreatmentPlanFormModal";
import { ApiErrorNotice } from "../components/ui/ApiErrorNotice";
import { Button } from "../components/ui/Button";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { Field, Select } from "../components/ui/Field";
import { PageHeader } from "../components/ui/PageHeader";
import { Pagination } from "../components/ui/Pagination";
import { Spinner } from "../components/ui/Spinner";
import { usePatients } from "../hooks/queries/patients/patients.queries";
import { useTreatmentPlans } from "../hooks/queries/treatment-plans/treatment-plans.queries";
import { formatDateTime } from "../lib/format";
import { treatmentPlanStatusLabels } from "../lib/treatment-plan-status";
import type { TreatmentPlan } from "../types/treatment-plan.types";

const PAGE_SIZE = 5;

type CreateIntent = {
  childId: string;
  bookingId: string | null;
};

export function TreatmentPlansPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const patients = usePatients();

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [childFilter, setChildFilter] = useState("");
  const hasCreateIntent = searchParams.get("create") === "1";
  const [createIntent, setCreateIntent] = useState<CreateIntent>(() => ({
    childId: hasCreateIntent ? (searchParams.get("childId") ?? "") : "",
    bookingId: hasCreateIntent ? searchParams.get("bookingId") : null,
  }));
  const [formOpen, setFormOpen] = useState(hasCreateIntent);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [detailId, setDetailId] = useState<string | null>(null);

  const plans = useTreatmentPlans(page, PAGE_SIZE, {
    status: statusFilter,
    childId: childFilter,
  });

  useEffect(() => {
    if (!hasCreateIntent) {
      return;
    }

    const next = new URLSearchParams(searchParams);
    next.delete("create");
    next.delete("childId");
    next.delete("bookingId");
    setSearchParams(next, { replace: true });
  }, [hasCreateIntent, searchParams, setSearchParams]);

  const patientName = useMemo(() => {
    const names = new Map<string, string>();
    for (const patient of patients.data ?? []) {
      names.set(patient.id, `${patient.firstName} ${patient.lastName}`.trim());
    }
    return (childId: string) => names.get(childId) ?? childId;
  }, [patients.data]);

  const items = plans.data?.items ?? [];
  const pagination = plans.data?.pagination;
  const total = pagination?.total ?? plans.data?.total ?? items.length;
  const totalPages =
    pagination?.totalPages ??
    plans.data?.totalPages ??
    Math.ceil(total / PAGE_SIZE);
  const currentPage = pagination?.page ?? page;
  const rangeStart = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, total);

  const openCreate = () => {
    setCreateIntent({ childId: childFilter, bookingId: null });
    setEditingPlanId(null);
    setFormOpen(true);
    setFormKey((current) => current + 1);
  };

  const openEdit = (plan: TreatmentPlan) => {
    setDetailId(null);
    setEditingPlanId(plan.id);
    setFormOpen(true);
    setFormKey((current) => current + 1);
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Treatment Plans"
        icon="file"
        description="Create plans, schedule sessions and track progress."
        actions={
          <Button variant="primary" size="sm" onClick={openCreate}>
            <Icon name="plus" size={13} />
            Create plan
          </Button>
        }
      />

      <Card>
        <CardHeader title="My treatment plans" />
        <CardBody className="grid gap-3 sm:grid-cols-2">
          <Field label="Status" htmlFor="plans-status-filter">
            <Select
              id="plans-status-filter"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
            >
              <option value="">All statuses</option>
              {Object.entries(treatmentPlanStatusLabels).map(([value, label]) => (
                <option value={value} key={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Patient" htmlFor="plans-child-filter">
            <Select
              id="plans-child-filter"
              value={childFilter}
              onChange={(event) => {
                setChildFilter(event.target.value);
                setPage(1);
              }}
            >
              <option value="">All patients</option>
              {(patients.data ?? []).map((patient) => (
                <option value={patient.id} key={patient.id}>
                  {patient.firstName} {patient.lastName}
                </option>
              ))}
            </Select>
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={`Plans (${total})`} />
        {plans.isLoading ? (
          <Spinner className="py-10" label="Loading treatment plans…" />
        ) : plans.isError ? (
          <div className="p-5">
            <ApiErrorNotice
              error={plans.error}
              title="Could not load treatment plans"
              onRetry={() => {
                void plans.refetch();
              }}
            />
          </div>
        ) : items.length ? (
          <>
            <div className="space-y-3 p-5">
              {items.map((plan) => (
                <article
                  className="rounded-xl border border-slate-200 bg-white p-4"
                  key={plan.id}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">
                          {plan.title}
                        </p>
                        <StatusBadge status={plan.status} />
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {patientName(plan.childId)} · {plan.totalSessions}{" "}
                        sessions · {plan.currency ?? ""} {plan.sessionFee}
                      </p>
                      <p className="mt-0.5 text-[12px] text-slate-500">
                        Created {formatDateTime(plan.createdAt)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setDetailId(plan.id)}
                    >
                      <Icon name="eye" size={13} />
                      View
                    </Button>
                  </div>
                </article>
              ))}
            </div>
            <div className="ps-8 pb-5">
              <Pagination
                label="Treatment plans"
                onPageChange={setPage}
                page={page}
                rangeEnd={rangeEnd}
                rangeStart={rangeStart}
                total={total}
                totalPages={totalPages}
                flush
              />
            </div>
          </>
        ) : (
          <div className="p-5">
            <EmptyState
              icon="file"
              title="No treatment plans"
              description="Create a plan after completing a consultation, or use Create plan."
            />
          </div>
        )}
      </Card>

      {formOpen ? (
        <TreatmentPlanFormModal
          key={formKey}
          open
          childId={createIntent.childId}
          bookingId={createIntent.bookingId}
          planId={editingPlanId}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            void plans.refetch();
          }}
        />
      ) : null}

      {detailId ? (
        <TreatmentPlanDetailModal
          key={detailId}
          open
          planId={detailId}
          onClose={() => setDetailId(null)}
          onEdit={openEdit}
        />
      ) : null}
    </div>
  );
}
