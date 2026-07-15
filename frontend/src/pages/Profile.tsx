import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { api, extractErrorMessage, extractFieldErrors } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { User } from '@/store/auth'
import { useUpdateDriverProfile } from '@/hooks/useAuth'
import { DocumentUpload } from '@/components/DocumentUpload'
import { Separator } from '@/components/ui/separator'
import { Camera, Car, Eye, EyeOff, IdCard, ShieldCheck } from 'lucide-react'

function useInitiales(nom: string) {
  return nom
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

/* ---------- Onglet Général : photo, nom, téléphone, campus ---------- */

const generalSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères.'),
  telephone: z.string().optional(),
  campus: z.string().optional(),
})

function GeneralTab({ user }: { user: User }) {
  const setUser = useAuthStore((s) => s.setUser)
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const initiales = useInitiales(user.nom)

  const form = useForm<z.infer<typeof generalSchema>>({
    resolver: zodResolver(generalSchema),
    defaultValues: {
      nom: user.nom,
      telephone: user.telephone ?? '',
      campus: user.campus ?? '',
    },
  })

  const updateProfile = useMutation({
    mutationFn: async (values: z.infer<typeof generalSchema>) => {
      const formData = new FormData()
      formData.append('_method', 'PUT')
      formData.append('nom', values.nom)
      if (values.telephone) formData.append('telephone', values.telephone)
      if (values.campus) formData.append('campus', values.campus)
      if (photoFile) formData.append('photo', photoFile)

      // Ne pas fixer manuellement le Content-Type : le navigateur doit ajouter
      // lui-même la "boundary" du multipart, ce qu'il ne fait pas si on l'impose.
      // Laravel enveloppe la resource renvoyée seule par le contrôleur dans { data: ... }.
      const { data } = await api.post<{ data: User }>('/me', formData)
      return data.data
    },
    onSuccess: (data) => {
      setUser(data)
      queryClient.invalidateQueries({ queryKey: ['me'] })
      setPhotoFile(null)
      setPhotoPreview(null)
      toast.success('Profil mis à jour.')
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  })

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Merci de choisir un fichier image.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 2 Mo.")
      return
    }

    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => updateProfile.mutate(values))}
        className="space-y-6"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="size-20">
              <AvatarImage src={photoPreview ?? user.photo ?? undefined} alt="" />
              <AvatarFallback className="bg-nuit-800 text-sable-50 text-2xl">
                {initiales}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex items-center justify-center size-8 rounded-full bg-nuit-800 text-sable-50 ring-2 ring-background hover:bg-nuit-700 transition-colors cursor-pointer"
              aria-label="Changer la photo de profil"
            >
              <Camera className="size-4" aria-hidden="true" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handlePhotoChange}
            />
          </div>
          <div>
            <p className="font-medium">{user.nom}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            {photoPreview && (
              <p className="text-xs text-soleil-600 mt-1">
                Nouvelle photo sélectionnée — enregistre pour l'appliquer.
              </p>
            )}
          </div>
        </div>

        <FormField
          control={form.control}
          name="nom"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom complet</FormLabel>
              <FormControl>
                <Input autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email-readonly">Adresse e-mail</Label>
          <Input id="email-readonly" value={user.email} disabled readOnly />
          <p className="text-xs text-muted-foreground">
            L'adresse e-mail ne peut pas être modifiée pour le moment.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="telephone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone</FormLabel>
                <FormControl>
                  <Input type="tel" autoComplete="tel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="campus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Campus</FormLabel>
                <FormControl>
                  <Input placeholder="Diamniadio" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={updateProfile.isPending}>
          {updateProfile.isPending ? 'Enregistrement…' : 'Enregistrer les modifications'}
        </Button>
      </form>
    </Form>
  )
}

/* ---------- Onglet Sécurité : changement de mot de passe ---------- */

const passwordSchema = z
  .object({
    password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères.'),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Les mots de passe ne correspondent pas.',
    path: ['password_confirmation'],
  })

