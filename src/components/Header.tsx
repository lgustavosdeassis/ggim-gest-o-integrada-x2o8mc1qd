import { SidebarTrigger } from '@/components/ui/sidebar'
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
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between bg-primary border-b border-primary-foreground/10 px-4 sm:px-8 no-print shadow-md text-primary-foreground">
      {/* Left section: Sidebar trigger */}
      <div className="flex items-center w-1/4">
        <SidebarTrigger className="-ml-2 h-10 w-10 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors" />
      </div>

      {/* Center section: New Hexagonal Logo integration */}
      <div className="hidden lg:flex flex-1 items-center justify-center gap-4">
        <div className="flex h-16 w-auto shrink-0 items-center justify-center bg-transparent">
          <img
            src="/logo-hexagonal.png"
            alt="GGIM Hexagonal"
            className="h-full w-auto object-contain drop-shadow-md"
            onError={(e) => {
              // Fallback to placeholder if the high-res asset is not yet placed in public/
              e.currentTarget.src =
                'https://img.usecurling.com/i?q=hexagon-logo&color=gradient&shape=fill'
            }}
          />
        </div>
        <h1 className="text-base lg:text-lg font-bold tracking-tight text-center">
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
              className="relative h-10 w-10 rounded-full text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-all"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-secondary ring-2 ring-primary" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 border-border bg-popover shadow-2xl">
            <DropdownMenuLabel className="font-bold text-foreground">
              Notificações
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
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
              className="relative h-10 w-auto px-1.5 sm:pr-4 rounded-full border border-primary-foreground/20 hover:border-secondary hover:bg-primary-foreground/10 transition-colors flex items-center gap-2.5"
            >
              <Avatar className="h-8 w-8 shadow-sm">
                <AvatarImage src={user?.avatarUrl || ''} alt={user?.name || ''} />
                <AvatarFallback className="bg-secondary text-secondary-foreground font-bold text-xs">
                  {user?.name?.charAt(0) || <User className="h-3.5 w-3.5" />}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-bold hidden sm:inline-block text-primary-foreground">
                {user?.name?.split(' ')[0]}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-60 border-border bg-popover shadow-2xl"
            align="end"
            forceMount
          >
            <DropdownMenuLabel className="font-normal p-3">
              <div className="flex flex-col space-y-1.5">
                <p className="text-sm font-bold leading-none text-foreground">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground font-medium">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem
              asChild
              className="cursor-pointer hover:bg-muted p-2.5 focus:bg-muted focus:text-foreground"
            >
              <Link to="/profile" className="flex items-center w-full">
                <Settings className="mr-3 h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Minha Conta</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
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
