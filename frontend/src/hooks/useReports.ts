import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface CreateReportValues {
  utilisateur_signale_id: number
  trip_id?: number | null
  motif: string
}

export function useCreateReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: CreateReportValues) => {
      const { data } = await api.post('/reports', values)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] }),
  })
}
