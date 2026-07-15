import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { useMe } from '@/hooks/useAuth'

export function ProtectedRoute({ adminOnly = false }: { adminOnly?: boolean }) {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  // Rafraîchit l'utilisateur en mémoire depuis /me à chaque montage d'une
  // route protégée (au-delà d'une minute, cf. staleTime du hook) : sans ça,
  // le `user` persisté en localStorage ne reflète jamais un changement
  // survenu côté serveur après la connexion initiale (ex. un dossier
  // conducteur modifié/revalidé) — invalider la query ['me'] ailleurs dans
  // l'app resterait sans effet tant qu'aucun composant ne l'observe.
  useMe()

  if (!token) {
    return <Navigate to="/connexion" state={{ from: location }} replace />
  }

  if (adminOnly && user && !user.is_admin) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
