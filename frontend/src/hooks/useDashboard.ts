import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { AdminStats, PaginatedResponse, Reservation, Trip } from '@/lib/types'

export function useDriverDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'driver'],
    queryFn: async () => {
      // Contrairement aux autres endpoints, /dashboard/driver construit sa
      // réponse en imbriquant les collections dans un tableau JSON manuel
      // côté backend : elle n'est donc pas enveloppée dans { data: ... }
      // comme le sont les resources Laravel renvoyées seules par un contrôleur.
      const { data } = await api.get<{
        trips: Trip[]
        note_moyenne: number | null
      }>('/dashboard/driver')
      return data
    },
  })
}

/** Réservations reçues sur mes trajets (tous statuts) — onglet "Reçues". */
export function useReceivedReservations() {
  return useQuery({
    queryKey: ['dashboard', 'driver', 'reservations'],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Reservation>>(
        '/dashboard/driver/reservations'
      )
      return data
    },
  })
}

/** Mes réservations envoyées en tant que passager — onglet "Envoyées". */
export function usePassengerDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'passenger'],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Reservation>>('/dashboard/passenger')
      return data
    },
  })
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const { data } = await api.get<AdminStats>('/admin/stats')
      return data
    },
  })
}
