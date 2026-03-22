import { useEffect } from 'react'
import { useAppStore } from '@/stores/main'
import { useAuthStore } from '@/stores/auth'
import { useVideoStore } from '@/stores/video'
import { useObsStore } from '@/stores/obs'
import { useAuditStore } from '@/stores/audit'

export function GlobalDataSync() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  useEffect(() => {
    if (!isAuthenticated) return

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
        console.warn('Global background sync encountered an issue, retrying soon.', err)
      }
    }

    // Initial Load
    fetchAll()

    // Real-time synchronization via periodic polling (10s)
    const interval = setInterval(fetchAll, 10000)

    // Listener for cross-tab or cross-session rapid updates
    window.addEventListener('db_updated', fetchAll)

    // Automatically trigger recovery attempt when network connection is restored
    window.addEventListener('online', fetchAll)

    return () => {
      clearInterval(interval)
      window.removeEventListener('db_updated', fetchAll)
      window.removeEventListener('online', fetchAll)
    }
  }, [isAuthenticated])

  return null
}
