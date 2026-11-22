import type { TreatmentPlanStatus } from '../types/treatment-plan.types'

export const treatmentPlanStatusLabels: Record<TreatmentPlanStatus, string> = {
  DRAFT: 'Draft',
  PENDING_MOTHER_APPROVAL: 'Awaiting mother approval',
  MODIFICATION_REQUESTED: 'Changes requested',
  APPROVED: 'Approved',
  PENDING_PAYMENT: 'Awaiting payment',
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  DECLINED: 'Declined',
}

export function treatmentPlanStatusLabel(value: string): string {
  return (
    treatmentPlanStatusLabels[value as TreatmentPlanStatus] ??
    humanizeTreatmentPlanStatus(value)
  )
}

export function humanizeTreatmentPlanStatus(value: string): string {
  return value
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ')
}
