import { useEffect, useState, useRef } from 'react'
import { useAppStore } from '@/stores/main'
import { useAuthStore } from '@/stores/auth'
import { useVideoStore } from '@/stores/video'
import { useObsStore } from '@/stores/obs'
import { useReportStore } from '@/stores/reports'
import { useSyncStore } from '@/stores/sync'
import { db } from '@/lib/db/database-service'
import { Loader2, RefreshCw, Wifi, WifiOff } from 'lucide-react'

export function GlobalDataSync({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [initialLoad, setInitialLoad] = useState(true)
  const syncInProgress = useRef(false)

  const syncStatus = useSyncStore((state) => state.status)
  const syncMessage = useSyncStore((state) => state.message)

  useEffect(() => {
    if (!isAuthenticated) return

    let isMounted = true

    // Initialize unified database monitor
    db.init()

    const forceUnlock = setTimeout(() => {
      if (isMounted) {
        setInitialLoad(false)
      }
    }, 3000)

    const fetchAll = async () => {
      if (syncInProgress.current) return
      syncInProgress.current = true

      try {
        await useAppStore.getState().fetchActivities()
        await new Promise((r) => setTimeout(r, 100))

        await useReportStore.getState().fetchReports()
        await new Promise((r) => setTimeout(r, 100))

        await useVideoStore.getState().fetchRecords()
        await new Promise((r) => setTimeout(r, 100))

        await useObsStore.getState().fetchRecords()
      } catch (err) {
        console.warn('Problemas na sincronização inicial.', err)
      } finally {
        if (isMounted) {
          setInitialLoad(false)
        }
        syncInProgress.current = false
      }
    }

    fetchAll()

    return () => {
      isMounted = false
      clearTimeout(forceUnlock)
    }
  }, [isAuthenticated])

  if (isAuthenticated && initialLoad) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#020617] text-white">
        <Loader2 className="h-16 w-16 animate-spin text-[#eab308] mb-6" />
        <h2 className="text-2xl font-black tracking-tight mb-2 drop-shadow-sm text-center">
          Inicializando Sistema Central
        </h2>
        <p className="text-white/60 font-medium max-w-sm text-center px-4">
          Acessando as bases de dados e obtendo os registros de forma segura. Isso pode levar alguns
          segundos...
        </p>
      </div>
    )
  }

  return (
    <>
      {children}
      {syncStatus !== 'idle' && (
        <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border border-border text-sm font-bold bg-card text-card-foreground pointer-events-auto">
            {syncStatus === 'syncing' && (
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
            )}
            {syncStatus === 'connected' && <Wifi className="w-4 h-4 text-green-600" />}
            {syncStatus === 'error' && <WifiOff className="w-4 h-4 text-destructive" />}
            {syncMessage}
          </div>
        </div>
      )}
    </>
  )
}
