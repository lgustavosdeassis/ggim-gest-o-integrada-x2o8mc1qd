import { SidebarTrigger } from '@/components/ui/sidebar'
import cmtecsLogo from '@/assets/logo-cmtecs-22276.jpeg'

export function Header() {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
      <SidebarTrigger />
      <div className="flex items-center gap-2 font-semibold">
        <img src={cmtecsLogo} alt="CMTecs" className="h-6 w-6 rounded-full object-cover" />
        <span className="hidden sm:inline-block">CMTecs</span>
        <span className="sm:hidden">CMTecs</span>
      </div>
    </header>
  )
}
