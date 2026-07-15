import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ReservationStatut, TripStatut } from '@/lib/types'
import { Check, Clock, X, Ban, CircleDot } from 'lucide-react'

const RESERVATION_CONFIG: Record<
  ReservationStatut,
  { label: string; className: string; icon: typeof Check }
> = {
  en_attente: { label: 'En attente', className: 'bg-soleil-500/15 text-soleil-600 border-soleil-500/30', icon: Clock },
  confirmee: { label: 'Confirmée', className: 'bg-lagune-500/15 text-lagune-600 border-lagune-500/30', icon: Check },
  terminee: { label: 'Terminée', className: 'bg-nuit-700/10 text-nuit-700 border-nuit-700/20', icon: Check },
  annulee: { label: 'Annulée', className: 'bg-ardoise-600/10 text-ardoise-600 border-ardoise-600/20', icon: Ban },
  refusee: { label: 'Refusée', className: 'bg-braise-500/15 text-braise-600 border-braise-500/30', icon: X },
}

const TRIP_CONFIG: Record<TripStatut, { label: string; className: string; icon: typeof Check }> = {
  publie: { label: 'Publié', className: 'bg-lagune-500/15 text-lagune-600 border-lagune-500/30', icon: CircleDot },
  en_cours: { label: 'En cours', className: 'bg-soleil-500/15 text-soleil-600 border-soleil-500/30', icon: Clock },
  termine: { label: 'Terminé', className: 'bg-nuit-700/10 text-nuit-700 border-nuit-700/20', icon: Check },
  annule: { label: 'Annulé', className: 'bg-ardoise-600/10 text-ardoise-600 border-ardoise-600/20', icon: Ban },
}

export function ReservationStatusBadge({ statut }: { statut: ReservationStatut }) {
  const config = RESERVATION_CONFIG[statut]
  const Icon = config.icon
  return (
    <Badge variant="outline" className={cn('gap-1 font-medium', config.className)}>
      <Icon className="size-3" aria-hidden="true" />
      {config.label}
    </Badge>
  )
}

export function TripStatusBadge({ statut }: { statut: TripStatut }) {
  const config = TRIP_CONFIG[statut]
  const Icon = config.icon
  return (
    <Badge variant="outline" className={cn('gap-1 font-medium', config.className)}>
      <Icon className="size-3" aria-hidden="true" />
      {config.label}
    </Badge>
  )
}
