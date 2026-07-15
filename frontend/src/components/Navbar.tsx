import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { useLogout } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell, Car, LayoutDashboard, LogOut, Shield, User as UserIcon } from 'lucide-react'

export function Navbar() {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()
  const navigate = useNavigate()

  // Garde défensive : si des données persistées corrompues/obsolètes (ancien
  // format localStorage) font que `user.nom` n'est pas une chaîne, on retombe
  // sur "undefined" plutôt que de planter toute la navbar.
  const initiales =
    user && typeof user.nom === 'string'
      ? user.nom
          .split(' ')
          .map((p) => p[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()
      : undefined

  return (
    <header
      className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <nav className="mx-auto max-w-6xl flex items-center justify-between gap-4 px-4 h-16">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="font-display font-bold text-lg text-nuit-800">
            Kaay Dem<span className="text-braise-500">!</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              {!user.is_admin && user.est_conducteur_valide && (
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
                  <Link to="/tableau-de-bord/conducteur">Mes trajets</Link>
                </Button>
              )}
              {!user.is_admin && (
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
                  <Link to="/tableau-de-bord/passager">Mes réservations</Link>
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full ml-1" aria-label="Menu du compte">
                    <Avatar className="size-8">
                      <AvatarImage src={user.photo ?? undefined} alt="" />
                      <AvatarFallback className="text-xs bg-nuit-800 text-sable-50">
                        {initiales}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="truncate">{user.nom}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profil')}>
                    <UserIcon className="size-4" /> Mon profil
                  </DropdownMenuItem>
                  {!user.is_admin && (
                    <>
                      {/* "Mes trajets" n'est visible qu'à partir de sm: dans la barre
                          principale (place limitée) : le reprendre ici garantit qu'un
                          conducteur validé peut toujours y accéder sur mobile. */}
                      {user.est_conducteur_valide && (
                        <DropdownMenuItem
                          className="sm:hidden"
                          onClick={() => navigate('/tableau-de-bord/conducteur')}
                        >
                          <Car className="size-4" /> Mes trajets
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="sm:hidden"
                        onClick={() => navigate('/tableau-de-bord/passager')}
                      >
                        <LayoutDashboard className="size-4" /> Mes réservations
                      </DropdownMenuItem>
                      {!user.driver_profile && (
                        <DropdownMenuItem onClick={() => navigate('/devenir-conducteur')}>
                          <Bell className="size-4" /> Devenir conducteur
                        </DropdownMenuItem>
                      )}
                    </>
                  )}
                  {user.is_admin && (
                    <DropdownMenuItem onClick={() => navigate('/admin/stats')}>
                      <Shield className="size-4" /> Administration
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => logout.mutate()}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="size-4" /> Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            // Un seul bouton pour un header plus épuré : la page de connexion
            // propose déjà "Pas encore de compte ? S'inscrire", donc pas
            // besoin de dupliquer ce choix ici.
            <Button
              size="sm"
              className="bg-soleil-500 hover:bg-soleil-600 text-nuit-950 font-medium"
              asChild
            >
              <Link to="/connexion">Connexion</Link>
            </Button>
          )}
        </div>
      </nav>
    </header>
  )
}
