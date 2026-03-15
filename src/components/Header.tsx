import { SidebarTrigger } from '@/components/ui/sidebar'
import logoImg from '@/assets/logo-ggim-texto-preto-sem-fundo-4ad89.jpeg'
import { Bell, Search, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="-ml-2" />
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white p-1 shadow-sm border border-gray-200 dark:border-gray-800">
            <img src={logoImg} alt="GGIM Logo" className="h-full w-full object-contain" />
          </div>
          <h1 className="hidden text-base font-bold tracking-tight text-foreground lg:block xl:text-lg">
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
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-primary transition-colors"
        >
          <Bell className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-muted/50 hover:bg-muted hover:text-primary transition-colors"
        >
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
