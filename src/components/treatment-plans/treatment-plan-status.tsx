import { Badge, type BadgeTone } from '../ui/Badge'
import { treatmentPlanStatusLabel } from '../../lib/treatment-plan-status'
import type { TreatmentPlanStatus } from '../../types/treatment-plan.types'

const statusTones: Record<string, BadgeTone> = {
  DRAFT: 'neutral',
  PENDING_MOTHER_APPROVAL: 'warning',
  MODIFICATION_REQUESTED: 'warning',
  APPROVED: 'info',
  PENDING_PAYMENT: 'warning',
  ACTIVE: 'success',
  COMPLETED: 'success',
  CANCELLED: 'danger',
  DECLINED: 'danger',
}

export function StatusBadge({
  status,
}: {
  status: TreatmentPlanStatus | string
}) {
  return (
    <Badge tone={statusTones[status] ?? 'neutral'}>
      {treatmentPlanStatusLabel(status)}
    </Badge>
  )
}
