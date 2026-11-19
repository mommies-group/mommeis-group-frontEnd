import { Badge } from '../ui/Badge'
import type { BookingStatus } from '../../types/booking.types'
import {
  bookingStatusLabels,
  bookingStatusTones,
} from './bookingStatusMeta'

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <Badge tone={bookingStatusTones[status]} dot>
      {bookingStatusLabels[status]}
    </Badge>
  )
}
