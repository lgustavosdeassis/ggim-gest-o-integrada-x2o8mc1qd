import { SidebarTrigger } from '@/components/ui/sidebar'
import logoGgim from '@/assets/logo-ggim-texto-preto-sem-fundo-4ad89.jpeg'
import logoCmtecs from '@/assets/logo-cmtecs-a4c2e.jpeg'
import { Bell, Search, User, LogOut, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background px-4 sm:px-6 no-print">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="-ml-2" />
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-sm border overflow-hidden">
              <img src={logoCmtecs} alt="CMTecs Logo" className="h-full w-full object-cover" />
            </div>
            <span className="font-bold text-base hidden lg:block border-r border-border pr-3 mr-1">
              CMTecs
            </span>
          </div>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white p-0.5 shadow-sm border">
            <img src={logoGgim} alt="GGIM Logo" className="h-full w-full object-contain" />
          </div>
          <h1 className="hidden text-sm font-bold tracking-tight text-foreground lg:block xl:text-base">
            Gabinete de Gestão Integrada Municipal de Foz do Iguaçu (GGIM)
          </h1>
          <h1 className="text-base font-bold tracking-tight text-foreground lg:hidden">GGIM</h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="relative hidden sm:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar..."
            className="w-64 rounded-full bg-muted/50 pl-8 focus-visible:ring-primary"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-primary transition-colors"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notificações</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-[300px] overflow-auto">
              <div className="p-4 text-sm text-center text-muted-foreground">
                Nenhuma nova notificação.
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9 border border-border">
                <AvatarImage src={user?.avatarUrl || ''} alt={user?.name || ''} />
                <AvatarFallback className="bg-primary/20 text-primary">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/profile" className="cursor-pointer flex items-center w-full">
                <Settings className="mr-2 h-4 w-4" />
                <span>Minha Conta</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
