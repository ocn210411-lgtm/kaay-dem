import axios from 'axios'
import { useAuthStore } from '@/store/auth'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api/v1',
  headers: {
    Accept: 'application/json',
  },
})

// Intercepteur : injecte le token Bearer sur chaque requête
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Intercepteur : déconnexion automatique si le token n'est plus valide
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  }
)

export interface ApiValidationError {
  message: string
  errors?: Record<string, string[]>
}

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiValidationError>(error)) {
    return error.response?.data?.message ?? "Une erreur est survenue. Veuillez réessayer."
  }
  return "Une erreur est survenue. Veuillez réessayer."
}

export function extractFieldErrors(error: unknown): Record<string, string> {
  if (axios.isAxiosError<ApiValidationError>(error) && error.response?.data?.errors) {
    return Object.fromEntries(
      Object.entries(error.response.data.errors).map(([field, messages]) => [field, messages[0]])
    )
  }
  return {}
}
