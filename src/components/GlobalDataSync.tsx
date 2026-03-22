import { useEffect, useState } from 'react'
import { useAppStore } from '@/stores/main'
import { useAuthStore } from '@/stores/auth'
import { useVideoStore } from '@/stores/video'
import { useObsStore } from '@/stores/obs'
import { useAuditStore } from '@/stores/audit'
import { Loader2 } from 'lucide-react'

export function GlobalDataSync({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [initialLoad, setInitialLoad] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) return

    let isMounted = true

    const fetchAll = async () => {
      try {
        await Promise.allSettled([
          useAppStore.getState().fetchActivities(),
          useAuthStore.getState().fetchUsers(),
          useVideoStore.getState().fetchRecords(),
          useObsStore.getState().fetchRecords(),
          useAuditStore.getState().fetchLogs(),
        ])
      } catch (err) {
        console.warn('Sync issues', err)
      } finally {
        if (isMounted && initialLoad) {
          setInitialLoad(false)
        }
      }
    }

    // Initial Load ensures everything is fetched correctly before interaction
    fetchAll()

    // Real-time synchronization polling (10s)
    const interval = setInterval(fetchAll, 10000)

    // Listener for cross-tab or cross-session rapid updates
    window.addEventListener('db_updated', fetchAll)

    // Trigger recovery automatically when network is back
    window.addEventListener('online', fetchAll)

    return () => {
      isMounted = false
      clearInterval(interval)
      window.removeEventListener('db_updated', fetchAll)
      window.removeEventListener('online', fetchAll)
    }
  }, [isAuthenticated, initialLoad])

  if (isAuthenticated && initialLoad) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#020617] text-white">
        <Loader2 className="h-16 w-16 animate-spin text-[#eab308] mb-6" />
        <h2 className="text-2xl font-black tracking-tight mb-2 drop-shadow-sm text-center">
          Sincronizando Sistema Central
        </h2>
        <p className="text-white/60 font-medium max-w-sm text-center">
          Estabelecendo comunicação com a nuvem e obtendo os registros mais recentes...
        </p>
      </div>
    )
  }

  return <>{children}</>
}
