import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { PaginatedResponse } from '@/lib/types'
import type { DriverProfile, User } from '@/store/auth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { ImageLightbox } from '@/components/ImageLightbox'
import { toast } from 'sonner'
import { extractErrorMessage } from '@/lib/api'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface DriverProfileWithUser extends DriverProfile {
  user: User
}

const DOCUMENTS: { key: keyof DriverProfileWithUser; label: string }[] = [
  { key: 'permis_recto', label: 'Permis (recto)' },
  { key: 'permis_verso', label: 'Permis (verso)' },
  { key: 'carte_grise', label: 'Carte grise' },
  { key: 'assurance', label: 'Assurance' },
]

function DocumentThumbnail({ url, label }: { url: string; label: string }) {
  return (
    <div className="flex flex-col gap-1 shrink-0 w-24">
      <ImageLightbox
        src={url}
        alt={`Document : ${label}`}
        thumbnailClassName="size-24 rounded-md overflow-hidden border border-border bg-muted hover:opacity-90 transition-opacity"
      />
      <span className="text-xs text-muted-foreground text-center line-clamp-1">{label}</span>
    </div>
  )
}

/** Dialogue de rejet : le motif saisi est celui que le conducteur verra sur son profil. */
function RejectDialog({
  profileId,
  onRejected,
}: {
  profileId: number
  onRejected: (motif: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [motif, setMotif] = useState('')

  const reject = useMutation({
    mutationFn: async () => {
      const { data } = await api.patch(`/admin/driver-requests/${profileId}/reject`, {
        motif_rejet: motif,
      })
      return data
    },
    onSuccess: () => {
      onRejected(motif)
      setOpen(false)
      setMotif('')
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        size="sm"
        variant="outline"
        className="text-destructive hover:text-destructive"
        onClick={() => setOpen(true)}
      >
        Rejeter
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display">Rejeter cette demande</DialogTitle>
          <DialogDescription>
            Le motif ci-dessous sera visible par le conducteur sur son profil, pour qu'il sache
            quoi corriger avant de renvoyer son dossier.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="motif_rejet">Motif du rejet</Label>
          <Textarea
            id="motif_rejet"
            placeholder="Ex. : la photo du permis recto est illisible, merci d'en fournir une plus nette."
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={reject.isPending}
          >
            Annuler
          </Button>
          <Button
            className="bg-destructive hover:bg-destructive/90 text-white"
            disabled={reject.isPending || motif.trim().length < 3}
            onClick={() => reject.mutate()}
          >
            {reject.isPending ? 'Envoi…' : 'Confirmer le rejet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function AdminDriverRequests() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'driver-requests'],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<DriverProfileWithUser>>(
        '/admin/driver-requests',
        { params: { statut: 'en_attente' } }
      )
      return data
    },
  })

  const accept = useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.patch(`/admin/driver-requests/${id}/accept`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'driver-requests'] })
      toast.success('Conducteur validé.')
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  })

  function handleRejected() {
    queryClient.invalidateQueries({ queryKey: ['admin', 'driver-requests'] })
    toast.success('Demande rejetée. Le motif a été transmis au conducteur.')
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
      <h1 className="font-display font-semibold text-2xl">Demandes conducteur</h1>

      {isLoading && <Skeleton className="h-32 rounded-xl" />}

      {data && data.data.length === 0 && (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <p className="text-muted-foreground">Aucune demande en attente.</p>
        </div>
      )}

      <div className="space-y-3">
        {data?.data.map((profile) => (
          <Card key={profile.id}>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-medium">{profile.user.nom}</p>
                  <p className="text-sm text-muted-foreground">{profile.user.email}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Permis {profile.numero_permis}
                    {profile.date_expiration_permis && (
                      <>
                        {' '}
                        · expire le{' '}
                        {format(new Date(profile.date_expiration_permis), 'd MMM yyyy', { locale: fr })}
                      </>
                    )}
                    {' '}· {profile.vehicule.marque} {profile.vehicule.modele} (
                    {profile.vehicule.immatriculation})
                  </p>
                </div>
                <div className="flex gap-2">
                  <RejectDialog profileId={profile.id} onRejected={handleRejected} />
                  <Button
                    size="sm"
                    className="bg-lagune-600 hover:bg-lagune-500 text-white"
                    disabled={accept.isPending}
                    onClick={() => accept.mutate(profile.id)}
                  >
                    Valider
                  </Button>
                </div>
              </div>

              <div className="flex gap-3 overflow-x-auto pt-3 border-t border-border">
                {DOCUMENTS.map(({ key, label }) => {
                  const url = profile[key]
                  return typeof url === 'string' ? (
                    <DocumentThumbnail key={key} url={url} label={label} />
                  ) : (
                    <div key={key} className="w-24 shrink-0 text-center">
                      <span className="block size-24 rounded-md border border-dashed border-border bg-muted/40" />
                      <span className="text-xs text-muted-foreground">{label} manquant</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
