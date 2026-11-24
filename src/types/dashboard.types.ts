import type { BookingStatus } from './booking.types'

export type DashboardUpcomingAppointment = {
  id: string
  status: BookingStatus
  scheduledAt: string
  child: {
    id: string
    firstName: string
    lastName: string
  }
}

export type DashboardRecentActivity = {
  id: string
  type: 'NOTE' | 'ACTIVITY'
  title: string
  childId?: string | null
  createdAt: string
}

export type DashboardSummary = {
  todaySessions: number
  pendingBookingRequests: number
  activePatients: number
  upcomingAppointments: DashboardUpcomingAppointment[]
  recentActivities: DashboardRecentActivity[]
}