function SecuriteTab() {
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: '', password_confirmation: '' },
  })

  const updatePassword = useMutation({
    mutationFn: async (values: z.infer<typeof passwordSchema>) => {
      const { data } = await api.post<{ data: User }>('/me', { ...values, _method: 'PUT' })
      return data.data
    },
    onSuccess: () => {
      toast.success('Mot de passe mis à jour.')
      form.reset()
    },
    onError: (error) => {
      toast.error(extractErrorMessage(error))
      const fieldErrors = extractFieldErrors(error)
      for (const [field, message] of Object.entries(fieldErrors)) {
        form.setError(field as keyof z.infer<typeof passwordSchema>, { message })
      }
    },
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => updatePassword.mutate(values))}
        className="space-y-4 max-w-sm"
      >
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nouveau mot de passe</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" aria-hidden="true" />
                    ) : (
                      <Eye className="size-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password_confirmation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmer le nouveau mot de passe</FormLabel>
              <FormControl>
                <Input type={showPassword ? 'text' : 'password'} autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={updatePassword.isPending}>
          {updatePassword.isPending ? 'Mise à jour…' : 'Mettre à jour le mot de passe'}
        </Button>
      </form>
    </Form>
  )
}

/* ---------- Onglet Conducteur : statut, véhicule, note + modification ---------- */

const driverEditSchema = z.object({
  numero_permis: z.string().min(3, 'Numéro de permis requis.'),
  // Optionnelle en édition (contrairement à la demande initiale) : certains
  // dossiers plus anciens n'ont pas encore cette date renseignée, et on ne
  // veut pas bloquer un conducteur qui veut juste changer la couleur de sa
  // voiture en exigeant un champ qu'il ne modifie pas.
  date_expiration_permis: z
    .string()
    .optional()
    .refine((v) => !v || new Date(v) > new Date(), "Le permis doit être encore valide."),
  vehicule_marque: z.string().min(2, 'Marque requise.'),
  vehicule_modele: z.string().min(1, 'Modèle requis.'),
  vehicule_couleur: z.string().min(2, 'Couleur requise.'),
  vehicule_immatriculation: z.string().min(3, 'Immatriculation requise.'),
})

interface DriverDocuments {
  permis_recto: File | null
  permis_verso: File | null
  vehicule_photo: File | null
  carte_grise: File | null
  assurance: File | null
}

