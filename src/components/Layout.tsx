import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { Header } from './Header'
import { Outlet } from 'react-router-dom'

export function Layout() {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <div className="flex-1 flex flex-col w-full min-w-0 bg-background overflow-hidden min-h-screen">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  )
}
