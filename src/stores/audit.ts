import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuditLog {
  id: string
  userName: string
  userEmail: string
  action: string
  timestamp: string
}

interface AuditState {
  logs: AuditLog[]
  addLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void
  clearLogs: () => void
}

export const useAuditStore = create<AuditState>()(
  persist(
    (set) => ({
      logs: [],
      addLog: (log) =>
        set((state) => ({
          logs: [
            {
              ...log,
              id: Math.random().toString(36).substring(2, 9),
              timestamp: new Date().toISOString(),
            },
            ...state.logs,
          ],
        })),
      clearLogs: () => set({ logs: [] }),
    }),
    {
      name: 'audit-storage',
    },
  ),
)

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'audit-storage') {
      useAuditStore.persist.rehydrate()
    }
  })
}
