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

    const fetchAll = () => {
      useAppStore.getState().fetchActivities()
      useAuthStore.getState().fetchUsers()
      useVideoStore.getState().fetchRecords()
      useObsStore.getState().fetchRecords()
      useAuditStore.getState().fetchLogs()
    }

    // Initial Load
    fetchAll()

    // Real-time synchronization via periodic polling (10s)
    const interval = setInterval(fetchAll, 10000)

    // Listener for cross-tab or cross-session rapid updates
    window.addEventListener('db_updated', fetchAll)

    return () => {
      clearInterval(interval)
      window.removeEventListener('db_updated', fetchAll)
    }
  }, [isAuthenticated])

  return null
}
