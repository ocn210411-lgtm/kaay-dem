import type { ReactNode } from 'react'
import logoFull from '@/assets/brand/logo-full.png'

// Illustration seulement : ni le départ ni la destination ne sont fixes —
// chaque trajet a son propre point de départ et sa propre destination à
// Dakar et ses environs, Kaay Dem ne se limite à aucun corridor précis.
const ETAPES = ['Ton départ', 'Ta destination']

/**
 * Panneau de marque partagé par les écrans de connexion/inscription.
 * Réutilise le motif signature "ligne de trajet" en version verticale,
 * avec un point animé qui parcourt le trajet — pour ancrer l'idée
 * qu'on est sur le point de rejoindre un mouvement, pas juste remplir un formulaire.
 */
function BrandPanel({ quote, quoteAuthor }: { quote: string; quoteAuthor: string }) {
  return (
    <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-b from-nuit-900 to-nuit-950 text-sable-50 px-12 py-14">
      <div
        className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-soleil-500/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-16 bottom-0 size-72 rounded-full bg-braise-500/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative">
        <a href="/" className="inline-flex items-center">
          <img src={logoFull} alt="Kaay Dem !" className="h-10 w-auto" />
        </a>
        <p className="font-mono text-xs text-soleil-400 tracking-widest uppercase mt-10">
          Covoiturage étudiant
        </p>
        <h1 className="font-display font-bold text-4xl leading-[1.15] mt-3 max-w-sm text-pretty">
          Chaque trajet compte une histoire de plus.
        </h1>
      </div>

      {/* Ligne de trajet verticale, signature de la marque, avec point animé */}
      <div className="relative flex-1 flex items-center py-12" aria-hidden="true">
        <div className="relative flex flex-col gap-0 pl-1">
          {ETAPES.map((etape, index) => (
            <div key={etape} className="relative flex items-center gap-4 h-16">
              <div className="relative flex flex-col items-center">
                <span
                  className={
                    index === 0
                      ? 'size-3 rounded-full bg-soleil-500 ring-4 ring-soleil-500/20'
                      : index === ETAPES.length - 1
                        ? 'size-3 rounded-full bg-braise-500 ring-4 ring-braise-500/20'
                        : 'size-2.5 rounded-full bg-lagune-400'
                  }
                />
                {index < ETAPES.length - 1 && (
                  <span className="absolute top-3 w-px h-16 border-l-2 border-dashed border-sable-50/25" />
                )}
              </div>
              <span className="font-mono text-sm text-sable-100/90">{etape}</span>
            </div>
          ))}
          <span className="absolute left-[3px] top-0 size-2 rounded-full bg-soleil-400 shadow-[0_0_12px_2px_rgba(233,162,59,0.7)] animate-kaaydem-travel" />
        </div>
      </div>

      <blockquote className="relative border-l-2 border-soleil-500/60 pl-4 max-w-sm">
        <p className="text-sable-100/90 text-sm leading-relaxed">« {quote} »</p>
        <cite className="block mt-2 text-xs text-soleil-400 not-italic font-mono">
          — {quoteAuthor}
        </cite>
      </blockquote>
    </div>
  )
}

export function AuthLayout({
  children,
  quote,
  quoteAuthor,
}: {
  children: ReactNode
  quote: string
  quoteAuthor: string
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100dvh-4rem)]">
      <BrandPanel quote={quote} quoteAuthor={quoteAuthor} />
      <div className="flex items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
