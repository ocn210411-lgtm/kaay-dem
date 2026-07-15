import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useLogin } from '@/hooks/useAuth'
import { extractErrorMessage } from '@/lib/api'
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

const schema = z.object({
  email: z.string().min(1, "L'adresse e-mail est requise.").email('Adresse e-mail invalide.'),
  password: z.string().min(1, 'Le mot de passe est requis.'),
})

export function Login() {
  const login = useLogin()
  const navigate = useNavigate()
  const location = useLocation()

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  function onSubmit(values: z.infer<typeof schema>) {
    login.mutate(values, {
      onSuccess: () => {
        toast.success('Connexion réussie. Bon trajet !')
        const from = (location.state as { from?: Location })?.from?.pathname ?? '/'
        navigate(from, { replace: true })
      },
      onError: (error) => {
        toast.error(extractErrorMessage(error))
      },
    })
  }

  return (
    <AuthLayout
      quote="Selon les jours, je covoiture vers des destinations différentes avec d'autres étudiants. Moins cher, moins d'attente."
      quoteAuthor="Fatou, L3 Informatique"
    >
      <p className="font-mono text-xs text-soleil-600 tracking-widest uppercase mb-2">
        Bon retour
      </p>
      <h2 className="font-display font-bold text-3xl text-nuit-900 text-pretty">Connexion</h2>
      <p className="text-muted-foreground mt-2 mb-8">
        Retrouve tes trajets et tes réservations en cours.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mot de passe</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete="current-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full bg-soleil-500 hover:bg-soleil-600 text-nuit-950 font-medium gap-2 mt-2"
            disabled={login.isPending}
          >
            {login.isPending ? 'Connexion…' : 'Se connecter'}
            {!login.isPending && <ArrowRight className="size-4" aria-hidden="true" />}
          </Button>
        </form>
      </Form>

      <p className="text-sm text-muted-foreground text-center mt-8">
        Pas encore de compte ?{' '}
        <Link to="/inscription" className="text-nuit-800 font-medium underline underline-offset-4">
          S'inscrire
        </Link>
      </p>
    </AuthLayout>
  )
}
