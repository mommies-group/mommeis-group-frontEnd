import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../../../lib/query-keys'
import {
  createAvailabilitySlot,
  deleteAvailabilitySlot,
  replaceAvailability,
  updateAvailabilitySlot,
  updateProfile,
} from '../../../services/profile/profile.service'
import type {
  AvailabilitySlotInput,
  AvailabilitySlotPatch,
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

export function useCreateAvailabilitySlot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: AvailabilitySlotInput) =>
      createAvailabilitySlot(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.availability.detail,
      })
      void queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all })
    },
  })
}

export function useUpdateAvailabilitySlot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: AvailabilitySlotPatch
    }) => updateAvailabilitySlot(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.availability.detail,
      })
      void queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all })
    },
  })
}

export function useDeleteAvailabilitySlot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteAvailabilitySlot(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.availability.detail,
      })
      void queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all })
    },
  })
}
