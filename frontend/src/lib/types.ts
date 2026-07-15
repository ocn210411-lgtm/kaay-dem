import type { User } from '@/store/auth'

export type TripStatut = 'publie' | 'en_cours' | 'termine' | 'annule'
export type ReservationStatut = 'en_attente' | 'confirmee' | 'terminee' | 'annulee' | 'refusee'

export interface Trip {
  id: number
  driver: User
  ville_depart: string
  depart_lat: number | null
  depart_lng: number | null
  ville_arrivee: string
  arrivee_lat: number | null
  arrivee_lng: number | null
  points_arret: string[]
  date_heure_depart: string
  places_totales: number
  places_disponibles: number
  prix_place: number
  statut: TripStatut
  reservations_count?: number
  created_at: string
}

export interface ReservationTransition {
  id: number
  de_statut: string | null
  vers_statut: string
  acteur: User
  created_at: string
}

export interface Review {
  id: number
  reservation_id: number
  note: number
  commentaire: string | null
  created_at: string
}

export interface Reservation {
  id: number
  trip: Trip
  passenger: User
  nombre_places: number
  statut: ReservationStatut
  review?: Review
  transitions?: ReservationTransition[]
  created_at: string
}

export interface Report {
  id: number
  auteur: User
  utilisateur_signale: User
  trip_id: number | null
  motif: string
  statut: 'ouvert' | 'en_cours' | 'resolu' | 'rejete'
  resolution: string | null
  created_at: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta?: {
    current_page: number
    last_page: number
    total: number
    per_page: number
  }
  links?: unknown
}

export interface StatsKpi {
  total: number
  ce_mois: number
  croissance_pct: number
}

export interface AdminStats {
  kpis: {
    utilisateurs: StatsKpi
    trajets: StatsKpi
    reservations: StatsKpi
    revenu_estime: StatsKpi
  }
  utilisateurs_par_mois: { mois: string; total: number; cumule: number }[]
  trajets_par_mois: { mois: string; total: number }[]
  revenus_par_mois: { mois: string; total: number | string }[]
  reservations_par_statut: { statut: ReservationStatut; total: number }[]
  taux_occupation_moyen: number
  taux_annulation: number
  villes_populaires: { ville: string; total: number }[]
  top_conducteurs: { id: number; nom: string; trajets_count: number; note_moyenne: number | null }[]
  activite_recente: { type: 'trajet' | 'reservation'; description: string; date: string }[]
  totaux: {
    utilisateurs: number
    trajets: number
    reservations: number
    conducteurs_valides: number
  }
}
