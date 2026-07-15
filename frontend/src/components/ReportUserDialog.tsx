import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateReport } from '@/hooks/useReports'
import { extractErrorMessage } from '@/lib/api'
import { toast } from 'sonner'
import { Flag } from 'lucide-react'

const CATEGORIES = [
  { value: 'comportement', label: 'Comportement inapproprié' },
  { value: 'annulation', label: 'Annulation abusive / non-présentation' },
  { value: 'securite', label: 'Problème de sécurité' },
  { value: 'paiement', label: 'Litige lié au paiement' },
  { value: 'autre', label: 'Autre' },
] as const

/**
 * Bouton + boîte de dialogue de signalement, réutilisable partout où un
 * utilisateur peut vouloir signaler un abus (détail de trajet, réservations…).
 * Sans ce composant, aucun utilisateur ne pouvait jamais créer de signalement :
 * la page d'administration restait vide en permanence, même si elle
 * fonctionnait techniquement.
 */
export function ReportUserDialog({
  utilisateurSignaleId,
  utilisateurSignaleNom,
  tripId,
  trigger,
}: {
  utilisateurSignaleId: number
  utilisateurSignaleNom: string
  tripId?: number
  trigger?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [categorie, setCategorie] = useState<string>('')
  const [description, setDescription] = useState('')
  const createReport = useCreateReport()

  function handleSubmit() {
    if (!categorie) {
      toast.error('Choisis une catégorie de signalement.')
      return
    }
    if (description.trim().length < 10) {
      toast.error('Merci de décrire le problème (10 caractères minimum).')
      return
    }

    const categorieLabel = CATEGORIES.find((c) => c.value === categorie)?.label ?? categorie
    const motif = `[${categorieLabel}] ${description.trim()}`

    createReport.mutate(
      {
        utilisateur_signale_id: utilisateurSignaleId,
        trip_id: tripId ?? null,
        motif,
      },
      {
        onSuccess: () => {
          toast.success('Signalement envoyé. Un administrateur va l\'examiner.')
          setOpen(false)
          setCategorie('')
          setDescription('')
        },
        onError: (error) => toast.error(extractErrorMessage(error)),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive gap-1.5">
            <Flag className="size-3.5" aria-hidden="true" />
            Signaler
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display">Signaler {utilisateurSignaleNom}</DialogTitle>
          <DialogDescription>
            Ton signalement est envoyé à un administrateur pour examen. Décris précisément ce qui
            s'est passé.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Catégorie</Label>
            <Select value={categorie} onValueChange={setCategorie}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="report-description">Description</Label>
            <Textarea
              id="report-description"
              placeholder="Explique ce qui s'est passé, avec le plus de détails possible…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={createReport.isPending}
          >
            {createReport.isPending ? 'Envoi…' : 'Envoyer le signalement'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
