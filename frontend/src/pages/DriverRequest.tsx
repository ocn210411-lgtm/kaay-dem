import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Navigate, useNavigate } from 'react-router-dom'
import { useRequestDriverStatus } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/auth'
import { extractErrorMessage, extractFieldErrors } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DocumentUpload } from '@/components/DocumentUpload'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { toast } from 'sonner'
import { IdCard, ShieldCheck } from 'lucide-react'

const schema = z.object({
  numero_permis: z.string().min(3, 'Numéro de permis requis.'),
  date_expiration_permis: z
    .string()
    .min(1, "Date d'expiration requise.")
    .refine((v) => new Date(v) > new Date(), "Le permis doit être encore valide."),
  vehicule_marque: z.string().min(2, 'Marque requise.'),
  vehicule_modele: z.string().min(1, 'Modèle requis.'),
  vehicule_couleur: z.string().min(2, 'Couleur requise.'),
  vehicule_immatriculation: z.string().min(3, 'Immatriculation requise.'),
})

type FormValues = z.infer<typeof schema>

interface Documents {
  permis_recto: File | null
  permis_verso: File | null
  vehicule_photo: File | null
  carte_grise: File | null
  assurance: File | null
}

const DOCUMENT_LABELS: Record<keyof Documents, string> = {
  permis_recto: 'Permis de conduire — recto',
  permis_verso: 'Permis de conduire — verso',
  vehicule_photo: 'Photo du véhicule',
  carte_grise: 'Carte grise du véhicule',
  assurance: "Attestation d'assurance",
}

export function DriverRequest() {
  const user = useAuthStore((s) => s.user)
  const requestDriver = useRequestDriverStatus()
  const navigate = useNavigate()
  const [documents, setDocuments] = useState<Documents>({
    permis_recto: null,
    permis_verso: null,
    vehicule_photo: null,
    carte_grise: null,
    assurance: null,
  })
  const [documentErrors, setDocumentErrors] = useState<Partial<Record<keyof Documents, string>>>({})

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      numero_permis: '',
      date_expiration_permis: '',
      vehicule_marque: '',
      vehicule_modele: '',
      vehicule_couleur: '',
      vehicule_immatriculation: '',
    },
  })

  function setDocument(key: keyof Documents, file: File | null) {
    setDocuments((prev) => ({ ...prev, [key]: file }))
    setDocumentErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function onSubmit(values: FormValues) {
    const missing = (Object.keys(DOCUMENT_LABELS) as (keyof Documents)[]).filter(
      (key) => !documents[key]
    )
    if (missing.length > 0) {
      const errors: Partial<Record<keyof Documents, string>> = {}
      for (const key of missing) errors[key] = 'Ce document est requis.'
      setDocumentErrors(errors)
      toast.error('Merci de fournir tous les documents demandés.')
      return
    }

    requestDriver.mutate(
      {
        ...values,
        permis_recto: documents.permis_recto!,
        permis_verso: documents.permis_verso!,
        vehicule_photo: documents.vehicule_photo!,
        carte_grise: documents.carte_grise!,
        assurance: documents.assurance!,
      },
      {
        onSuccess: () => {
          toast.success("Demande envoyée ! Un administrateur va l'examiner sous peu.")
          navigate('/profil')
        },
        onError: (error) => {
          toast.error(extractErrorMessage(error))

          const fieldErrors = extractFieldErrors(error)
          const newDocumentErrors: Partial<Record<keyof Documents, string>> = {}
          for (const [field, message] of Object.entries(fieldErrors)) {
            if (field in DOCUMENT_LABELS) {
              newDocumentErrors[field as keyof Documents] = message
            } else if (field in form.getValues()) {
              form.setError(field as keyof FormValues, { message })
            }
          }
          if (Object.keys(newDocumentErrors).length > 0) {
            setDocumentErrors((prev) => ({ ...prev, ...newDocumentErrors }))
          }
        },
      }
    )
  }

  // Un dossier conducteur existe déjà (en attente, validé ou rejeté) : ce
  // formulaire de première demande n'a plus lieu d'être — la modification
  // se fait désormais depuis l'onglet "Conducteur" du profil.
  if (user?.driver_profile) {
    return <Navigate to="/profil" replace />
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-2xl">Devenir conducteur</CardTitle>
          <CardDescription>
            Renseigne ton permis, ton véhicule et fournis les documents demandés. Un
            administrateur vérifie chaque dossier avant validation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-nuit-800">
                  <IdCard className="size-4" aria-hidden="true" />
                  Permis de conduire
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="numero_permis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numéro de permis</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="date_expiration_permis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date d'expiration</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <DocumentUpload
                    id="permis_recto"
                    label="Photo recto"
                    file={documents.permis_recto}
                    onChange={(f) => setDocument('permis_recto', f)}
                    error={documentErrors.permis_recto}
                  />
                  <DocumentUpload
                    id="permis_verso"
                    label="Photo verso"
                    file={documents.permis_verso}
                    onChange={(f) => setDocument('permis_verso', f)}
                    error={documentErrors.permis_verso}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-nuit-800">
                  <ShieldCheck className="size-4" aria-hidden="true" />
                  Véhicule
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="vehicule_marque"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marque</FormLabel>
                        <FormControl>
                          <Input placeholder="Toyota" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vehicule_modele"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Modèle</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="vehicule_couleur"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Couleur</FormLabel>
                        <FormControl>
                          <Input placeholder="Gris" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vehicule_immatriculation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Immatriculation</FormLabel>
                        <FormControl>
                          <Input placeholder="DK-1234-AB" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DocumentUpload
                  id="vehicule_photo"
                  label="Photo du véhicule"
                  file={documents.vehicule_photo}
                  onChange={(f) => setDocument('vehicule_photo', f)}
                  error={documentErrors.vehicule_photo}
                  hint="vue de face ou 3/4"
                />
                <DocumentUpload
                  id="carte_grise"
                  label="Carte grise"
                  file={documents.carte_grise}
                  onChange={(f) => setDocument('carte_grise', f)}
                  error={documentErrors.carte_grise}
                />
                <DocumentUpload
                  id="assurance"
                  label="Attestation d'assurance"
                  file={documents.assurance}
                  onChange={(f) => setDocument('assurance', f)}
                  error={documentErrors.assurance}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-soleil-500 hover:bg-soleil-600 text-nuit-950 font-medium"
                disabled={requestDriver.isPending}
              >
                {requestDriver.isPending ? 'Envoi…' : 'Envoyer ma demande'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
