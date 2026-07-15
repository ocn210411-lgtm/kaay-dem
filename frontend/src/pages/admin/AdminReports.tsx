import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { PaginatedResponse, Report } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { extractErrorMessage } from '@/lib/api'

export function AdminReports() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'reports'],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Report>>('/admin/reports')
      return data
    },
  })

  const resolve = useMutation({
    mutationFn: async ({ id, statut }: { id: number; statut: 'resolu' | 'rejete' }) => {
      const { data } = await api.patch(`/admin/reports/${id}`, { statut })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] })
      toast.success('Signalement traité.')
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  })

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
      <h1 className="font-display font-semibold text-2xl">Signalements</h1>

      {isLoading && <Skeleton className="h-32 rounded-xl" />}

      {data && data.data.length === 0 && (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <p className="text-muted-foreground">Aucun signalement.</p>
        </div>
      )}

      <div className="space-y-3">
        {data?.data.map((report) => (
          <Card key={report.id}>
            <CardContent className="space-y-2">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <p className="text-sm text-muted-foreground min-w-0 break-words">
                  {report.auteur.nom} a signalé {report.utilisateur_signale.nom}
                </p>
                <Badge variant={report.statut === 'ouvert' ? 'destructive' : 'outline'} className="shrink-0">
                  {report.statut}
                </Badge>
              </div>
              <p className="text-sm">{report.motif}</p>
              {report.statut === 'ouvert' && (
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resolve.mutate({ id: report.id, statut: 'rejete' })}
                  >
                    Rejeter
                  </Button>
                  <Button
                    size="sm"
                    className="bg-lagune-600 hover:bg-lagune-500 text-white"
                    onClick={() => resolve.mutate({ id: report.id, statut: 'resolu' })}
                  >
                    Marquer résolu
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
