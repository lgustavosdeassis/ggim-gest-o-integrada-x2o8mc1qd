import { SidebarTrigger } from '@/components/ui/sidebar'
import ggimLogo from '@/assets/logo-ggim-texto-pb-com-fundo-branco-58495.jpeg'

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 sm:px-6 shadow-sm">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1 text-foreground hover:bg-secondary" />
      </div>

      <div className="flex flex-1 items-center gap-3 overflow-hidden">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white p-1 shadow-sm">
          <img src={ggimLogo} alt="Logo GGIM" className="h-full w-full object-contain" />
        </div>
        <h1 className="truncate text-base font-semibold text-foreground sm:text-lg md:text-xl">
          Gabinete de Gestão Integrada Municipal de Foz do Iguaçu (GGIM)
        </h1>
      </div>
    </header>
  )
}
