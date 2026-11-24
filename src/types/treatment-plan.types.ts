export type TreatmentPlanStatus =
  | 'DRAFT'
  | 'PENDING_MOTHER_APPROVAL'
  | 'MODIFICATION_REQUESTED'
  | 'APPROVED'
  | 'PENDING_PAYMENT'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DECLINED'

export type TreatmentSessionStatus =
  | 'SCHEDULED'
  | 'COMPLETED'
  | 'NO_SHOW'
  | 'CANCELLED'

export type TreatmentPlanSession = {
  id: string
  treatmentPlanId?: string
  sessionNumber: number
  scheduledAt: string
  durationMinutes: number
  notes?: string | null
  status: TreatmentSessionStatus
  createdAt?: string
  updatedAt?: string
}

export type TreatmentPlanProgress = {
  completed?: number
  total?: number
  percentage?: number
  [key: string]: unknown
}

export type TreatmentPlan = {
  id: string
  childId: string
  specialistId?: string
  consultationBookingId?: string | null
  title: string
  description?: string | null
  treatmentGoals?: string | null
  totalSessions: number
  sessionDurationMinutes?: number
  sessionFee: number
  currency?: string
  discount?: number
  status: TreatmentPlanStatus
  sessions?: TreatmentPlanSession[]
  progress?: TreatmentPlanProgress | null
  createdAt: string
  updatedAt: string
}

export type TreatmentPlanInvoice = {
  invoiceNumber: string
  totalAmount: number
  sessionCount?: number
  sessionFee?: number
  subtotal?: number
  discount?: number
  currency?: string
  status?: string
  paymentStatus?: string
  [key: string]: unknown
}

export type TreatmentPlanListItem = TreatmentPlan

export type TreatmentPlanPagination = {
  page?: number
  limit?: number
  total?: number
  totalPages?: number
}

export type TreatmentPlanList = {
  items: TreatmentPlanListItem[]
  pagination?: TreatmentPlanPagination
  page?: number
  limit?: number
  total?: number
  totalPages?: number
}

export type TreatmentPlanSessionDraft = {
  sessionNumber: number
  scheduledAt: string
  durationMinutes: number
  notes?: string
}

export type CreateTreatmentPlanRequest = {
  childId: string
  title: string
  description?: string
  treatmentGoals?: string
  totalSessions: number
  sessionDurationMinutes?: number
  sessionFee: number
  currency?: string
  discount?: number
  sessions: TreatmentPlanSessionDraft[]
  consultationBookingId?: string
}

export type UpdateTreatmentPlanRequest = {
  title?: string
  description?: string
  treatmentGoals?: string
  totalSessions?: number
  sessionFee?: number
  discount?: number
  sessions?: TreatmentPlanSessionDraft[]
}

export type CompleteSessionResponse = {
  session: TreatmentPlanSession
  plan: TreatmentPlan
}

export type NoShowSessionResponse = {
  session: TreatmentPlanSession
  plan: TreatmentPlan
}
