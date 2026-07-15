import {
  usePassengerDashboard,
  useReceivedReservations,
} from '@/hooks/useDashboard'
import {
  useAcceptReservation,
  useCancelReservation,
  useCreateReview,
  useRefuseReservation,
} from '@/hooks/useReservations'
import { RouteLine } from '@/components/RouteLine'
import { ReservationStepper } from '@/components/RouteLine'
import { ConfirmAction } from '@/components/ConfirmAction'
import { ReportUserDialog } from '@/components/ReportUserDialog'
import { ReservationStatusBadge } from '@/components/StatusBadge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState } from 'react'
import { toast } from 'sonner'
import { extractErrorMessage } from '@/lib/api'
import { Star } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth'

function ReviewForm({ reservationId }: { reservationId: number }) {
  const [note, setNote] = useState(5)
  const [commentaire, setCommentaire] = useState('')
  const createReview = useCreateReview(reservationId)

  return (
    <div className="mt-3 pt-3 border-t border-border space-y-2">
      <p className="text-sm font-medium">Évaluer ce trajet</p>
      <div className="flex gap-1" role="radiogroup" aria-label="Note sur 5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={note === n}
            onClick={() => setNote(n)}
            className="p-0.5"
          >
            <Star
              className={cn(
                'size-6 transition-colors',
                n <= note ? 'fill-soleil-500 text-soleil-500' : 'text-muted-foreground'
              )}
            />
          </button>
        ))}
      </div>
      <Textarea
        placeholder="Un commentaire pour le conducteur (optionnel)"
        value={commentaire}
        onChange={(e) => setCommentaire(e.target.value)}
        rows={2}
      />
      <Button
        size="sm"
        disabled={createReview.isPending}
        onClick={() =>
          createReview.mutate(
            { note, commentaire: commentaire || undefined },
            {
              onSuccess: () => toast.success('Merci pour ton évaluation !'),
              onError: (error) => toast.error(extractErrorMessage(error)),
            }
          )
        }
      >
        {createReview.isPending ? 'Envoi…' : "Envoyer l'évaluation"}
      </Button>
    </div>
  )
}

/** Onglet "Envoyées" : mes réservations en tant que passager. */
function SentReservations() {
  const { data, isLoading } = usePassengerDashboard()
  const cancel = useCancelReservation()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    )
  }

  const reservations = data?.data ?? []

  if (reservations.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-border rounded-xl">
        <p className="text-muted-foreground">
          Tu n'as pas encore réservé de trajet. Cherche une place disponible dès maintenant.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reservations.map((reservation) => (
        <Card key={reservation.id}>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-mono text-sm text-muted-foreground">
                {format(new Date(reservation.trip.date_heure_depart), "d MMM yyyy · HH'h'mm", {
                  locale: fr,
                })}
              </p>
              <span className="text-sm text-muted-foreground">
                {reservation.nombre_places} place(s)
              </span>
            </div>

            <RouteLine
              depart={reservation.trip.ville_depart}
              arrivee={reservation.trip.ville_arrivee}
            />

            <ReservationStepper statut={reservation.statut} />

            <div className="flex items-center justify-between flex-wrap gap-2 pt-2">
              <div className="flex items-center gap-2 min-w-0">
                <p className="text-sm text-muted-foreground truncate">
                  Conducteur : {reservation.trip.driver.nom}
                </p>
                <ReportUserDialog
                  utilisateurSignaleId={reservation.trip.driver.id}
                  utilisateurSignaleNom={reservation.trip.driver.nom}
                  tripId={reservation.trip.id}
                />
              </div>
              {(reservation.statut === 'en_attente' || reservation.statut === 'confirmee') && (
                <ConfirmAction
                  title="Annuler cette réservation ?"
                  description="Cette action est définitive. Ta place sera libérée pour d'autres passagers."
                  confirmLabel="Annuler la réservation"
                  disabled={cancel.isPending}
                  onConfirm={() =>
                    cancel.mutate(reservation.id, {
                      onSuccess: () => toast.success('Réservation annulée.'),
                      onError: (error) => toast.error(extractErrorMessage(error)),
                    })
                  }
                  trigger={
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      disabled={cancel.isPending}
                    >
                      Annuler
                    </Button>
                  }
                />
              )}
            </div>

            {reservation.statut === 'terminee' && !reservation.review && (
              <ReviewForm reservationId={reservation.id} />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/** Onglet "Reçues" : demandes de réservation sur mes trajets (en tant que conducteur). */
function ReceivedReservations() {
  const { data, isLoading } = useReceivedReservations()
  const accept = useAcceptReservation()
  const refuse = useRefuseReservation()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    )
  }

  const reservations = data?.data ?? []

  if (reservations.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-border rounded-xl">
        <p className="text-muted-foreground">
          Aucune réservation reçue pour l'instant sur tes trajets.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reservations.map((reservation) => (
        <Card key={reservation.id}>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-mono text-sm text-muted-foreground">
                {format(new Date(reservation.trip.date_heure_depart), "d MMM yyyy · HH'h'mm", {
                  locale: fr,
                })}
              </p>
              <ReservationStatusBadge statut={reservation.statut} />
            </div>

            <RouteLine depart={reservation.trip.ville_depart} arrivee={reservation.trip.ville_arrivee} />

            <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <p className="text-sm text-muted-foreground truncate">
                  Passager : {reservation.passenger.nom} · {reservation.nombre_places} place(s)
                </p>
                <ReportUserDialog
                  utilisateurSignaleId={reservation.passenger.id}
                  utilisateurSignaleNom={reservation.passenger.nom}
                  tripId={reservation.trip.id}
                />
              </div>
              {reservation.statut === 'en_attente' && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    disabled={refuse.isPending}
                    onClick={() =>
                      refuse.mutate(reservation.id, {
                        onError: (error) => toast.error(extractErrorMessage(error)),
                      })
                    }
                  >
                    Refuser
                  </Button>
                  <Button
                    size="sm"
                    className="bg-lagune-600 hover:bg-lagune-500 text-white"
                    disabled={accept.isPending}
                    onClick={() =>
                      accept.mutate(reservation.id, {
                        onSuccess: () => toast.success('Réservation confirmée.'),
                        onError: (error) => toast.error(extractErrorMessage(error)),
                      })
                    }
                  >
                    Accepter
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function DashboardPassenger() {
  const user = useAuthStore((s) => s.user)
  const estConducteur = user?.est_conducteur_valide ?? false

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
      <h1 className="font-display font-semibold text-2xl">Mes réservations</h1>

      {estConducteur ? (
        <Tabs defaultValue="recues">
          <TabsList>
            <TabsTrigger value="recues">Reçues</TabsTrigger>
            <TabsTrigger value="envoyees">Envoyées</TabsTrigger>
          </TabsList>
          <TabsContent value="recues" className="mt-4">
            <ReceivedReservations />
          </TabsContent>
          <TabsContent value="envoyees" className="mt-4">
            <SentReservations />
          </TabsContent>
        </Tabs>
      ) : (
        <SentReservations />
      )}
    </div>
  )
}
