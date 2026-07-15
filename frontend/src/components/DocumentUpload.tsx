import { useRef, useState } from 'react'
import { FileCheck2, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Champ d'upload de document avec aperçu (permis recto/verso, carte grise,
 * attestation d'assurance…) pour le dossier de vérification conducteur.
 */
export function DocumentUpload({
  id,
  label,
  file,
  onChange,
  error,
  hint,
  existingUrl,
}: {
  id: string
  label: string
  file: File | null
  onChange: (file: File | null) => void
  error?: string
  hint?: string
  /** Aperçu du document déjà enregistré (mode édition) — remplacé dès qu'un
   * nouveau fichier est choisi, sinon affiché comme valeur par défaut. */
  existingUrl?: string | null
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null
    if (selected) {
      setPreview(URL.createObjectURL(selected))
    } else {
      setPreview(null)
    }
    onChange(selected)
  }

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium block">
        {label}
      </label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          'w-full rounded-lg border-2 border-dashed p-4 flex items-center gap-3 text-left transition-colors cursor-pointer hover:bg-accent/40',
          error ? 'border-destructive' : 'border-border',
          (file || existingUrl) && 'border-lagune-500/60 bg-lagune-500/5'
        )}
      >
        {preview || existingUrl ? (
          <img
            src={preview ?? existingUrl ?? undefined}
            alt=""
            width={48}
            height={48}
            className="size-12 rounded-md object-cover shrink-0"
          />
        ) : (
          <span className="size-12 rounded-md bg-muted flex items-center justify-center shrink-0">
            <Upload className="size-5 text-muted-foreground" aria-hidden="true" />
          </span>
        )}
        <span className="min-w-0">
          {file ? (
            <span className="flex items-center gap-1.5 text-sm font-medium text-lagune-600">
              <FileCheck2 className="size-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{file.name}</span>
            </span>
          ) : existingUrl ? (
            <span className="text-sm text-muted-foreground">
              Document déjà fourni — clique pour le remplacer
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">
              Choisir une photo{hint ? ` — ${hint}` : ''}
            </span>
          )}
        </span>
      </button>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={handleChange}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
