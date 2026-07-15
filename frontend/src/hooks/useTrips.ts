import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { PaginatedResponse, Trip } from '@/lib/types'

export interface TripSearchParams {
  ville_depart?: string
  ville_arrivee?: string
  date?: string
  prix_max?: string
  places_disponibles?: boolean
  page?: number
}

export function useTrips(params: TripSearchParams) {
  return useQuery({
    queryKey: ['trips', params],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Trip>>('/trips', { params })
      return data
    },
  })
}

export function useTrip(id: number | string | undefined) {
  return useQuery({
    queryKey: ['trips', id],
    queryFn: async () => {
      const { data } = await api.get<{ data: Trip }>(`/trips/${id}`)
      return data.data
    },
    enabled: !!id,
  })
}

export interface TripFormValues {
  ville_depart: string
  depart_lat?: number | null
  depart_lng?: number | null
  ville_arrivee: string
  arrivee_lat?: number | null
  arrivee_lng?: number | null
  date_heure_depart: string
  places_totales: number
  prix_place: number
}

export function useCreateTrip() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: TripFormValues) => {
      const { data } = await api.post<{ data: Trip }>('/trips', values)
      return data.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trips'] }),
  })
}

export function useCloseTrip() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (tripId: number) => {
      const { data } = await api.patch<{ data: Trip }>(`/trips/${tripId}/close`)
      return data.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trips'] }),
  })
}

export function useCancelTrip() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (tripId: number) => {
      await api.delete(`/trips/${tripId}`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trips'] }),
  })
}
