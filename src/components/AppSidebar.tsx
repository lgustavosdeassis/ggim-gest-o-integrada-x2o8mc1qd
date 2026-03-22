import { Link, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  FilePlus2,
  History,
  MonitorPlay,
  BarChart3,
  Users,
  ShieldAlert,
  UploadCloud,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { cn } from '@/lib/utils'

export function AppSidebar() {
  const { pathname } = useLocation()
  const { user } = useAuthStore()
  const isOwner = user?.role === 'owner'

  const menuItems = [
    { title: 'Painel Gerencial', path: '/', icon: LayoutDashboard },
    { title: 'Registrar Atividade', path: '/registrar', icon: FilePlus2 },
    { title: 'Importar Lote', path: '/importar', icon: UploadCloud },
    { title: 'Acervo Histórico', path: '/historico', icon: History },
    { title: 'Videomonitoramento', path: '/videomonitoramento', icon: MonitorPlay },
    { title: 'Observatório', path: '/observatorio', icon: BarChart3 },
  ]

  const adminItems = [
    { title: 'Usuários', path: '/usuarios', icon: Users },
    { title: 'Auditoria', path: '/audit-logs', icon: ShieldAlert },
  ]

  return (
    <Sidebar variant="sidebar" className="border-r border-border bg-sidebar z-40">
      <SidebarHeader className="h-20 flex items-center px-4 border-b border-border justify-center bg-sidebar">
        {/* CMTecs Brand Adjustment: Full circle implementation to eliminate layout gaps and white borders */}
        <div className="flex items-center gap-3 w-full justify-center">
          <div className="h-11 w-11 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center p-0 border-none bg-[#020617]">
            <img
              src="https://img.usecurling.com/i?q=shield&color=white&shape=fill"
              alt="CMTecs"
              className="w-full h-full object-cover scale-[1.35]"
            />
          </div>
          <div className="flex flex-col truncate">
            <span className="font-black text-lg tracking-tight text-sidebar-foreground truncate leading-none">
              CMTECS
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-sidebar-foreground/60 truncate mt-0.5">
              Gestão Integrada
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2 px-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.path}
                    className={cn(
                      'h-11 rounded-xl px-4 transition-all font-bold text-sm text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent',
                      pathname === item.path &&
                        'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground shadow-sm',
                    )}
                  >
                    <Link to={item.path}>
                      <item.icon className="w-5 h-5 mr-3" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {isOwner && (
                <>
                  <div className="mt-8 mb-2 px-4 text-[10px] font-black uppercase tracking-widest text-sidebar-foreground/40">
                    Administração Geral
                  </div>
                  {adminItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.path}
                        className={cn(
                          'h-11 rounded-xl px-4 transition-all font-bold text-sm text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent',
                          pathname === item.path &&
                            'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm',
                        )}
                      >
                        <Link to={item.path}>
                          <item.icon className="w-5 h-5 mr-3" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
