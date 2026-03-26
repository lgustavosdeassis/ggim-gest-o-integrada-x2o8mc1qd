import { useEffect, useState, useRef } from 'react'
import { useAppStore } from '@/stores/main'
import { useAuthStore } from '@/stores/auth'
import { useVideoStore } from '@/stores/video'
import { useObsStore } from '@/stores/obs'
import { useAuditStore } from '@/stores/audit'
import { useReportStore } from '@/stores/reports'
import { Loader2 } from 'lucide-react'

export function GlobalDataSync({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [initialLoad, setInitialLoad] = useState(true)
  const syncInProgress = useRef(false)

  useEffect(() => {
    if (!isAuthenticated) return

    let isMounted = true

    // Timeout de segurança: força o desbloqueio da interface após 4 segundos,
    // garantindo que o usuário acesse o sistema mesmo se houver erro temporário
    // no servidor (como o HTTP 503 de cache de esquema) ou instabilidade na rede.
    const forceUnlock = setTimeout(() => {
      if (isMounted) {
        setInitialLoad(false)
      }
    }, 4000)

    const fetchAll = async () => {
      if (syncInProgress.current) return
      syncInProgress.current = true

      try {
        // Encadeamento sequencial de chamadas com pequenos delays
        // Isso previne congestionamento de conexões no Supabase (Erro 504 / 500)
        await useAppStore.getState().fetchActivities()
        await new Promise((r) => setTimeout(r, 300))

        await useReportStore.getState().fetchReports()
        await new Promise((r) => setTimeout(r, 300))

        await useVideoStore.getState().fetchRecords()
        await new Promise((r) => setTimeout(r, 300))

        await useObsStore.getState().fetchRecords()
        await new Promise((r) => setTimeout(r, 300))

        await useAuditStore.getState().fetchLogs()
      } catch (err) {
        console.warn('Problemas na sincronização. Nova tentativa ocorrerá no próximo ciclo.', err)
      } finally {
        if (isMounted) {
          setInitialLoad(false)
        }
        syncInProgress.current = false
      }
    }

    fetchAll()

    // Ampliado o tempo de checagem para aliviar a carga no servidor (de 10s para 30s)
    const interval = setInterval(fetchAll, 30000)

    const handleEvent = () => {
      if (!syncInProgress.current) {
        fetchAll()
      }
    }

    window.addEventListener('db_updated', handleEvent)
    window.addEventListener('online', handleEvent)

    return () => {
      isMounted = false
      clearTimeout(forceUnlock)
      clearInterval(interval)
      window.removeEventListener('db_updated', handleEvent)
      window.removeEventListener('online', handleEvent)
    }
  }, [isAuthenticated])

  if (isAuthenticated && initialLoad) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#020617] text-white">
        <Loader2 className="h-16 w-16 animate-spin text-[#eab308] mb-6" />
        <h2 className="text-2xl font-black tracking-tight mb-2 drop-shadow-sm text-center">
          Sincronizando Sistema Central
        </h2>
        <p className="text-white/60 font-medium max-w-sm text-center px-4">
          Estabelecendo comunicação com a nuvem e obtendo os registros de forma segura. Isso pode
          levar alguns segundos...
        </p>
      </div>
    )
  }

  return <>{children}</>
}
