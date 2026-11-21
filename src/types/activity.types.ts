export type ActivityStatus =
  | 'ASSIGNED'
  | 'COMPLETED'
  | 'RETRACTED'

export type ActivityCategory =
  | 'SOCIAL_EMOTIONAL'
  | 'COGNITIVE'
  | 'LANGUAGE'
  | 'MOTOR'
  | 'SENSORY'
  | 'BEHAVIORAL'
  | 'SELF_CARE'

export type ActivitySource = 'SPECIALIST' | 'PARENT'

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
  category?: ActivityCategory | string | null
  mediaReference: string | null
  durationMinutes: number
  frequency: string
  dueDate: string | null
  status?: ActivityStatus | string
  source?: ActivitySource | string
  completed?: boolean
  completedAt?: string | null
  retractedAt: string | null
  createdAt: string
  updatedAt: string
  child?: ActivityChild
}

export type CreateActivityRequest = {
  title: string
  instructions: string
  category?: ActivityCategory
  mediaReference?: string | null
  durationMinutes: number
  frequency: string
  dueDate?: string | null
  status?: ActivityStatus
  source?: ActivitySource
}

export type UpdateActivityRequest = Partial<CreateActivityRequest> & {
  completed?: boolean
  status?: ActivityStatus
}

export function getActivityStatus(activity: Activity): ActivityStatus {
  if (activity.status) {
    return activity.status as ActivityStatus
  }

  return activity.completed ? 'COMPLETED' : 'ASSIGNED'
}
