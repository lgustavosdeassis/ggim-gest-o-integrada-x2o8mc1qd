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
      set((state) => {
        if (JSON.stringify(state.logs) === JSON.stringify(data)) {
          return { isFetching: false }
        }
        return { logs: data as AuditLog[], isFetching: false }
      })
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
      toast.success('Sucesso', { description: 'Registros excluídos com sucesso!' })
    } catch (e: any) {
      if (e?.status === 403) {
        toast.error('Erro', { description: 'Você não tem permissão para realizar esta ação.' })
      } else {
        toast.error('Erro', {
          description: 'Erro ao excluir o registro. Por favor, tente novamente.',
        })
      }
      throw e
    } finally {
      get().fetchLogs()
    }
  },
}))
