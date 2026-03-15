import { Settings, UserCircle } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'

export function Header() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6 print-hidden">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="-ml-2" />
        <img src="/logo.png" alt="GGIM Logo" className="w-10 h-10 object-contain" />
        <h1 className="font-semibold text-lg hidden sm:block text-foreground">
          Gabinete de Gestão Integrada Municipal de Foz do Iguaçu (GGIM)
        </h1>
        <h1 className="font-semibold text-lg sm:hidden text-foreground">GGIM Foz do Iguaçu</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Settings className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <UserCircle className="h-6 w-6" />
        </Button>
      </div>
    </header>
  )
}
