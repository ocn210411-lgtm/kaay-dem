import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

/**
 * Rend une miniature cliquable qui ouvre la photo en grand directement sur la
 * même page (Dialog), plutôt que de naviguer vers un nouvel onglet — utilisé
 * aussi bien côté passager (photo du véhicule sur le détail d'un trajet) que
 * côté admin (documents d'un dossier conducteur), pour un comportement
 * cohérent partout où l'app affiche des photos de vérification.
 */
export function ImageLightbox({
  src,
  alt,
  thumbnailClassName,
  children,
}: {
  src: string
  alt: string
  thumbnailClassName?: string
  /** Miniature personnalisée (sinon un <img> par défaut est utilisé). */
  children?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn('block cursor-zoom-in', thumbnailClassName)}
        aria-label={`Agrandir : ${alt}`}
      >
        {children ?? (
          <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" />
        )}
      </button>
      <DialogContent className="max-w-3xl p-2 sm:p-2">
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <img src={src} alt={alt} className="w-full h-auto max-h-[80vh] rounded-md object-contain" />
      </DialogContent>
    </Dialog>
  )
}
