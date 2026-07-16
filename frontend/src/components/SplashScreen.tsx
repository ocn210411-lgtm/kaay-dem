import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import logoFull from '@/assets/brand/logo-full.png'
import voitureSplash from '@/assets/brand/splash-car.webp'

// Durée totale avant le fondu de sortie automatique. Si l'utilisateur a
// activé "réduire les animations" côté système, la règle @media globale
// (index.css) fait déjà jouer toutes les animations en ~0ms — on raccourcit
// alors aussi l'attente pour ne pas laisser un écran figé plusieurs secondes
// sur un contenu qui, lui, est déjà entièrement apparu.
const DUREE_NORMALE_MS = 3400
const DUREE_REDUITE_MS = 700
const DUREE_FONDU_SORTIE_MS = 500

// splash-car.webp : vraie photo (pas une illustration), vue aérienne d'une
// voiture — demandé explicitement à la place d'un dessin. Source : photo
// "Toy view" de Daniela Bay sur Unsplash (licence Unsplash : usage commercial
// libre, sans attribution requise — https://unsplash.com/license). Recadrée
// et détourée (masque par saturation/luminosité + garde-fou géométrique) pour
// isoler la voiture du bitume et la faire flotter sur le fond sombre du splash.

/**
 * Écran de démarrage : la voiture "arrive" avec ses phares, qui illuminent
 * le nom de l'app et son slogan — mise en scène demandée pour le premier
 * contact avec Kaay Dem !, dans l'esprit d'un vrai splash screen d'app native
 * (et de la référence "Coming Soon" fournie : voiture vue du dessus, phares
 * qui éclairent le titre au-dessus). Cliquer/toucher l'écran permet de passer
 * directement (jamais bloquant).
 */
export function SplashScreen({ onTermine }: { onTermine: () => void }) {
  const [enSortie, setEnSortie] = useState(false)

  useEffect(() => {
    const reduireAnimations = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timer = setTimeout(
      () => setEnSortie(true),
      reduireAnimations ? DUREE_REDUITE_MS : DUREE_NORMALE_MS
    )
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!enSortie) return
    const timer = setTimeout(onTermine, DUREE_FONDU_SORTIE_MS)
    return () => clearTimeout(timer)
  }, [enSortie, onTermine])

  return (
    <div
      role="presentation"
      onClick={() => setEnSortie(true)}
      className={cn(
        'fixed inset-0 z-[100] overflow-hidden bg-black transition-opacity ease-out cursor-pointer',
        enSortie ? 'opacity-0 pointer-events-none duration-500' : 'opacity-100 duration-0'
      )}
    >
      {/* Fond quasi noir, à peine teinté (au lieu d'un dégradé sarcelle bien
          visible) : la référence garde un noir très propre autour de la
          voiture, c'est ce contraste qui rend les phares crédibles. */}
      <div
        className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-soleil-500/5 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-16 bottom-0 size-72 rounded-full bg-braise-500/5 blur-3xl"
        aria-hidden="true"
      />

      <div className="splash-logo absolute inset-x-0 top-12 px-6 text-center sm:top-16">
        <img
          src={logoFull}
          alt="Kaay Dem !"
          className="mx-auto h-12 w-auto drop-shadow-[0_0_20px_rgba(233,162,59,0.35)] sm:h-14"
        />
      </div>

      {/* Bloc "titre + voiture" en une seule colonne, ancrée en bas d'écran :
          le texte n'est plus centré indépendamment dans l'espace disponible
          (ça le décalait du vrai point d'impact des faisceaux selon la
          hauteur d'écran) — il est maintenant à une distance fixe au-dessus
          de la voiture, donc toujours exactement là où la lumière converge,
          quelle que soit la taille de l'écran. */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
        {/* z-10 : le titre doit rester lisible devant les faisceaux, qui
            remontent depuis les phares de la voiture juste en dessous. */}
        <div className="relative z-10 mb-40 px-4 text-center sm:mb-52">
          {/* Nappe de lumière derrière le titre : sans elle, les faisceaux
              (fins, loin en dessous) ne "touchent" jamais vraiment le texte à
              l'œil — cette tache radiale, synchronisée sur le même timing,
              vend l'illusion que la lumière des phares vient bien frapper le
              mur juste derrière "Kaay Dem !", comme sur la référence. */}
          <div
            className="splash-glow-wash pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[130%] w-[160%] max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#fff3d6]/20 blur-3xl"
            aria-hidden="true"
          />
          <h1 className="splash-title font-display text-5xl font-extrabold tracking-tight sm:text-7xl">
            Kaay Dem<span className="text-braise-500">!</span>
          </h1>
          <p className="splash-slogan mt-4 font-mono text-xs uppercase tracking-[0.3em] text-soleil-200/90 sm:text-sm">
            Covoiturage étudiant · simple · sûr · solidaire
          </p>
        </div>

        {/* Uniquement l'avant de la voiture (capot + pare-brise), énorme et
            débordant légèrement du cadre (le fond du splash a overflow-hidden)
            — dans l'esprit de la référence fournie, où seul le nez de la
            voiture est visible, très gros premier plan. inline-block : se
            cale exactement sur la largeur réelle de l'image, pour que les
            faisceaux (positionnés en %) tombent précisément sur ses phares. */}
        <div className="relative z-0 -mb-16 inline-block sm:-mb-20">
          {/* Faisceaux en vrai cône, très flous (comme un halo de phare dans
              l'air, pas une forme vectorielle nette) : blanc chaud plutôt que
              doré saturé, bords adoucis au flou plutôt que tranchés par le
              seul clip-path — dans l'esprit de la référence, où la lumière a
              un vrai grain diffus, pas des triangles plats. */}
          <span
            className="splash-beam absolute bottom-[97%] left-[39%] h-64 w-56 -translate-x-1/2 bg-gradient-to-t from-[#fff3d6]/50 via-[#fff3d6]/15 to-transparent blur-2xl sm:h-80 sm:w-72"
            style={{ clipPath: 'polygon(46% 100%, 54% 100%, 100% 0%, 0% 0%)' }}
            aria-hidden="true"
          />
          <span
            className="splash-beam splash-beam-2 absolute bottom-[97%] left-[65%] h-64 w-56 -translate-x-1/2 bg-gradient-to-t from-[#fff3d6]/50 via-[#fff3d6]/15 to-transparent blur-2xl sm:h-80 sm:w-72"
            style={{ clipPath: 'polygon(46% 100%, 54% 100%, 100% 0%, 0% 0%)' }}
            aria-hidden="true"
          />
          <img
            src={voitureSplash}
            alt=""
            className="splash-car relative z-10 h-[42vh] w-auto max-w-none drop-shadow-[0_10px_40px_rgba(0,0,0,0.6)] sm:h-[50vh]"
            aria-hidden="true"
          />
        </div>
      </div>

      <p className="splash-slogan absolute inset-x-0 bottom-3 z-10 text-center text-[0.65rem] text-sable-100/40">
        Toucher l'écran pour continuer
      </p>

      <span className="sr-only">Chargement de Kaay Dem !</span>
    </div>
  )
}
