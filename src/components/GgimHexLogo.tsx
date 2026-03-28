import { cn } from '@/lib/utils'
import logoUrl from '../assets/logo-ggim-texto-branco-sem-fundo-7f921.png'

export function GgimHexLogo({ className }: { className?: string }) {
  return (
    <img
      src={logoUrl}
      alt="GGIM Hexagonal Logo"
      className={cn(
        'object-contain w-full h-full drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]',
        className,
      )}
    />
  )
}
