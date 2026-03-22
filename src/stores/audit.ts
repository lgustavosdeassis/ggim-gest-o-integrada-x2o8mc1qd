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
      set({ logs: data, isFetching: false })
    } catch (e) {
      set({ isFetching: false })
    }
  },
  addLog: async (log) => {
    const newLog = {
      ...log,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    }
    const newLogs = [newLog, ...get().logs]
    set({ logs: newLogs })
    await api.audit.sync(newLogs)
  },
  clearLogs: async () => {
    set({ logs: [] })
    await api.audit.sync([])
  },
}))
