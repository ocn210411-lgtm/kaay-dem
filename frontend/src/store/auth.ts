import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface DriverProfile {
  id: number
  statut: 'en_attente' | 'validee' | 'rejetee'
  motif_rejet?: string | null
  vehicule: {
    marque: string
    modele: string
    couleur: string | null
    immatriculation: string
    photo: string | null
  }
  numero_permis: string
  // Visibles uniquement par le conducteur concerné ou un admin (cf. DriverProfileResource) :
  date_expiration_permis?: string | null
  permis_recto?: string | null
  permis_verso?: string | null
  carte_grise?: string | null
  assurance?: string | null
}

export interface User {
  id: number
  nom: string
  email: string
  telephone: string | null
  campus: string | null
  photo: string | null
  is_admin: boolean
  actif: boolean
  est_conducteur_valide: boolean
  note_moyenne_conducteur: number | null
  driver_profile?: DriverProfile
}

interface AuthState {
  token: string | null
  user: User | null
  setAuth: (token: string, user: User) => void
  setUser: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'kaaydem-auth',
      // Version 1 : purge automatiquement tout état persisté antérieur qui
      // aurait pu être enregistré avec un utilisateur mal formé (ex. bug
      // d'enveloppe API corrigé le 15/07), plutôt que de faire planter l'app
      // au démarrage à cause de données obsolètes en localStorage.
      version: 1,
      migrate: (persistedState) => {
        const state = persistedState as Partial<AuthState> | undefined
        if (!state?.user || typeof state.user.nom !== 'string') {
          return { token: null, user: null }
        }
        return state as AuthState
      },
    }
  )
)
