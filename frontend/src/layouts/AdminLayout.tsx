import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'

const TABS = [
  { to: '/admin/stats', label: 'Statistiques' },
  { to: '/admin/users', label: 'Utilisateurs' },
  { to: '/admin/driver-requests', label: 'Demandes conducteur' },
  { to: '/admin/reports', label: 'Signalements' },
]

export function AdminLayout() {
  return (
    <div>
      {/* Sur mobile, ces onglets peuvent dépasser la largeur de l'écran :
          overflow-x-auto les rend défilables au doigt, et le dégradé à droite
          indique qu'il y a du contenu à découvrir au lieu de laisser croire
          que la barre s'arrête net (ex. "Demandes conducteur" tronqué). */}
      <div className="relative border-b border-border bg-nuit-900 text-sable-50">
        <nav className="mx-auto max-w-5xl px-4 flex gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                cn(
                  'px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                  isActive
                    ? 'border-soleil-500 text-soleil-400'
                    : 'border-transparent text-sable-100/70 hover:text-sable-50'
                )
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-nuit-900 to-transparent sm:hidden"
          aria-hidden="true"
        />
      </div>
      <Outlet />
    </div>
  )
}
