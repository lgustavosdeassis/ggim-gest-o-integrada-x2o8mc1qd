import React from 'react'
import { cn } from '@/lib/utils'

export function GgimHexLogo({ className }: { className?: string }) {
  return (
    <img
      src="https://img.usecurling.com/i?q=hexagon-logo&color=gradient&shape=fill&size=512"
      alt="GGIM Hexagonal Logo"
      className={cn('h-full w-auto object-contain drop-shadow-md', className)}
    />
  )
}
