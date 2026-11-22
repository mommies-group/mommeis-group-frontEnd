export type CatalogActivitySource = 'GLOBAL' | 'CUSTOM'

export type CatalogActivity = {
  id: string
  title: string
  description: string | null
  instructions: string
  category: string | null
  developmentalArea: string | null
  minAge: number | null
  maxAge: number | null
  durationMinutes: number
  difficultyLevel: string | null
  materials: string | null
  mediaReference: string | null
  createdBySpecialistId: string | null
  isGlobal: boolean
  isActive: boolean
  source: CatalogActivitySource
  createdAt: string
  updatedAt: string
}

export type CatalogActivitySourceFilter = 'all' | 'global' | 'custom'

export type CatalogActivityFilters = {
  source?: CatalogActivitySourceFilter
  category?: string
  developmentalArea?: string
  ageMonths?: number
  search?: string
  signal?: AbortSignal
}

export type CreateCustomActivityRequest = {
  title: string
  description?: string | null
  instructions: string
  category?: string | null
  developmentalArea?: string | null
  minAge?: number | null
  maxAge?: number | null
  durationMinutes: number
  difficultyLevel?: string | null
  materials?: string | null
}

export type UpdateCustomActivityRequest = Partial<CreateCustomActivityRequest>

export type AttachActivitiesRequest = {
  activityIds: string[]
  specialistNotes?: Record<string, string>
}
