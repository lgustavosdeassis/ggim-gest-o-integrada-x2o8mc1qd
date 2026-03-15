import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, FilePlus, History, Import, ShieldAlert } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'

const NAV_ITEMS = [
  { title: 'Dashboard (BI)', url: '/', icon: LayoutDashboard },
  { title: 'Registrar Atividade', url: '/registrar', icon: FilePlus },
  { title: 'Histórico de Registros', url: '/historico', icon: History },
  { title: 'Importar Dados', url: '/importar', icon: Import },
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar className="border-r print-hidden">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg text-primary-foreground">
            <ShieldAlert size={24} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm leading-tight text-primary">GGIM</span>
            <span className="text-xs text-muted-foreground">Foz do Iguaçu</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {NAV_ITEMS.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === item.url}
                tooltip={item.title}
              >
                <Link to={item.url} className="flex items-center gap-3 py-2">
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}
