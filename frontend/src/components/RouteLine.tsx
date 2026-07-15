import { cn } from '@/lib/utils'
import { MapPin } from 'lucide-react'

/**
 * Composant signature de Kaay Dem : représente un trajet comme une ligne de
 * transit (départ — pointillés — arrivée), avec des points d'arrêt optionnels.
 * Réutilisé dans le hero, les cartes de trajet, et ailleurs pour ancrer
 * visuellement l'idée de "trajet" dans toute l'interface.
 *
 * Pour la version animée (voiture qui trace le trajet, destination révélée à
 * l'arrivée), voir `HeroRouteAnimation`, dédiée au hero de la page d'accueil.
 */
export function RouteLine({
  depart,
  arrivee,
  arrets = [],
  className,
}: {
  depart: string
  arrivee: string
  arrets?: string[]
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex flex-col items-center shrink-0">
        <MapPin className="size-4 text-soleil-500" aria-hidden="true" />
      </div>
      {/* Les noms de lieux ne sont plus jamais figés (shrink-0) : un nom long
          (« Parcelles Assainies », « ISEP Diamniadio »…) se tronque avec une
          ellipse plutôt que de déborder de la carte sur un petit écran. */}
      <span className="font-mono text-sm font-medium min-w-0 shrink truncate max-w-[40%]">
        {depart}
      </span>
      <div className="route-line flex-1 min-w-4" role="presentation" />
      {arrets.length > 0 && (
        <span className="text-xs text-muted-foreground shrink-0">
          {arrets.length} arrêt{arrets.length > 1 ? 's' : ''}
        </span>
      )}
      <div className="route-line flex-1 min-w-4" role="presentation" />
      <span className="font-mono text-sm font-medium min-w-0 shrink truncate max-w-[40%]">
        {arrivee}
      </span>
      <MapPin className="size-4 text-braise-500 shrink-0" aria-hidden="true" />
    </div>
  )
}

/**
 * Stepper de statut de réservation, dans le même langage visuel que RouteLine :
 * chaque étape du cycle de vie est une "étape du trajet".
 */
const ETAPES = ['en_attente', 'confirmee', 'terminee'] as const
const LABELS: Record<(typeof ETAPES)[number], string> = {
  en_attente: 'En attente',
  confirmee: 'Confirmée',
  terminee: 'Terminée',
}

export function ReservationStepper({ statut }: { statut: string }) {
  if (statut === 'annulee' || statut === 'refusee') {
    return (
      <p className="text-sm text-braise-600 font-medium">
        {statut === 'annulee' ? 'Réservation annulée' : 'Réservation refusée'}
      </p>
    )
  }

  const currentIndex = ETAPES.indexOf(statut as (typeof ETAPES)[number])

  return (
    <div className="flex items-center" role="list" aria-label="Statut de la réservation">
      {ETAPES.map((etape, index) => {
        const atteinte = index <= currentIndex
        return (
          <div key={etape} className="flex items-center flex-1 last:flex-none" role="listitem">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'size-3 rounded-full border-2 transition-colors',
                  atteinte ? 'bg-soleil-500 border-soleil-500' : 'bg-transparent border-border'
                )}
                aria-current={index === currentIndex ? 'step' : undefined}
              />
              <span
                className={cn(
                  'text-xs whitespace-nowrap',
                  atteinte ? 'text-foreground font-medium' : 'text-muted-foreground'
                )}
              >
                {LABELS[etape]}
              </span>
            </div>
            {index < ETAPES.length - 1 && (
              <div
                className={cn(
                  'route-line flex-1 mx-1 mb-4',
                  index < currentIndex ? 'opacity-100' : 'opacity-30'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
