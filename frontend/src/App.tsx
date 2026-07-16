import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { SplashScreen } from '@/components/SplashScreen'
import { RootLayout } from '@/layouts/RootLayout'
import { ProtectedRoute } from '@/layouts/ProtectedRoute'
import { AdminLayout } from '@/layouts/AdminLayout'
import { HomeSearch } from '@/pages/HomeSearch'
import { TripDetail } from '@/pages/TripDetail'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { Profile } from '@/pages/Profile'
import { DriverRequest } from '@/pages/DriverRequest'
import { DashboardDriver } from '@/pages/DashboardDriver'
import { DashboardPassenger } from '@/pages/DashboardPassenger'
import { AdminStats } from '@/pages/admin/AdminStats'
import { AdminUsers } from '@/pages/admin/AdminUsers'
import { AdminDriverRequests } from '@/pages/admin/AdminDriverRequests'
import { AdminReports } from '@/pages/admin/AdminReports'
import { NotFound } from '@/pages/NotFound'

export default function App() {
  // Affiché une seule fois, au tout premier chargement de l'app (pas à chaque
  // navigation interne, puisque ce state ne se réinitialise pas au changement
  // de route dans une SPA — seul un vrai rechargement de page le refait jouer).
  const [splashVisible, setSplashVisible] = useState(true)

  return (
    <>
      {splashVisible && <SplashScreen onTermine={() => setSplashVisible(false)} />}
      <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<HomeSearch />} />
          <Route path="trajets/:id" element={<TripDetail />} />
          <Route path="connexion" element={<Login />} />
          <Route path="inscription" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="profil" element={<Profile />} />
            <Route path="devenir-conducteur" element={<DriverRequest />} />
            <Route path="tableau-de-bord/conducteur" element={<DashboardDriver />} />
            <Route path="tableau-de-bord/passager" element={<DashboardPassenger />} />
          </Route>

          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="admin" element={<AdminLayout />}>
              <Route path="stats" element={<AdminStats />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="driver-requests" element={<AdminDriverRequests />} />
              <Route path="reports" element={<AdminReports />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  )
}
