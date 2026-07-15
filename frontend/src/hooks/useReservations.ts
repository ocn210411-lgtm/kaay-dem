import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { PaginatedResponse, Reservation } from '@/lib/types'

export function useMyReservations() {
  return useQuery({
    queryKey: ['reservations', 'mine'],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Reservation>>('/reservations')
      return data
    },
  })
}

export function useTripReservations(tripId: number | undefined) {
  return useQuery({
    queryKey: ['trips', tripId, 'reservations'],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Reservation>>(`/trips/${tripId}/reservations`)
      return data
    },
    enabled: !!tripId,
  })
}

export function useCreateReservation(tripId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (nombre_places: number) => {
      const { data } = await api.post<{ data: Reservation }>(`/trips/${tripId}/reservations`, {
        nombre_places,
      })
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['trips', tripId] })
    },
  })
}

function useReservationAction(action: 'accept' | 'refuse' | 'cancel') {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (reservationId: number) => {
      const { data } = await api.patch<{ data: Reservation }>(
        `/reservations/${reservationId}/${action}`
      )
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['trips'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export const useAcceptReservation = () => useReservationAction('accept')
export const useRefuseReservation = () => useReservationAction('refuse')
export const useCancelReservation = () => useReservationAction('cancel')

export function useCreateReview(reservationId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: { note: number; commentaire?: string }) => {
      const { data } = await api.post(`/reservations/${reservationId}/review`, values)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reservations'] }),
  })
}
