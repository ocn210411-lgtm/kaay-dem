import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { RouteLine } from '@/components/RouteLine'
import { TripStatusBadge } from '@/components/StatusBadge'
import type { Trip } from '@/lib/types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Star, Users } from 'lucide-react'

export function TripCard({ trip }: { trip: Trip }) {
  const date = new Date(trip.date_heure_depart)
  const initiales = trip.driver.nom
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <Link to={`/trajets/${trip.id}`} className="block group">
      <Card className="transition-all duration-200 hover:shadow-md hover:border-soleil-500/40 h-full">
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-mono">
                {format(date, "EEE d MMM · HH'h'mm", { locale: fr })}
              </span>
            </div>
            <TripStatusBadge statut={trip.statut} />
          </div>

          <RouteLine depart={trip.ville_depart} arrivee={trip.ville_arrivee} arrets={trip.points_arret} />

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <Avatar className="size-8">
                <AvatarImage src={trip.driver.photo ?? undefined} alt="" />
                <AvatarFallback className="text-xs bg-nuit-800 text-sable-50">{initiales}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-medium">{trip.driver.nom}</span>
                {trip.driver.note_moyenne_conducteur != null && (
                  <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                    <Star className="size-3 fill-soleil-500 text-soleil-500" aria-hidden="true" />
                    {trip.driver.note_moyenne_conducteur.toFixed(1)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Users className="size-3.5" aria-hidden="true" />
                {trip.places_disponibles}/{trip.places_totales}
              </span>
              <span className="font-display font-semibold text-lg text-nuit-800">
                {Number(trip.prix_place).toLocaleString('fr-FR')}
                <span className="text-xs font-body font-normal text-muted-foreground ml-0.5">
                  FCFA
                </span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
