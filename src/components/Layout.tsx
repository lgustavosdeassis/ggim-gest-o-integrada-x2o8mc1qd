import { Outlet } from 'react-router-dom'
import { AppSidebar } from './AppSidebar'
import { Header } from './Header'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/toaster'

export default function Layout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="flex-1 overflow-auto bg-slate-50/50 p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
              <Outlet />
            </div>
          </main>
          <footer className="border-t py-4 text-center text-sm text-muted-foreground bg-background">
            Foz do Iguaçu - Gabinete de Gestão Integrada Municipal de Foz do Iguaçu (GGIM) © 2026
          </footer>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  )
}
