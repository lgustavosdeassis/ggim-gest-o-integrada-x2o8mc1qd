import { create } from 'zustand'
import { api } from '@/lib/api'
import { toast } from 'sonner'

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
      set({ logs: Array.isArray(data) ? data : [], isFetching: false })
    } catch (e) {
      set({ logs: [], isFetching: false })
    }
  },
  addLog: async (log) => {
    const newLog = {
      ...log,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    }
    try {
      await api.audit.syncUpdate((list) => [newLog, ...list])
      get().fetchLogs()
    } catch (e) {
      console.warn('Falha silenciosa no sync do audit log', e)
    }
  },
  clearLogs: async () => {
    try {
      await api.audit.syncUpdate(() => [])
      toast.success('Sucesso', { description: 'Histórico de auditoria limpo.' })
    } catch (e) {
      toast('Aviso: Modo Offline', { description: 'Limpeza registrada localmente.' })
    } finally {
      get().fetchLogs()
    }
  },
}))
