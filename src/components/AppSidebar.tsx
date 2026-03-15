import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { LayoutDashboard, FilePlus2, History, Upload } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import cmtecsLogo from '@/assets/logo-cmtecs-22276.jpeg'

const navItems = [
  { title: 'Dashboard (BI)', icon: LayoutDashboard, url: '/' },
  { title: 'Registrar Atividade', icon: FilePlus2, url: '/registrar' },
  { title: 'Histórico de Registros', icon: History, url: '/historico' },
  { title: 'Importar Dados', icon: Upload, url: '/importar' },
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-3">
          <img
            src={cmtecsLogo}
            alt="CMTecs"
            className="w-10 h-10 rounded-full object-cover shadow-sm"
          />
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-tight text-primary">CMTecs</span>
            <span className="text-xs text-muted-foreground">Foz do Iguaçu</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="py-4">
        <SidebarMenu>
          {navItems.map((item) => {
            const isActive = location.pathname === item.url
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                  <Link to={item.url}>
                    <item.icon className="w-5 h-5" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 text-xs text-center text-muted-foreground border-t">
        <p>Versão 0.0.5</p>
      </SidebarFooter>
    </Sidebar>
  )
}
