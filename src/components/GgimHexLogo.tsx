import { useState } from 'react'
import { Hexagon } from 'lucide-react'

export function GgimHexLogo({ className = '' }: { className?: string }) {
  const [errorCount, setErrorCount] = useState(0)

  // Implement fallback logic to ensure the new branding appears perfectly regardless of the exact attachment mapping path
  const getSrc = () => {
    if (errorCount === 0) return '/logo.png'
    if (errorCount === 1) return '/ggim-logo.png'
    if (errorCount === 2) return '/ggim-hex-logo.png'
    return null
  }

  const src = getSrc()

  if (!src) {
    return (
      <div className={`relative flex items-center justify-center bg-transparent ${className}`}>
        <Hexagon className="w-full h-full fill-white/5 text-white/10 absolute z-0" />
        <span className="font-black text-white tracking-widest drop-shadow-lg z-10 text-xs sm:text-base">
          GGIM
        </span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt="GGIM Foz"
      className={className}
      onError={() => setErrorCount((c) => c + 1)}
    />
  )
}
