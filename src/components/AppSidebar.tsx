import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, FilePlus2, Upload, History, Settings } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@/components/ui/sidebar'
import logoImg from '@/assets/logo-cmtecs-a4c2e.jpeg'

const items = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Registrar', url: '/registrar', icon: FilePlus2 },
  { title: 'Importar', url: '/importar', icon: Upload },
  { title: 'Histórico', url: '/historico', icon: History },
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border/50 py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full overflow-hidden border border-border shadow-sm bg-white">
            <img src={logoImg} alt="CMTecs Logo" className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-col flex-1 truncate">
            <span className="truncate font-semibold text-base leading-tight">CMTecs</span>
            <span className="truncate text-xs font-medium text-muted-foreground">GGIM</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border/50 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={location.pathname === '/profile'}>
              <Link to="/profile">
                <Settings className="h-4 w-4" />
                <span>Configurações</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
