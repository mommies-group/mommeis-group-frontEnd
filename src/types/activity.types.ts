export type ActivityChild = {
  id: string
  firstName: string
  lastName: string
}

export type Activity = {
  id: string
  childId: string
  specialistId: string
  title: string
  instructions: string
  mediaReference: string | null
  durationMinutes: number
  frequency: string
  dueDate: string | null
  completed: boolean
  retractedAt: string | null
  createdAt: string
  updatedAt: string
  child?: ActivityChild
}

export type CreateActivityRequest = {
  title: string
  instructions: string
  mediaReference?: string | null
  durationMinutes: number
  frequency: string
  dueDate?: string | null
}

export type UpdateActivityRequest = Partial<CreateActivityRequest> & {
  completed?: boolean
}
