import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="font-mono text-soleil-500 text-sm mb-2">404</p>
      <h1 className="font-display font-semibold text-2xl mb-3">Page introuvable</h1>
      <p className="text-muted-foreground mb-6">
        Cette page n'existe pas, ou le trajet a peut-être été annulé.
      </p>
      <Button asChild>
        <Link to="/">Retour à la recherche</Link>
      </Button>
    </div>
  )
}
