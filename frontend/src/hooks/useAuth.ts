import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthStore, type User } from '@/store/auth'

export interface LoginValues {
  email: string
  password: string
}

export interface RegisterValues {
  nom: string
  email: string
  password: string
  password_confirmation: string
  telephone?: string
  campus?: string
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)
  return useMutation({
    mutationFn: async (values: LoginValues) => {
      const { data } = await api.post<{ token: string; user: User }>('/login', values)
      return data
    },
    onSuccess: (data) => setAuth(data.token, data.user),
  })
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth)
  return useMutation({
    mutationFn: async (values: RegisterValues) => {
      const { data } = await api.post<{ token: string; user: User }>('/register', values)
      return data
    },
    onSuccess: (data) => setAuth(data.token, data.user),
  })
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout)
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await api.post('/logout')
    },
    onSettled: () => {
      logout()
      queryClient.clear()
    },
  })
}

export function useMe() {
  const token = useAuthStore((s) => s.token)
  const setUser = useAuthStore((s) => s.setUser)
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      // Laravel enveloppe automatiquement une API Resource renvoyée seule
      // par un contrôleur dans { data: ... } — contrairement à /login et
      // /register qui nichent la resource dans un objet plus large.
      const { data } = await api.get<{ data: User }>('/me')
      setUser(data.data)
      return data.data
    },
    enabled: !!token,
    staleTime: 60_000,
  })
}

export interface DriverRequestValues {
  numero_permis: string
  date_expiration_permis: string
  vehicule_marque: string
  vehicule_modele: string
  vehicule_couleur: string
  vehicule_immatriculation: string
  permis_recto: File
  permis_verso: File
  vehicule_photo: File
  carte_grise: File
  assurance: File
}

export function useRequestDriverStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: DriverRequestValues) => {
      const formData = new FormData()
      for (const [key, value] of Object.entries(values)) {
        formData.append(key, value)
      }
      const { data } = await api.post('/driver-requests', formData)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
  })
}

/** Mise à jour partielle du dossier conducteur existant (véhicule, permis,
 * documents) — tous les champs sont optionnels, seuls ceux fournis changent. */
export interface UpdateDriverProfileValues {
  numero_permis?: string
  date_expiration_permis?: string
  vehicule_marque?: string
  vehicule_modele?: string
  vehicule_couleur?: string
  vehicule_immatriculation?: string
  permis_recto?: File
  permis_verso?: File
  vehicule_photo?: File
  carte_grise?: File
  assurance?: File
}

export function useUpdateDriverProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: UpdateDriverProfileValues) => {
      const formData = new FormData()
      formData.append('_method', 'PUT')
      for (const [key, value] of Object.entries(values)) {
        if (value !== undefined) formData.append(key, value)
      }
      const { data } = await api.post('/driver-profile', formData)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
  })
}
