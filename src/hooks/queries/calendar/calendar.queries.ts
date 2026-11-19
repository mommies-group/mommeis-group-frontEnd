import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../../../lib/query-keys'
import { getCalendar } from '../../../services/calendar/calendar.service'

export function useCalendar(from: string, to: string) {
  return useQuery({
    queryKey: queryKeys.calendar.range(from, to),
    queryFn: ({ signal }) => getCalendar(from, to, signal),
    enabled: Boolean(from && to),
  })
}
