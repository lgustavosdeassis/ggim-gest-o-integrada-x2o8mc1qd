import { create } from 'zustand'
import { api } from '@/lib/api'

export interface AuditLog {
  id: string
  userName: string
  userEmail: string
  action: string
  timestamp: string
}

interface AuditState {
  logs: AuditLog[]
  isFetching: boolean
  fetchLogs: () => Promise<void>
  addLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => Promise<void>
  clearLogs: () => Promise<void>
}

export const useAuditStore = create<AuditState>()((set, get) => ({
  logs: [],
  isFetching: false,
  fetchLogs: async () => {
    set({ isFetching: true })
    try {
      const data = await api.audit.list()
      // Fallback to empty array to ensure robust initialization even if network fails
      set({ logs: Array.isArray(data) ? data : [], isFetching: false })
    } catch (e) {
      console.warn('Audit logs fetch failed, utilizing empty fallback to prevent interruption', e)
      set({ logs: [], isFetching: false })
    }
  },
  addLog: async (log) => {
    const newLog = {
      ...log,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    }
    await api.audit.syncUpdate((list) => [newLog, ...list])
    get().fetchLogs()
  },
  clearLogs: async () => {
    await api.audit.syncUpdate(() => [])
    get().fetchLogs()
  },
}))
