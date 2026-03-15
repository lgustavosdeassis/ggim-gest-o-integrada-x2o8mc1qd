import { Bell, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarTrigger } from '@/components/ui/sidebar'
import ggimLogo from '@/assets/logo-ggim-texto-preto-sem-fundo-a89c1.jpeg'

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 shadow-sm sm:px-6">
      <SidebarTrigger className="-ml-1" />

      <div className="flex flex-1 items-center gap-4 overflow-hidden">
        <div className="flex items-center gap-2 overflow-hidden sm:gap-4">
          <img src={ggimLogo} alt="Logo GGIM" className="h-8 w-auto object-contain sm:h-10" />
          <h1 className="truncate text-sm font-semibold tracking-tight text-foreground sm:text-base md:text-lg">
            <span className="hidden lg:inline">
              Gabinete de Gestão Integrada Municipal de Foz do Iguaçu (GGIM)
            </span>
            <span className="inline lg:hidden">GGIM</span>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notificações</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sair</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
