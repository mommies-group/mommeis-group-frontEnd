export type PatientParent = {
  id: string
  fullName: string
  email: string | null
}

export type Patient = {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  parentId: string
  parent: PatientParent
}

export type Milestone = {
  id: string
  childId: string
  title: string
  description: string | null
  achievedAt: string | null
}

export type MotherObservation = {
  id: string
  childId: string
  content: string
  observedAt: string
}

export type AssessmentScore = {
  id: string
  childId: string
  gameName: string
  score: number
  maxScore: number
  playedAt: string
}

export type TriageRecord = {
  id: string
  childId: string
  riskLevel: string
  summary: string
  createdAt: string
}

export type NoteActivitySnapshot = {
  activityId: string
  title?: string
  durationMinutes?: number
  specialistNotes?: string | null
  isRemoved?: boolean
  createdAt?: string
}

export type ClinicalNote = {
  id: string
  childId: string
  specialistId: string
  content: string
  bookingId?: string | null
  booking?: {
    id: string
    scheduledAt: string
  } | null
  recommendation?: string | null
  activities?: NoteActivitySnapshot[]
  deletedAt?: string | null
  createdAt: string
  updatedAt: string
}

export type ClinicalRecord = {
  child: {
    id: string
    firstName: string
    lastName: string
    dateOfBirth: string
  }
  parent: PatientParent
  milestones: Milestone[]
  observations: MotherObservation[]
  assessments: AssessmentScore[]
  triageHistory: TriageRecord[]
  clinicalNotes: ClinicalNote[]
}

export type NewNoteActivityRequest = {
  title: string
  description?: string | null
  category?: string | null
  developmentalArea?: string | null
  durationMinutes: number
  difficultyLevel?: string | null
  specialistNotes?: string
}

export type CreateClinicalNoteRequest = {
  content: string
  bookingId?: string
  recommendation?: string
  activityIds?: string[]
  specialistNotes?: Record<string, string>
  newActivities?: NewNoteActivityRequest[]
}

export type UpdateClinicalNoteRequest = {
  content?: string
  recommendation?: string
  bookingId?: string
  activityIds?: string[]
  addActivityIds?: string[]
  removeActivityIds?: string[]
  specialistNotes?: Record<string, string>
  newActivities?: NewNoteActivityRequest[]
}
