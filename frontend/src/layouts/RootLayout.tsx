import { Outlet } from 'react-router-dom'
import { Navbar } from '@/components/Navbar'
import { Toaster } from '@/components/ui/sonner'
import logoFull from '@/assets/brand/logo-full.png'

export function RootLayout() {
  return (
    <div className="min-h-dvh flex flex-col">
      <a
        href="#contenu-principal"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md"
      >
        Aller au contenu principal
      </a>
      <Navbar />
      <main id="contenu-principal" className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border py-6 flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
        <img src={logoFull} alt="Kaay Dem !" className="h-8 w-auto opacity-90" />
        Covoiturage étudiant, où que tu ailles à Dakar et ses environs
      </footer>
      <Toaster position="top-center" richColors />
    </div>
  )
}
