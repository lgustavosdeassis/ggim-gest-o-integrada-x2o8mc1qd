import { cn } from '@/lib/utils'
import logoGgim from '@/assets/logo-ggim-fundo-transparente-pb-5f316.png'

interface GgimHexLogoProps {
  className?: string
}

export function GgimHexLogo({ className }: GgimHexLogoProps) {
  return (
    <img
      src={logoGgim}
      alt="GGIM Hexagonal Logo"
      className={cn(
        'object-contain w-full h-full drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]',
        className,
      )}
    />
  )
}
