import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTrips } from '@/hooks/useTrips'
import { TripCard } from '@/components/TripCard'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { HeroSlideshow, type HeroSlide } from '@/components/HeroSlideshow'
import { HeroRouteAnimation } from '@/components/HeroRouteAnimation'
import { ArrowUpDown, CalendarDays, MapPin, Search } from 'lucide-react'
import heroJumbo from '@/assets/jumbo-hero.jpg'
import heroJumbo1200 from '@/assets/jumbo-hero-1200.jpg'
import heroJumbo800 from '@/assets/jumbo-hero-800.jpg'
import jumbo1 from '@/assets/jumbo1.jpg'
import jumbo1_1200 from '@/assets/jumbo1-1200.jpg'
import jumbo1_800 from '@/assets/jumbo1-800.jpg'
import jumbo2 from '@/assets/jumbo2.jpg'
import jumbo2_1200 from '@/assets/jumbo2-1200.jpg'
import jumbo2_800 from '@/assets/jumbo2-800.jpg'
import jumbo3 from '@/assets/jumbo3.jpg'
import jumbo3_1200 from '@/assets/jumbo3-1200.jpg'
import jumbo3_800 from '@/assets/jumbo3-800.jpg'

// Exemples réels de trajets possibles, pour illustrer dans le hero que Kaay
// Dem ne se limite à aucun corridor fixe : chaque trajet a son propre départ
// et sa propre destination, n'importe où à Dakar et ses environs.
const EXEMPLES_TRAJETS: [string, string][] = [
  ['Foire', 'Malika'],
  ['Keur Massar', 'ISEP Diamniadio'],
  ['Keur Massar', 'UAM'],
  ['Yeumbeul', 'UCAD'],
  ['Parcelles Assainies', 'Rufisque'],
  ['Guédiawaye', 'Diamniadio'],
]

const HERO_SLIDES: HeroSlide[] = [
  {
    full: heroJumbo,
    src800: heroJumbo800,
    src1200: heroJumbo1200,
    alt: "Route côtière au coucher de soleil, une voiture roulant vers l'horizon",
  },
  {
    full: jumbo1,
    src800: jumbo1_800,
    src1200: jumbo1_1200,
    alt: "Un passager consulte l'application Kaay Dem sur son téléphone à bord d'une voiture",
  },
  {
    full: jumbo2,
    src800: jumbo2_800,
    src1200: jumbo2_1200,
    alt: 'Un conducteur échange avec son passager pendant un trajet Kaay Dem',
  },
  {
    full: jumbo3,
    src800: jumbo3_800,
    src1200: jumbo3_1200,
    alt: 'Des étudiants se saluent avant de monter en voiture pour un trajet partagé',
  },
]

// Durée totale d'un cycle hero (photo + trajet d'exemple change en même
// temps) et durée du trajet de la voiture à l'intérieur de ce cycle — le
// reste du temps sert à admirer l'arrivée avant le trajet suivant.
const CYCLE_MS = 5000
const TRAVEL_MS = 2200

