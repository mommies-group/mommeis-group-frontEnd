import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../../../lib/query-keys'
import {
  getCatalogActivities,
  getClinicalNoteActivities,
} from '../../../services/activities/activity-catalog.service'
import type { CatalogActivityFilters } from '../../../types/activity-catalog.types'

export function useCatalogActivities(filters: CatalogActivityFilters = {}) {
  const keyFilters = {
    source: filters.source,
    category: filters.category,
    developmentalArea: filters.developmentalArea,
    ageMonths: filters.ageMonths,
    search: filters.search,
  }

  return useQuery({
    queryKey: queryKeys.activityCatalog.list(keyFilters),
    queryFn: ({ signal }) => getCatalogActivities({ ...filters, signal }),
    staleTime: 60_000,
  })
}

export function useClinicalNoteActivities(noteId?: string | null) {
  return useQuery({
    queryKey: queryKeys.activityCatalog.noteActivities(noteId ?? 'none'),
    queryFn: () => getClinicalNoteActivities(noteId as string),
    enabled: Boolean(noteId),
    staleTime: 60_000,
  })
}
