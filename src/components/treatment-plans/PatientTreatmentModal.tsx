import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "../icons/Icon";
import { ApiErrorNotice } from "../ui/ApiErrorNotice";
import { Button } from "../ui/Button";
import { buttonStyles } from "../ui/buttonStyles";
import { EmptyState } from "../ui/EmptyState";
import { Pagination } from "../ui/Pagination";
import { Spinner } from "../ui/Spinner";
import { TreatmentPlanDetailModal } from "./TreatmentPlanDetailModal";
import { TreatmentPlanFormModal } from "./TreatmentPlanFormModal";
import { StatusBadge } from "./treatment-plan-status";
import { useTreatmentPlans } from "../../hooks/queries/treatment-plans/treatment-plans.queries";
import { formatDateTime } from "../../lib/format";
import { treatmentPlansCreatePath } from "../../router/routes";

type PatientTreatmentModalProps = {
  open: boolean;
  childId: string;
  onClose: () => void;
};

const PAGE_SIZE = 5;

export function PatientTreatmentModal({
  open,
  childId,
  onClose,
}: PatientTreatmentModalProps) {
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const plans = useTreatmentPlans(open ? page : 1, PAGE_SIZE, { childId });

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !detailId && !editingPlanId) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, detailId, editingPlanId, onClose]);

  if (!open) {
    return null;
  }

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

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
        />
        <div
          aria-labelledby="patient-treatment-title"
          aria-modal="true"
          className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-slate-300 bg-white shadow-2xl"
          role="dialog"
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-300 px-5 py-3.5">
            <div className="min-w-0">
              <h2
                className="truncate text-base font-semibold text-slate-900"
                id="patient-treatment-title"
              >
                Treatment plans
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Plans created for this patient.
              </p>
            </div>
            <button
              aria-label="Close treatment plans"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
              onClick={onClose}
              type="button"
            >
              <Icon name="close" size={15} />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            {plans.isLoading ? (
              <Spinner label="Loading treatment plans…" />
            ) : plans.isError ? (
              <ApiErrorNotice
                context="treatmentPlans"
                error={plans.error}
                title="Could not load treatment plans"
                onRetry={() => {
                  void plans.refetch();
                }}
              />
            ) : items.length ? (
              <div className="space-y-3">
                {items.map((plan) => (
                  <article
                    className="rounded-xl border border-slate-200 bg-white p-4"
                    key={plan.id}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-xs font-semibold text-slate-900">
                            {plan.title}
                          </p>
                          <StatusBadge status={plan.status} />
                        </div>
                        <p className="mt-1 text-[12px] text-slate-500">
                          {plan.totalSessions} sessions ·{" "}
                          {formatDateTime(plan.createdAt)}
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
            ) : (
              <EmptyState
                icon="file"
                title="No treatment"
                description="This patient has no treatment plans yet."
                action={
                  <Link
                    className={buttonStyles({ variant: "primary", size: "sm" })}
                    to={treatmentPlansCreatePath(childId)}
                    onClick={onClose}
                  >
                    <Icon name="plus" size={13} />
                    Create treatment plan
                  </Link>
                }
              />
            )}
          </div>

          {items.length ? (
            <Pagination
              label="Patient treatment plans"
              onPageChange={setPage}
              page={page}
              rangeEnd={rangeEnd}
              rangeStart={rangeStart}
              total={total}
              totalPages={totalPages}
            />
          ) : null}
        </div>
      </div>

      {detailId ? (
        <TreatmentPlanDetailModal
          key={detailId}
          open
          planId={detailId}
          onClose={() => setDetailId(null)}
          onEdit={(plan) => {
            setDetailId(null);
            setEditingPlanId(plan.id);
          }}
        />
      ) : null}

      {editingPlanId ? (
        <TreatmentPlanFormModal
          key={editingPlanId}
          open
          planId={editingPlanId}
          childId={childId}
          onClose={() => setEditingPlanId(null)}
          onSaved={() => {
            void plans.refetch();
          }}
        />
      ) : null}
    </>
  );
}
