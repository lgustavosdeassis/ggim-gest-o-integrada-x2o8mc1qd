import { cn } from '@/lib/utils'
import logoImg from '@/assets/logo-cmtecs-fe595.jpg'

interface GgimHexLogoProps {
  className?: string
}

export function GgimHexLogo({ className }: GgimHexLogoProps) {
  return (
    <div
      className={cn(
        'relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white',
        className,
      )}
    >
      <img src={logoImg} alt="CMTecs Logo" className="h-full w-full object-cover" />
    </div>
  )
}
