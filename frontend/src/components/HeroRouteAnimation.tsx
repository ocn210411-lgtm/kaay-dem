import { useEffect, useState } from 'react'
import { Car, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Version animée et choréographiée de RouteLine, réservée au hero de la page
 * d'accueil : la voiture part du point de départ et trace elle-même la ligne
 * au fur et à mesure qu'elle avance (au lieu d'une ligne pointillée déjà
 * complète sur laquelle elle se contenterait de glisser). Le nom de la
 * destination ne se révèle qu'au moment où la voiture y arrive, pour
 * accentuer l'idée de "trajet en cours" plutôt qu'une simple étiquette.
 *
 * `travelMs` doit rester inférieur à `cycleKey`'s changement d'intervalle
 * (contrôlé par le parent) pour laisser le temps d'admirer l'arrivée avant
 * le prochain trajet.
 */
export function HeroRouteAnimation({
  depart,
  arrivee,
  cycleKey,
  travelMs = 2200,
  className,
}: {
  depart: string
  arrivee: string
  cycleKey: number | string
  travelMs?: number
  className?: string
}) {
  // 'reset'     : voiture et trait remis au départ, SANS transition (sinon la
  //               remise à zéro rejouerait le trajet à l'envers en partant
  //               de l'ancienne position d'arrivée — "la voiture recule").
  // 'traveling' : la transition CSS (durée = travelMs) est activée et la
  //               cible passe à 100% : c'est elle qui produit l'avancée.
  // 'arrived'   : la destination se révèle, la voiture reste à l'arrivée.
  const [phase, setPhase] = useState<'reset' | 'traveling' | 'arrived'>('reset')

  useEffect(() => {
    setPhase('reset')
    // Petit délai (setTimeout, pas requestAnimationFrame — un rAF ne se
    // déclenche jamais si l'onglet est en arrière-plan) : le temps que le
    // navigateur peigne la remise à zéro instantanée avant de basculer vers
    // l'état "en route". Sans ce délai, le changement de position et le
    // changement de durée de transition risquent d'être appliqués dans le
    // même repaint et le trajet aller ne s'animerait jamais.
    const startTimer = setTimeout(() => setPhase('traveling'), 20)
    const arriveTimer = setTimeout(() => setPhase('arrived'), 20 + travelMs)
    return () => {
      clearTimeout(startTimer)
      clearTimeout(arriveTimer)
    }
  }, [cycleKey, travelMs])

  const traveling = phase !== 'reset'
  const arrived = phase === 'arrived'
  const transitionDuration = phase === 'reset' ? '0ms' : `${travelMs}ms`

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* min-w-0 + truncate : un nom de lieu long (« Parcelles Assainies »)
          se tronque avec une ellipse plutôt que d'écraser la ligne de trajet
          ou de déborder sur un petit écran. */}
      <div className="flex items-center gap-2 min-w-0 shrink max-w-[40%]">
        <MapPin className="size-4 text-soleil-500 shrink-0" aria-hidden="true" />
        <span className="font-mono text-sm font-medium truncate">{depart}</span>
      </div>

      <div className="relative flex-1 min-w-10 h-4 flex items-center" role="presentation">
        {/* Rail pointillé discret, toujours présent en arrière-plan */}
        <div className="route-line absolute inset-x-0 opacity-40" />
        {/* Trait plein qui se "trace" derrière la voiture au fur et à mesure */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-soleil-500 transition-[width] ease-in-out"
          style={{
            width: traveling ? 'calc(100% - 14px)' : '0%',
            transitionDuration,
          }}
        />
        <Car
          className="absolute top-1/2 -translate-y-1/2 size-3.5 text-soleil-500 drop-shadow-sm transition-[left] ease-in-out"
          style={{
            left: traveling ? 'calc(100% - 14px)' : '0%',
            transitionDuration,
          }}
          aria-hidden="true"
        />
      </div>

      <div className="flex items-center gap-2 min-w-0 shrink max-w-[40%]">
        <span
          className={cn(
            'font-mono text-sm font-medium truncate transition-opacity duration-300',
            arrived ? 'opacity-100' : 'opacity-0'
          )}
        >
          {arrivee}
        </span>
        <MapPin
          className={cn(
            'size-4 text-braise-500 shrink-0 transition-opacity duration-300',
            arrived ? 'opacity-100' : 'opacity-0'
          )}
          aria-hidden="true"
        />
      </div>
    </div>
  )
}
