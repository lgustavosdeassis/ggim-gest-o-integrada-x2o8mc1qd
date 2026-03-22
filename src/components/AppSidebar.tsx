import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FilePlus2,
  Upload,
  History,
  Settings,
  Users,
  MonitorPlay,
  ShieldAlert,
  ScrollText,
} from 'lucide-react'
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
import { GgimLogo } from '@/components/GgimLogo'
import { useAuthStore } from '@/stores/auth'

const getItems = (isOwner: boolean) => {
  const base = [
    { title: 'Dashboard BI', url: '/', icon: LayoutDashboard },
    { title: 'Registrar Atividade', url: '/registrar', icon: FilePlus2 },
    { title: 'Importar / Migrar', url: '/importar', icon: Upload },
    { title: 'Histórico Completo', url: '/historico', icon: History },
    { title: 'Videomonitoramento', url: '/videomonitoramento', icon: MonitorPlay },
    { title: 'Observatório (OMSP)', url: '/observatorio', icon: ShieldAlert },
  ]
  if (isOwner) {
    base.push({ title: 'Gestão de Usuários', url: '/usuarios', icon: Users })
    base.push({ title: 'Logs de Auditoria', url: '/audit-logs', icon: ScrollText })
  }
  return base
}

export function AppSidebar() {
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const isOwner = user?.role === 'owner'

  const items = getItems(isOwner)

  return (
    <Sidebar className="border-r border-sidebar-border shadow-xl no-print bg-sidebar">
      <SidebarHeader className="border-b border-sidebar-border py-6 px-6 bg-sidebar">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg overflow-hidden border border-sidebar-primary/20 shadow-md bg-black">
            <GgimLogo className="h-full w-full object-contain" />
          </div>
          <div className="flex flex-col flex-1 truncate">
            <span className="truncate font-black text-[22px] tracking-tight text-sidebar-foreground">
              CMTecs
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-4 pt-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-widest text-sidebar-foreground/50 mb-4 px-2 font-bold">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {items.map((item) => {
                const isActive = location.pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`h-12 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-bold shadow-sm'
                          : 'text-sidebar-foreground/70 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 font-medium'
                      }`}
                    >
                      <Link to={item.url} className="flex items-center gap-3 px-2">
                        <item.icon
                          className={`h-5 w-5 ${isActive ? 'text-sidebar-accent-foreground' : 'text-sidebar-foreground/50'}`}
                        />
                        <span className="text-sm">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 bg-sidebar">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={location.pathname === '/profile'}
              className={`h-12 rounded-xl transition-all duration-200 ${
                location.pathname === '/profile'
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-bold shadow-sm'
                  : 'text-sidebar-foreground/70 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 font-medium'
              }`}
            >
              <Link to="/profile" className="flex items-center gap-3 px-2">
                <Settings
                  className={`h-5 w-5 ${location.pathname === '/profile' ? 'text-sidebar-accent-foreground' : 'text-sidebar-foreground/50'}`}
                />
                <span className="text-sm">Minha Conta</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
