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
import logoCmtecs from '@/assets/logo-cmtecs-a4c2e.jpeg'

const items = [
  { title: 'Dashboard BI', url: '/', icon: LayoutDashboard },
  { title: 'Registrar Atividade', url: '/registrar', icon: FilePlus2 },
  { title: 'Importar / Migrar', url: '/importar', icon: Upload },
  { title: 'Histórico Completo', url: '/historico', icon: History },
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar className="border-r shadow-sm no-print">
      <SidebarHeader className="border-b border-border/50 py-5 px-4 bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full overflow-hidden border-2 border-primary/20 shadow-sm bg-white">
            <img src={logoCmtecs} alt="CMTecs Logo" className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-col flex-1 truncate">
            <span className="truncate font-bold text-base leading-tight text-primary">CMTecs</span>
            <span className="truncate text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mt-0.5">
              Gestão GGIM
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 pt-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground mb-2 px-2">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    className="mb-1 py-5 rounded-lg data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-bold transition-all"
                  >
                    <Link to={item.url}>
                      <item.icon className="h-5 w-5 mr-1" />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border/50 p-4 bg-muted/10">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={location.pathname === '/profile'}
              className="rounded-lg"
            >
              <Link to="/profile">
                <Settings className="h-4 w-4 mr-1 text-muted-foreground" />
                <span className="text-sm">Configurações</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