export function HomeSearch() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [villeDepart, setVilleDepart] = useState(searchParams.get('ville_depart') ?? '')
  const [villeArrivee, setVilleArrivee] = useState(searchParams.get('ville_arrivee') ?? '')
  const [date, setDate] = useState(searchParams.get('date') ?? '')

  // Un seul compteur pilote à la fois la photo de fond et l'exemple de trajet
  // affiché, pour qu'ils changent exactement au même moment plutôt que sur
  // deux minuteries indépendantes et désynchronisées.
  const [cycle, setCycle] = useState(0)

  useEffect(() => {
    const intervalId = setInterval(() => setCycle((c) => c + 1), CYCLE_MS)
    return () => clearInterval(intervalId)
  }, [])

  const imageIndex = cycle % HERO_SLIDES.length
  const [exempleDepart, exempleArrivee] = EXEMPLES_TRAJETS[cycle % EXEMPLES_TRAJETS.length]

  const { data, isLoading, isError } = useTrips({
    ville_depart: searchParams.get('ville_depart') ?? undefined,
    ville_arrivee: searchParams.get('ville_arrivee') ?? undefined,
    date: searchParams.get('date') ?? undefined,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (villeDepart) next.ville_depart = villeDepart
    if (villeArrivee) next.ville_arrivee = villeArrivee
    if (date) next.date = date
    setSearchParams(next)
  }

  function handleEchanger() {
    setVilleDepart(villeArrivee)
    setVilleArrivee(villeDepart)
  }

  return (
    <div>
      {/* Hero — route côtière au coucher de soleil en fond plein écran, en écho direct à la
          palette "Crépuscule sur la Corniche" et au sujet du produit (route, trajet, voiture). */}
      <section className="relative border-b border-border text-sable-50 overflow-hidden">
        <HeroSlideshow slides={HERO_SLIDES} activeIndex={imageIndex} />
        {/* Superposition pour la lisibilité du texte, dans les tons de la marque */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-nuit-950/85 via-nuit-950/70 to-nuit-950/90"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-nuit-950/40 via-transparent to-nuit-950/40"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <p className="font-mono text-sm text-soleil-400 tracking-wide uppercase mb-3">
            Covoiturage étudiant
          </p>
          <h1 className="font-display font-bold text-4xl sm:text-5xl leading-tight max-w-2xl text-pretty drop-shadow-sm">
            Kaay dem ! On y va ensemble.
          </h1>
          <p className="mt-4 max-w-xl text-sable-100/90 text-base sm:text-lg">
            Trouve un trajet partagé par d'autres étudiants, quels que soient ton point de
            départ et ta destination à Dakar et ses environs.
          </p>

          <HeroRouteAnimation
            depart={exempleDepart}
            arrivee={exempleArrivee}
            cycleKey={cycle}
            travelMs={TRAVEL_MS}
            className="mt-8 max-w-md"
          />

          <form
            onSubmit={handleSubmit}
            className="mt-8 max-w-2xl bg-card text-card-foreground rounded-2xl shadow-2xl p-4 sm:p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 sm:items-end"
          >
            <div className="relative flex flex-col gap-1.5">
              <Label htmlFor="depart">Départ</Label>
              <div className="relative">
                <MapPin
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-soleil-500"
                  aria-hidden="true"
                />
                <Input
                  id="depart"
                  name="ville_depart"
                  autoComplete="off"
                  placeholder="Dakar"
                  className="pl-9"
                  value={villeDepart}
                  onChange={(e) => setVilleDepart(e.target.value)}
                />
              </div>
            </div>

            {/* Connecteur "ligne de trajet" + bouton d'inversion, visible en
                mobile uniquement (les champs sont côte à côte dès sm:, le
                geste d'inversion perd son intérêt visuel dans ce cas). Reprend
                le motif signature de l'app (pointillés + points départ/arrivée). */}
            <div className="relative -my-1.5 flex h-6 items-center pl-[18px] sm:hidden" aria-hidden="true">
              <div className="h-6 border-l-2 border-dashed border-border" />
              <button
                type="button"
                onClick={handleEchanger}
                aria-label="Inverser le départ et l'arrivée"
                aria-hidden="false"
                className="absolute left-4 flex size-7 -translate-x-1/2 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-transform hover:scale-110 hover:text-soleil-600 active:scale-95"
              >
                <ArrowUpDown className="size-3.5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="arrivee">Arrivée</Label>
              <div className="relative">
                <MapPin
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-braise-500"
                  aria-hidden="true"
                />
                <Input
                  id="arrivee"
                  name="ville_arrivee"
                  autoComplete="off"
                  placeholder="Diamniadio"
                  className="pl-9"
                  value={villeArrivee}
                  onChange={(e) => setVilleArrivee(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="date">Date</Label>
              <div className="relative">
                <CalendarDays
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="date"
                  name="date"
                  type="date"
                  className="pl-9"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="bg-soleil-500 hover:bg-soleil-600 text-nuit-950 font-semibold gap-2 shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Search className="size-4" aria-hidden="true" />
              Rechercher
            </Button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="font-display font-semibold text-xl mb-6">
          {data ? `${data.meta?.total ?? data.data.length} trajet(s) disponible(s)` : 'Trajets disponibles'}
        </h2>

        {isLoading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        )}

        {isError && (
          <p className="text-braise-600">
            Impossible de charger les trajets pour le moment. Réessaie dans un instant.
          </p>
        )}

        {data && data.data.length === 0 && (
          <div className="text-center py-16 border border-dashed border-border rounded-xl">
            <p className="text-muted-foreground">
              Aucun trajet ne correspond à ta recherche pour l'instant.
            </p>
          </div>
        )}

        {data && data.data.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.data.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
