import { cn } from '@/lib/utils'

export interface HeroSlide {
  full: string
  src800: string
  src1200: string
  alt: string
}

/**
 * Diaporama plein écran du hero : affiche plusieurs photos avec un fondu
 * enchaîné lent (crossfade) et un léger effet de zoom ("Ken Burns") sur
 * l'image active, pour un rendu plus cinématique qu'une simple photo
 * statique. Composant contrôlé : l'index actif vient du parent (`HomeSearch`),
 * pour que le changement de photo reste synchronisé avec l'animation de
 * trajet (départ/destination) affichée par-dessus.
 */
export function HeroSlideshow({
  slides,
  activeIndex,
}: {
  slides: HeroSlide[]
  activeIndex: number
}) {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      {slides.map((slide, i) => (
        <img
          key={slide.full}
          src={slide.full}
          srcSet={`${slide.src800} 800w, ${slide.src1200} 1200w, ${slide.full} 1536w`}
          sizes="100vw"
          alt={slide.alt}
          width={1536}
          height={1024}
          fetchPriority={i === 0 ? 'high' : undefined}
          loading={i === 0 ? undefined : 'eager'}
          className={cn(
            'absolute inset-0 h-full w-full object-cover object-center transition-opacity ease-in-out',
            i === activeIndex ? 'opacity-100 animate-kaaydem-kenburns' : 'opacity-0'
          )}
          style={{ transitionDuration: '1500ms' }}
        />
      ))}
    </div>
  )
}
