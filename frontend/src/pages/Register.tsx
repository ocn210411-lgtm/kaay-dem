import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useRegister } from '@/hooks/useAuth'
import { extractErrorMessage, extractFieldErrors } from '@/lib/api'
import { AuthLayout } from '@/layouts/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { toast } from 'sonner'
import { ArrowRight } from 'lucide-react'

const schema = z
  .object({
    nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères.'),
    email: z.string().email('Adresse e-mail invalide.'),
    password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères.'),
    password_confirmation: z.string(),
    telephone: z.string().optional(),
    campus: z.string().optional(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Les mots de passe ne correspondent pas.',
    path: ['password_confirmation'],
  })

export function Register() {
  const register = useRegister()
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      nom: '',
      email: '',
      password: '',
      password_confirmation: '',
      telephone: '',
      campus: '',
    },
  })

  function onSubmit(values: z.infer<typeof schema>) {
    register.mutate(values, {
      onSuccess: () => {
        toast.success('Bienvenue sur Kaay Dem !')
        navigate('/', { replace: true })
      },
      onError: (error) => {
        toast.error(extractErrorMessage(error))
        const fieldErrors = extractFieldErrors(error)
        for (const [field, message] of Object.entries(fieldErrors)) {
          form.setError(field as keyof z.infer<typeof schema>, { message })
        }
      },
    })
  }

  return (
    <AuthLayout
      quote="J'ai proposé mes trajets pendant tout le semestre, vers là où mes passagers avaient besoin d'aller. Ça paie l'essence et je rencontre du monde."
      quoteAuthor="Amadou, conducteur"
    >
      <p className="font-mono text-xs text-soleil-600 tracking-widest uppercase mb-2">
        Rejoins-nous
      </p>
      <h2 className="font-display font-bold text-3xl text-nuit-900 text-pretty">
        Créer un compte
      </h2>
      <p className="text-muted-foreground mt-2 mb-8">
        Rejoins la communauté étudiante Kaay Dem, en tant que passager ou conducteur.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="nom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom complet</FormLabel>
                <FormControl>
                  <Input autoComplete="name" placeholder="Fatou Ndiaye" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adresse e-mail</FormLabel>
                <FormControl>
                  <Input type="email" autoComplete="email" placeholder="toi@exemple.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-3">
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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mot de passe</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete="new-password" {...field} />
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
                <FormLabel>Confirmer le mot de passe</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full bg-soleil-500 hover:bg-soleil-600 text-nuit-950 font-medium gap-2 mt-2"
            disabled={register.isPending}
          >
            {register.isPending ? 'Création du compte…' : 'Créer mon compte'}
            {!register.isPending && <ArrowRight className="size-4" aria-hidden="true" />}
          </Button>
        </form>
      </Form>

      <p className="text-sm text-muted-foreground text-center mt-8">
        Déjà inscrit ?{' '}
        <Link to="/connexion" className="text-nuit-800 font-medium underline underline-offset-4">
          Se connecter
        </Link>
      </p>
    </AuthLayout>
  )
}
