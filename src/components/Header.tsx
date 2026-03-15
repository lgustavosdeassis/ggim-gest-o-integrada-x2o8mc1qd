import { SidebarTrigger } from '@/components/ui/sidebar'
import logoGgim from '@/assets/logo-ggim-texto-preto-sem-fundo-4ad89.jpeg'
import { Bell, User, LogOut, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Header() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-border/20 bg-background/95 backdrop-blur-xl px-4 sm:px-8 no-print shadow-sm">
      {/* Left section: Sidebar trigger (CMTecs logo is now exclusively in the sidebar top-left) */}
      <div className="flex items-center w-1/4">
        <SidebarTrigger className="-ml-2 h-10 w-10 text-muted-foreground hover:text-white transition-colors" />
      </div>

      {/* Center section: GGIM Logo and Title */}
      <div className="hidden lg:flex flex-1 items-center justify-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white p-1 shadow-md border border-border/20">
          <img src={logoGgim} alt="GGIM Logo" className="h-full w-full object-contain" />
        </div>
        <h1 className="text-base font-bold tracking-tight text-white text-center">
          Gabinete de Gestão Integrada Municipal de Foz do Iguaçu (GGIM)
        </h1>
      </div>

      {/* Right section: Notifications + User */}
      <div className="flex items-center justify-end gap-3 w-1/4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10 rounded-full text-muted-foreground hover:text-white hover:bg-muted/30 transition-all"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-80 border-border/40 bg-card/95 backdrop-blur shadow-2xl"
          >
            <DropdownMenuLabel className="font-bold text-white">Notificações</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/40" />
            <div className="max-h-[300px] overflow-auto">
              <div className="p-6 text-sm text-center text-muted-foreground">
                Nenhuma nova notificação.
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-10 w-10 rounded-full p-0 border border-border/30 hover:border-primary/50 transition-colors"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatarUrl || ''} alt={user?.name || ''} />
                <AvatarFallback className="bg-primary/20 text-primary font-bold">
                  {user?.name?.charAt(0) || <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-60 border-border/40 bg-card/95 backdrop-blur shadow-2xl"
            align="end"
            forceMount
          >
            <DropdownMenuLabel className="font-normal p-3">
              <div className="flex flex-col space-y-1.5">
                <p className="text-sm font-bold leading-none text-white">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground font-medium">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/40" />
            <DropdownMenuItem
              asChild
              className="cursor-pointer hover:bg-muted/50 p-2.5 focus:bg-muted/50 focus:text-white"
            >
              <Link to="/profile" className="flex items-center w-full">
                <Settings className="mr-3 h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Minha Conta</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/40" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 p-2.5"
            >
              <LogOut className="mr-3 h-4 w-4" />
              <span className="font-bold">Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
