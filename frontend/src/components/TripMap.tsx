import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { findCityCoordinates } from '@/lib/cityCoordinates'

/**
 * Carte interactive du trajet (fonctionnalité bonus du cahier des charges,
 * section 2.3). Priorise les coordonnées GPS exactes choisies par le
 * conducteur (LocationPicker) ; à défaut, retombe sur la position approximative
 * de la ville. Fond OpenStreetMap via Leaflet — pas de clé API requise.
 */

function pinIcon(color: string) {
  return L.divIcon({
    className: '',
    html: `<span style="display:block;width:16px;height:16px;border-radius:9999px;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
}

const DEPART_ICON = pinIcon('#E9A23B') // soleil-500
const ARRET_ICON = pinIcon('#7BB6AC') // lagune-400
const ARRIVEE_ICON = pinIcon('#DD5B2E') // braise-500

export function TripMap({
  depart,
  arrivee,
  arrets = [],
  departLat,
  departLng,
  arriveeLat,
  arriveeLng,
}: {
  depart: string
  arrivee: string
  arrets?: string[]
  departLat?: number | null
  departLng?: number | null
  arriveeLat?: number | null
  arriveeLng?: number | null
}) {
  const departExact: [number, number] | null =
    departLat != null && departLng != null ? [departLat, departLng] : null
  const arriveeExact: [number, number] | null =
    arriveeLat != null && arriveeLng != null ? [arriveeLat, arriveeLng] : null

  const departCoords = departExact ?? findCityCoordinates(depart)
  const arriveeCoords = arriveeExact ?? findCityCoordinates(arrivee)
  const arretsCoords = arrets
    .map((ville) => ({ ville, coords: findCityCoordinates(ville) }))
    .filter((a): a is { ville: string; coords: [number, number] } => a.coords !== null)

  if (!departCoords || !arriveeCoords) {
    return (
      <div className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
        Carte non disponible pour ces localités.
      </div>
    )
  }

  const points: [number, number][] = [departCoords, ...arretsCoords.map((a) => a.coords), arriveeCoords]
  const bounds = L.latLngBounds(points)

  return (
    <div className="rounded-xl overflow-hidden border border-border h-64" aria-label={`Carte du trajet ${depart} vers ${arrivee}`}>
      <MapContainer
        bounds={bounds}
        boundsOptions={{ padding: [24, 24] }}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline
          positions={points}
          pathOptions={{ color: '#E9A23B', weight: 3, dashArray: '2 8', lineCap: 'round' }}
        />
        <Marker position={departCoords} icon={DEPART_ICON}>
          <Popup>
            Départ : {depart}
            {departExact && <><br /><em>Position exacte fournie par le conducteur</em></>}
          </Popup>
        </Marker>
        {arretsCoords.map((a) => (
          <Marker key={a.ville} position={a.coords} icon={ARRET_ICON}>
            <Popup>Arrêt : {a.ville}</Popup>
          </Marker>
        ))}
        <Marker position={arriveeCoords} icon={ARRIVEE_ICON}>
          <Popup>
            Arrivée : {arrivee}
            {arriveeExact && <><br /><em>Position exacte fournie par le conducteur</em></>}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
