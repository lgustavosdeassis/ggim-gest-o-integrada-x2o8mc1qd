import React, { useEffect } from 'react'
import { databaseConfig } from '@/lib/db/database-config'

export function GlobalDataSync({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const initAllProviders = async () => {
      try {
        for (const provider of databaseConfig.providers) {
          if (provider && typeof provider.init === 'function') {
            await provider.init()
          }
        }
      } catch (error) {
        console.error('Error initializing data providers:', error)
      }
    }

    initAllProviders()
  }, [])

  return <>{children}</>
}
