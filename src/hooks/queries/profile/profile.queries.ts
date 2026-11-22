import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../../../lib/query-keys'
import {
  getAvailability,
  getPricing,
  getProfile,
} from '../../../services/profile/profile.service'

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile.detail,
    queryFn: ({ signal }) => getProfile(signal),
    staleTime: 60_000,
  })
}

export function usePricing() {
  return useQuery({
    queryKey: queryKeys.pricing.detail,
    queryFn: ({ signal }) => getPricing(signal),
    staleTime: 60_000,
  })
}

export function useAvailability() {
  return useQuery({
    queryKey: queryKeys.availability.detail,
    queryFn: ({ signal }) => getAvailability(signal),
    staleTime: 60_000,
  })
}
