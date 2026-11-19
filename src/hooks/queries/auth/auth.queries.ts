import { useQuery } from '@tanstack/react-query'
import { useAuthToken } from '../../../lib/auth-token'
import { queryKeys } from '../../../lib/query-keys'
import { getCurrentUser } from '../../../services/auth/auth.service'

export function useCurrentUser() {
  const token = useAuthToken()

  return useQuery({
    queryKey: queryKeys.auth.currentUser,
    queryFn: ({ signal }) => getCurrentUser(signal),
    enabled: Boolean(token),
    staleTime: 5 * 60_000,
  })
}
