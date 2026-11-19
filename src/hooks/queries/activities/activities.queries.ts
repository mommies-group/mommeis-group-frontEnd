import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../../../lib/query-keys'
import { getActivities } from '../../../services/activities/activities.service'

export function useActivities() {
  return useQuery({
    queryKey: queryKeys.activities.list,
    queryFn: ({ signal }) => getActivities(signal),
    staleTime: 30_000,
  })
}
