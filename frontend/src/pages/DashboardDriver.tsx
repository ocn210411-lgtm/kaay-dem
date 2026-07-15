import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDriverDashboard } from '@/hooks/useDashboard'
import { useCreateTrip, useCloseTrip, useCancelTrip } from '@/hooks/useTrips'
import { RouteLine } from '@/components/RouteLine'
import { TripStatusBadge } from '@/components/StatusBadge'
import { ConfirmAction } from '@/components/ConfirmAction'
import { LocationPicker, type LocationValue } from '@/components/LocationPicker'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { toast } from 'sonner'
import { extractErrorMessage } from '@/lib/api'
import { Plus, Star } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const tripSchema = z.object({
  ville_depart: z.string().min(2, 'Ville de départ requise.'),
  ville_arrivee: z.string().min(2, "Ville d'arrivée requise."),
  date_heure_depart: z.string().min(1, 'Date et heure requises.'),
  places_totales: z.coerce.number().min(1).max(8),
  prix_place: z.coerce.number().min(0),
})

type TripFormInput = z.input<typeof tripSchema>
type TripFormOutput = z.output<typeof tripSchema>

function NewTripDialog() {
  const [open, setOpen] = useState(false)
  const [departLocation, setDepartLocation] = useState<LocationValue | null>(null)
  const [arriveeLocation, setArriveeLocation] = useState<LocationValue | null>(null)
  const createTrip = useCreateTrip()
  const form = useForm<TripFormInput, unknown, TripFormOutput>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      ville_depart: '',
      ville_arrivee: '',
      date_heure_depart: '',
      places_totales: 3,
      prix_place: 1000,
    },
  })

  function onSubmit(values: TripFormOutput) {
    createTrip.mutate(
      {
        ...values,
        depart_lat: departLocation?.lat ?? null,
        depart_lng: departLocation?.lng ?? null,
        arrivee_lat: arriveeLocation?.lat ?? null,
        arrivee_lng: arriveeLocation?.lng ?? null,
      },
      {
        onSuccess: () => {
          toast.success('Trajet publié !')
          setOpen(false)
          form.reset()
          setDepartLocation(null)
          setArriveeLocation(null)
        },
        onError: (error) => toast.error(extractErrorMessage(error)),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-soleil-500 hover:bg-soleil-600 text-nuit-950 font-medium gap-2">
          <Plus className="size-4" aria-hidden="true" />
          Publier un trajet
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Nouveau trajet</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="ville_depart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ville de départ</FormLabel>
                    <FormControl>
                      <Input placeholder="Dakar" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ville_arrivee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ville d'arrivée</FormLabel>
                    <FormControl>
                      <Input placeholder="Diamniadio" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Point de départ exact (optionnel)</Label>
              <LocationPicker
                value={departLocation}
                onChange={setDepartLocation}
                searchPlaceholder="Chercher le lieu de prise en charge…"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Point d'arrivée exact (optionnel)</Label>
              <LocationPicker
                value={arriveeLocation}
                onChange={setArriveeLocation}
                searchPlaceholder="Chercher le lieu de dépose…"
              />
            </div>

            <FormField
              control={form.control}
              name="date_heure_depart"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date et heure de départ</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="places_totales"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Places</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={8} {...field} value={field.value as number} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="prix_place"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix / place (FCFA)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step={50} {...field} value={field.value as number} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-soleil-500 hover:bg-soleil-600 text-nuit-950 font-medium"
              disabled={createTrip.isPending}
            >
              {createTrip.isPending ? 'Publication…' : 'Publier'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export function DashboardDriver() {
  const { data, isLoading } = useDriverDashboard()
  const closeTrip = useCloseTrip()
  const cancelTrip = useCancelTrip()

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    )
  }

  const trips = data?.trips ?? []

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-semibold text-2xl">Tableau de bord conducteur</h1>
          {data?.note_moyenne != null && (
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <Star className="size-3.5 fill-soleil-500 text-soleil-500" aria-hidden="true" />
              Note moyenne : {data.note_moyenne.toFixed(1)} / 5
            </p>
          )}
        </div>
        <NewTripDialog />
      </div>

      <section className="space-y-3">
        <h2 className="font-display font-semibold text-lg">Mes trajets</h2>
        {trips.length === 0 && (
          <div className="text-center py-16 border border-dashed border-border rounded-xl">
            <p className="text-muted-foreground">Publie ton premier trajet pour commencer.</p>
          </div>
        )}
        {trips.map((trip) => (
          <Card key={trip.id}>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-mono text-sm text-muted-foreground">
                  {format(new Date(trip.date_heure_depart), "d MMM yyyy · HH'h'mm", { locale: fr })}
                </p>
                <TripStatusBadge statut={trip.statut} />
              </div>
              <RouteLine depart={trip.ville_depart} arrivee={trip.ville_arrivee} />
              <div className="flex items-center justify-between flex-wrap gap-2 pt-2">
                <p className="text-sm text-muted-foreground">
                  {trip.places_disponibles}/{trip.places_totales} places · {trip.reservations_count ?? 0}{' '}
                  réservation(s)
                </p>
                {trip.statut === 'publie' && (
                  <div className="flex gap-2">
                    <ConfirmAction
                      title="Annuler ce trajet ?"
                      description="Les passagers ayant réservé seront prévenus et leurs places libérées. Cette action est définitive."
                      confirmLabel="Annuler le trajet"
                      disabled={cancelTrip.isPending}
                      onConfirm={() => cancelTrip.mutate(trip.id)}
                      trigger={
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:text-destructive"
                          disabled={cancelTrip.isPending}
                        >
                          Annuler
                        </Button>
                      }
                    />
                    <Button size="sm" variant="outline" onClick={() => closeTrip.mutate(trip.id)}>
                      Clôturer
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  )
}
