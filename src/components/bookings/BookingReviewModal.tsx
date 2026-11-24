import { useEffect } from 'react'
import { Icon } from '../icons/Icon'
import { Spinner } from '../ui/Spinner'
import { useBookingById } from '../../hooks/queries/bookings/bookings.queries'
import type { Booking } from '../../types/booking.types'
import { BookingReviewPanel } from './BookingReviewPanel'
import { BookingStatusBadge } from './bookingStatus'

type BookingReviewModalProps = {
  open: boolean
  booking: Booking | null
  isLoading?: boolean
  onClose: () => void
  label?: string
}

export function BookingReviewModal({
  open,
  booking,
  isLoading = false,
  onClose,
  label = 'Booking review',
}: BookingReviewModalProps) {
  const bookingDetail = useBookingById(open ? (booking?.id ?? null) : null)
  const activeBooking = bookingDetail.data ?? booking

  useEffect(() => {
    if (!open) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-slate-300 bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-3.5">
          <div className="flex min-w-0 flex-wrap items-center gap-2.5">
            <h2 className="text-base font-semibold text-slate-900">{label}</h2>
            {activeBooking ? (
              <BookingStatusBadge status={activeBooking.status} />
            ) : null}
          </div>
          <button
            type="button"
            aria-label="Close booking review"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            onClick={onClose}
          >
            <Icon name="close" size={16} />
          </button>
        </div>
        <div className="p-5">
          {isLoading ? (
            <Spinner className="py-10" label="Loading booking details…" />
          ) : (
            <BookingReviewPanel
              key={booking?.id ?? 'loading'}
              booking={booking}
            />
          )}
        </div>
      </div>
    </div>
  )
}
