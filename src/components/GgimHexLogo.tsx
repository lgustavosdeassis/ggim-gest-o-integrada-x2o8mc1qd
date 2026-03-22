import { useState } from 'react'
import { Shield } from 'lucide-react'

export function GgimHexLogo({ className = '' }: { className?: string }) {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return (
      <div className={`relative flex items-center justify-center bg-transparent ${className}`}>
        <Shield
          className="w-full h-full fill-white/10 text-white/30 absolute z-0"
          strokeWidth={1.5}
        />
        <span className="font-black text-white tracking-widest drop-shadow-lg z-10 text-xs sm:text-base">
          GGIM
        </span>
      </div>
    )
  }

  return (
    <img
      src="/ggim-logo.png"
      alt="GGIM Foz"
      className={className}
      onError={() => setHasError(true)}
    />
  )
}
