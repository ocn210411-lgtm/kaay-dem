import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { useTrip } from '@/hooks/useTrips'
import { useCreateReservation } from '@/hooks/useReservations'
import { useAuthStore } from '@/store/auth'
import { RouteLine } from '@/components/RouteLine'
import { TripMap } from '@/components/TripMap'
import { TripStatusBadge } from '@/components/StatusBadge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Car, Navigation, Star } from 'lucide-react'
import { extractErrorMessage } from '@/lib/api'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import { ReportUserDialog } from '@/components/ReportUserDialog'
import { ImageLightbox } from '@/components/ImageLightbox'

/**
 * Construit un lien Google Maps universel (fonctionne sur mobile et
 * desktop, redirige vers l'app native si installée) pour que le passager
 * puisse se rendre directement au point exact choisi par le conducteur,
 * ou à défaut à la ville renseignée.
 */
function directionsUrl(label: string, lat?: number | null, lng?: number | null): string {
  const destination = lat != null && lng != null ? `${lat},${lng}` : `${label}, Sénégal`
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`
}

export function TripDetail() {
  const { id } = useParams()
  const { data: trip, isLoading } = useTrip(id)
  const user = useAuthStore((s) => s.user)
  const [places, setPlaces] = useState('1')
  const reserver = useCreateReservation(Number(id))

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-muted-foreground">Ce trajet n'existe pas ou a été supprimé.</p>
      </div>
    )
  }

  const initiales = trip.driver.nom
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const estSonPropreTrajet = user?.id === trip.driver.id
  // Le passager doit pouvoir choisir n'importe quel nombre de places jusqu'au
  // nombre réellement disponible sur ce trajet (pas de plafond arbitraire) :
  // s'il reste 8 places, il doit pouvoir toutes les réserver.
  const placesOptions = Array.from({ length: trip.places_disponibles }, (_, i) => i + 1)
  const vehicule = trip.driver.driver_profile?.vehicule

  function handleReserver() {
    reserver.mutate(Number(places), {
      onSuccess: () => toast.success('Réservation envoyée ! En attente de confirmation du conducteur.'),
      onError: (error) => toast.error(extractErrorMessage(error)),
    })
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-semibold text-2xl">Détail du trajet</h1>
        <TripStatusBadge statut={trip.statut} />
      </div>

      <Card>
        <CardContent className="space-y-6">
          <div>
            <p className="font-mono text-sm text-muted-foreground mb-2">
              {format(new Date(trip.date_heure_depart), "EEEE d MMMM yyyy · HH'h'mm", { locale: fr })}
            </p>
            <RouteLine depart={trip.ville_depart} arrivee={trip.ville_arrivee} arrets={trip.points_arret} />
          </div>

          <TripMap
            depart={trip.ville_depart}
            arrivee={trip.ville_arrivee}
            arrets={trip.points_arret}
            departLat={trip.depart_lat}
            departLng={trip.depart_lng}
            arriveeLat={trip.arrivee_lat}
            arriveeLng={trip.arrivee_lng}
          />

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <a
                href={directionsUrl(trip.ville_depart, trip.depart_lat, trip.depart_lng)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Navigation className="size-3.5" aria-hidden="true" />
                Itinéraire vers le départ
              </a>
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <a
                href={directionsUrl(trip.ville_arrivee, trip.arrivee_lat, trip.arrivee_lng)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Navigation className="size-3.5" aria-hidden="true" />
                Itinéraire vers l'arrivée
              </a>
            </Button>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-3 border-t border-border pt-4">
            <div className="flex items-center gap-3 min-w-0">
              <Link to={`#`} className="flex items-center gap-3 min-w-0">
                <Avatar className="size-11 shrink-0">
                  <AvatarImage src={trip.driver.photo ?? undefined} alt="" />
                  <AvatarFallback className="bg-nuit-800 text-sable-50">{initiales}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-medium truncate">{trip.driver.nom}</p>
                  {trip.driver.note_moyenne_conducteur != null ? (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Star className="size-3.5 fill-soleil-500 text-soleil-500 shrink-0" aria-hidden="true" />
                      {trip.driver.note_moyenne_conducteur.toFixed(1)} / 5
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nouveau conducteur</p>
                  )}
                </div>
              </Link>
              {user && !estSonPropreTrajet && (
                <ReportUserDialog
                  utilisateurSignaleId={trip.driver.id}
                  utilisateurSignaleNom={trip.driver.nom}
                  tripId={trip.id}
                />
              )}
            </div>

            <div className="text-right shrink-0">
              <p className="font-display font-bold text-2xl text-nuit-800">
                {Number(trip.prix_place).toLocaleString('fr-FR')}{' '}
                <span className="text-sm font-body font-normal text-muted-foreground">FCFA / place</span>
              </p>
              <p className="text-sm text-muted-foreground">
                {trip.places_disponibles} place(s) disponible(s) sur {trip.places_totales}
              </p>
            </div>
          </div>

          {vehicule && (
            <div className="border-t border-border pt-4">
              <h2 className="text-sm font-semibold flex items-center gap-2 text-nuit-800 mb-3">
                <Car className="size-4" aria-hidden="true" />
                Véhicule
              </h2>
              <div className="flex items-center gap-4">
                {vehicule.photo ? (
                  <ImageLightbox
                    src={vehicule.photo}
                    alt={`${vehicule.marque} ${vehicule.modele}${vehicule.couleur ? `, ${vehicule.couleur}` : ''}`}
                    thumbnailClassName="w-24 h-[72px] rounded-lg overflow-hidden border border-border shrink-0 hover:opacity-90 transition-opacity"
                  />
                ) : (
                  <div className="w-24 h-[72px] rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Car className="size-6 text-muted-foreground" aria-hidden="true" />
                  </div>
                )}
                <div>
                  <p className="font-medium">
                    {vehicule.marque} {vehicule.modele}
                    {vehicule.couleur && <span className="text-muted-foreground"> · {vehicule.couleur}</span>}
                  </p>
                  <p className="text-sm text-muted-foreground font-mono tracking-wide">
                    {vehicule.immatriculation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!estSonPropreTrajet && trip.statut === 'publie' && trip.places_disponibles > 0 && (
            <div className="border-t border-border pt-4 flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
              <div className="flex-1">
                <label className="text-sm font-medium mb-1.5 flex items-center justify-between gap-2" htmlFor="places">
                  <span>Nombre de places</span>
                  <span className="font-normal text-muted-foreground">
                    {trip.places_disponibles} place{trip.places_disponibles > 1 ? 's' : ''} disponible
                    {trip.places_disponibles > 1 ? 's' : ''}
                  </span>
                </label>
                <Select value={places} onValueChange={setPlaces}>
                  <SelectTrigger id="places" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {placesOptions.map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} place{n > 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {user ? (
                <Button
                  onClick={handleReserver}
                  disabled={reserver.isPending}
                  className="bg-soleil-500 hover:bg-soleil-600 text-nuit-950 font-medium"
                >
                  {reserver.isPending ? 'Réservation…' : 'Réserver'}
                </Button>
              ) : (
                <Button
                  className="bg-soleil-500 hover:bg-soleil-600 text-nuit-950 font-medium w-full sm:w-auto shrink-0"
                  asChild
                >
                  <Link to="/connexion">Se connecter pour réserver</Link>
                </Button>
              )}
            </div>
          )}

          {trip.places_disponibles === 0 && trip.statut === 'publie' && (
            <p className="text-sm text-muted-foreground border-t border-border pt-4">
              Ce trajet est complet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
