export type SpecialistProfile = {
  id: string
  email: string
  fullName: string
  specialty: string
  licenseNumber: string | null
  phone: string | null
  bio: string | null
  createdAt: string
  updatedAt: string
}

export type UpdateProfileRequest = {
  fullName?: string
  specialty?: string
  licenseNumber?: string | null
  phone?: string | null
  bio?: string | null
  email?: string
}

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type AvailabilitySlot = {
  id: string
  specialistId: string
  dayOfWeek: DayOfWeek
  startTime: string
  endTime: string
}

export type AvailabilitySlotInput = {
  dayOfWeek: DayOfWeek
  startTime: string
  endTime: string
}

export type ReplaceAvailabilityRequest = {
  slots: AvailabilitySlotInput[]
}
