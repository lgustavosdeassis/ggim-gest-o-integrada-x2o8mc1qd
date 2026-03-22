import { useState } from 'react'
import { Hexagon } from 'lucide-react'

export function GgimHexLogo({ className = '' }: { className?: string }) {
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-primary text-white rounded-xl shadow-inner ${className}`}
      >
        <Hexagon className="w-2/3 h-2/3 fill-current" />
      </div>
    )
  }

  return (
    <img
      src="/ggim-hex-logo.png"
      alt="GGIM Foz"
      className={className}
      onError={() => setError(true)}
    />
  )
}
