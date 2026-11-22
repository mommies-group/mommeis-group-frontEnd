import { Badge, type BadgeTone } from '../ui/Badge'
import { humanizeTreatmentPlanStatus } from '../../lib/treatment-plan-status'
import type { TreatmentPlanStatus } from '../../types/treatment-plan.types'

const statusTones: Record<string, BadgeTone> = {
  DRAFT: 'neutral',
  PENDING_MOTHER_APPROVAL: 'warning',
  ACTIVE: 'success',
  COMPLETED: 'success',
  REJECTED: 'danger',
  EXPIRED: 'danger',
  CANCELLED: 'danger',
}

export function StatusBadge({
  status,
}: {
  status: TreatmentPlanStatus | string
}) {
  return (
    <Badge tone={statusTones[status] ?? 'neutral'}>
      {humanizeTreatmentPlanStatus(status)}
    </Badge>
  )
}