function ConducteurTab({ user }: { user: User }) {
  const profile = user.driver_profile
  const updateDriverProfile = useUpdateDriverProfile()
  const [documents, setDocuments] = useState<DriverDocuments>({
    permis_recto: null,
    permis_verso: null,
    vehicule_photo: null,
    carte_grise: null,
    assurance: null,
  })

  const form = useForm<z.infer<typeof driverEditSchema>>({
    resolver: zodResolver(driverEditSchema),
    values: profile
      ? {
          numero_permis: profile.numero_permis,
          date_expiration_permis: profile.date_expiration_permis ?? '',
          vehicule_marque: profile.vehicule.marque,
          vehicule_modele: profile.vehicule.modele,
          vehicule_couleur: profile.vehicule.couleur ?? '',
          vehicule_immatriculation: profile.vehicule.immatriculation,
        }
      : undefined,
  })

  if (!profile) {
    return (
      <div className="text-center py-10">
        <Car className="size-8 mx-auto text-muted-foreground mb-3" aria-hidden="true" />
        <p className="text-muted-foreground mb-4">
          Tu n'as pas encore de profil conducteur. Propose tes propres trajets en quelques minutes.
        </p>
        <Button asChild className="bg-soleil-500 hover:bg-soleil-600 text-nuit-950 font-medium">
          <Link to="/devenir-conducteur">Devenir conducteur</Link>
        </Button>
      </div>
    )
  }

  const statutConfig = {
    en_attente: {
      label: 'En attente de validation',
      className: 'bg-soleil-500/15 text-soleil-600 border-soleil-500/30',
      message: "Ta demande est en cours d'examen par un administrateur.",
    },
    validee: {
      label: 'Validé',
      className: 'bg-lagune-500/15 text-lagune-600 border-lagune-500/30',
      message: 'Ton compte conducteur est validé. Tu peux publier des trajets.',
    },
    rejetee: {
      label: 'Rejetée',
      className: 'bg-braise-500/15 text-braise-600 border-braise-500/30',
      message: profile.motif_rejet ?? 'Ta demande a été rejetée. Corrige ton dossier ci-dessous et renvoie-le.',
    },
  }[profile.statut]

  function setDocument(key: keyof DriverDocuments, file: File | null) {
    setDocuments((prev) => ({ ...prev, [key]: file }))
  }

  function onSubmit(values: z.infer<typeof driverEditSchema>) {
    updateDriverProfile.mutate(
      {
        ...values,
        // Un champ vide envoyé tel quel ferait échouer la validation "date"
        // côté backend (la règle "sometimes" s'applique dès que la clé est
        // présente, même vide) : on omet complètement la clé si elle n'a pas
        // été renseignée, plutôt que d'envoyer une chaîne vide.
        ...(values.date_expiration_permis
          ? { date_expiration_permis: values.date_expiration_permis }
          : { date_expiration_permis: undefined }),
        ...(documents.permis_recto ? { permis_recto: documents.permis_recto } : {}),
        ...(documents.permis_verso ? { permis_verso: documents.permis_verso } : {}),
        ...(documents.vehicule_photo ? { vehicule_photo: documents.vehicule_photo } : {}),
        ...(documents.carte_grise ? { carte_grise: documents.carte_grise } : {}),
        ...(documents.assurance ? { assurance: documents.assurance } : {}),
      },
      {
        onSuccess: () => {
          toast.success('Dossier conducteur mis à jour.')
          setDocuments({
            permis_recto: null,
            permis_verso: null,
            vehicule_photo: null,
            carte_grise: null,
            assurance: null,
          })
        },
        onError: (error) => {
          toast.error(extractErrorMessage(error))
          const fieldErrors = extractFieldErrors(error)
          for (const [field, message] of Object.entries(fieldErrors)) {
            if (field in form.getValues()) {
              form.setError(field as keyof z.infer<typeof driverEditSchema>, { message })
            }
          }
        },
      }
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge variant="outline" className={statutConfig.className}>
            {statutConfig.label}
          </Badge>
          <p className="text-sm text-muted-foreground mt-2">{statutConfig.message}</p>
        </div>
        {profile.statut === 'validee' && (
          <ShieldCheck className="size-8 text-lagune-500 shrink-0" aria-hidden="true" />
        )}
      </div>

      {user.note_moyenne_conducteur != null && (
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">Note moyenne :</span>
          <span>{user.note_moyenne_conducteur.toFixed(1)} / 5</span>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 border-t border-border pt-6">
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
                id="edit_permis_recto"
                label="Photo recto"
                file={documents.permis_recto}
                existingUrl={profile.permis_recto}
                onChange={(f) => setDocument('permis_recto', f)}
              />
              <DocumentUpload
                id="edit_permis_verso"
                label="Photo verso"
                file={documents.permis_verso}
                existingUrl={profile.permis_verso}
                onChange={(f) => setDocument('permis_verso', f)}
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
                      <Input {...field} />
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
                      <Input {...field} />
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
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DocumentUpload
              id="edit_vehicule_photo"
              label="Photo du véhicule"
              file={documents.vehicule_photo}
              existingUrl={profile.vehicule.photo}
              onChange={(f) => setDocument('vehicule_photo', f)}
              hint="vue de face ou 3/4"
            />
            <DocumentUpload
              id="edit_carte_grise"
              label="Carte grise"
              file={documents.carte_grise}
              existingUrl={profile.carte_grise}
              onChange={(f) => setDocument('carte_grise', f)}
            />
            <DocumentUpload
              id="edit_assurance"
              label="Attestation d'assurance"
              file={documents.assurance}
              existingUrl={profile.assurance}
              onChange={(f) => setDocument('assurance', f)}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Modifier le permis ou l'un des documents remet ton dossier « en attente » le temps
            qu'un administrateur le revérifie. Les informations du véhicule (marque, modèle,
            couleur, immatriculation, photo) peuvent être changées librement.
          </p>

          <Button
            type="submit"
            className="w-full bg-soleil-500 hover:bg-soleil-600 text-nuit-950 font-medium"
            disabled={updateDriverProfile.isPending}
          >
            {updateDriverProfile.isPending ? 'Enregistrement…' : 'Enregistrer les modifications'}
          </Button>
        </form>
      </Form>
    </div>
  )
}

/* ---------- Page ---------- */

export function Profile() {
  const user = useAuthStore((s) => s.user)

  if (!user) return null

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display font-semibold text-2xl mb-1">Mon profil</h1>
      <p className="text-muted-foreground mb-8">Gère tes informations, ta sécurité et ton statut conducteur.</p>

      <Card>
        <CardHeader className="sr-only">
          <CardTitle>Paramètres du compte</CardTitle>
          <CardDescription>Informations générales, sécurité et statut conducteur.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general">
            <TabsList className="mb-6">
              <TabsTrigger value="general">Général</TabsTrigger>
              <TabsTrigger value="securite">Sécurité</TabsTrigger>
              <TabsTrigger value="conducteur">Conducteur</TabsTrigger>
            </TabsList>
            <TabsContent value="general">
              <GeneralTab user={user} />
            </TabsContent>
            <TabsContent value="securite">
              <SecuriteTab />
            </TabsContent>
            <TabsContent value="conducteur">
              <ConducteurTab user={user} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
