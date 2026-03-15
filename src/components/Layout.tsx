import { Outlet } from 'react-router-dom'
import { AppSidebar } from './AppSidebar'
import { Header } from './Header'
import { SidebarProvider } from '@/components/ui/sidebar'

export default function Layout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/30">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0 print-w-full">
          <Header />
          <main className="flex-1 overflow-auto p-4 md:p-6 print-w-full">
            <Outlet />
          </main>
          <footer className="py-4 px-6 text-center text-sm text-muted-foreground border-t bg-background print-hidden">
            Foz do Iguaçu - Gabinete de Gestão Integrada Municipal de Foz do Iguaçu (GGIM) © 2026
          </footer>
        </div>
      </div>
    </SidebarProvider>
  )
}
