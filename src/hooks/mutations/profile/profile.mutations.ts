import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../../../lib/query-keys'
import {
  replaceAvailability,
  updateProfile,
} from '../../../services/profile/profile.service'
import type {
  AvailabilitySlotInput,
  UpdateProfileRequest,
} from '../../../types/profile.types'

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateProfileRequest) => updateProfile(payload),
    onSuccess: (profile) => {
      queryClient.setQueryData(queryKeys.profile.detail, profile)
      queryClient.setQueryData(queryKeys.auth.currentUser, profile)
    },
  })
}

export function useReplaceAvailability() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (slots: AvailabilitySlotInput[]) => replaceAvailability(slots),
    onSuccess: (slots) => {
      queryClient.setQueryData(queryKeys.availability.detail, slots)
      void queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all })
    },
  })
}
