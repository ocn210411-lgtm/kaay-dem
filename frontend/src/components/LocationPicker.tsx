import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Input } from '@/components/ui/input'
import { Loader2, MapPin, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Sélecteur de localisation exacte (bonus demandé par un conducteur) : recherche
 * d'adresse via Nominatim/OpenStreetMap (gratuit, sans clé API) + carte cliquable
 * pour affiner la position au pixel près. Le conducteur choisit un point précis
 * de départ/arrivée ; le passager pourra ensuite s'y rendre directement (lien
 * itinéraire sur la page de détail du trajet).
 */

const MARKER_ICON = L.divIcon({
  className: '',
  html: `<span style="display:block;width:20px;height:20px;border-radius:9999px 9999px 9999px 0;transform:rotate(-45deg);background:#DD5B2E;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></span>`,
  iconSize: [20, 20],
  iconAnchor: [10, 20],
})

interface NominatimResult {
  display_name: string
  lat: string
  lon: string
}

export interface LocationValue {
  lat: number
  lng: number
}

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function FlyTo({ position }: { position: LocationValue | null }) {
  const map = useMap()
  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], 15, { duration: 0.5 })
    }
  }, [position, map])
  return null
}

export function LocationPicker({
  value,
  onChange,
  searchPlaceholder = 'Chercher une adresse…',
  defaultCenter = [14.6928, -17.4467], // Dakar
}: {
  value: LocationValue | null
  onChange: (value: LocationValue) => void
  searchPlaceholder?: string
  defaultCenter?: [number, number]
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<NominatimResult[]>([])
  const [searching, setSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.trim().length < 3) {
      setResults([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(
            query + ', Sénégal'
          )}`
        )
        const data: NominatimResult[] = await res.json()
        setResults(data)
        setShowResults(true)
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 500)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  function selectResult(result: NominatimResult) {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    onChange({ lat, lng })
    setQuery(result.display_name)
    setShowResults(false)
  }

  const center: [number, number] = value ? [value.lat, value.lng] : defaultCenter

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search
          className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          placeholder={searchPlaceholder}
          className="pl-8"
          autoComplete="off"
        />
        {searching && (
          <Loader2
            className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground"
            aria-hidden="true"
          />
        )}
        {showResults && results.length > 0 && (
          <ul className="absolute z-[1000] mt-1 w-full rounded-md border border-border bg-popover shadow-md max-h-52 overflow-auto">
            {results.map((result, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => selectResult(result)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-start gap-2 cursor-pointer"
                >
                  <MapPin className="size-4 shrink-0 mt-0.5 text-muted-foreground" aria-hidden="true" />
                  <span className="line-clamp-2">{result.display_name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div
        className={cn(
          'rounded-lg overflow-hidden border h-48',
          value ? 'border-border' : 'border-dashed border-muted-foreground/40'
        )}
      >
        <MapContainer center={center} zoom={value ? 15 : 11} scrollWheelZoom={false} className="h-full w-full">
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler
            onPick={(lat, lng) => {
              onChange({ lat, lng })
              setQuery('')
            }}
          />
          <FlyTo position={value} />
          {value && <Marker position={[value.lat, value.lng]} icon={MARKER_ICON} />}
        </MapContainer>
      </div>
      <p className="text-xs text-muted-foreground">
        {value
          ? `Position choisie : ${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}`
          : 'Cherche une adresse ou clique directement sur la carte pour placer le point exact.'}
      </p>
    </div>
  )
}
