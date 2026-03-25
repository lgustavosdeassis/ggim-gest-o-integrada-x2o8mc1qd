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
      set({ logs: data as AuditLog[], isFetching: false })
    } catch (e) {
      set({ logs: [], isFetching: false })
    }
  },
  addLog: async (log) => {
    try {
      await api.audit.add(log)
      get().fetchLogs()
    } catch (e) {
      console.warn('Falha no audit log', e)
    }
  },
  clearLogs: async () => {
    try {
      await api.audit.clear()
      toast.success('Sucesso', { description: 'Histórico de auditoria limpo.' })
    } catch (e) {
      toast.error('Erro', { description: 'Falha ao limpar histórico de auditoria.' })
    } finally {
      get().fetchLogs()
    }
  },
}))
