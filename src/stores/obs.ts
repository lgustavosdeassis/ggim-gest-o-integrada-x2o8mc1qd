import { create } from 'zustand'
import { api } from '@/lib/api'
import { toast } from 'sonner'

export interface ObsRecord {
  id: string
  date: string // YYYY-MM
  sinistrosVitimas: number
  sinistrosTotal: number
  autosInfracao: number
  homicidios: number
  violenciaDomestica: number
  roubos: number
}

interface ObsState {
  records: ObsRecord[]
  isFetching: boolean
  fetchRecords: () => Promise<void>
  addRecord: (record: Omit<ObsRecord, 'id'>) => Promise<void>
  deleteRecord: (id: string) => Promise<void>
}

export const useObsStore = create<ObsState>()((set, get) => ({
  records: [],
  isFetching: false,
  fetchRecords: async () => {
    set({ isFetching: true })
    try {
      const data = await api.obs.list()
      set({ records: data, isFetching: false })
    } catch (e) {
      set({ isFetching: false })
    }
  },
  addRecord: async (record) => {
    const newId = Math.random().toString(36).substr(2, 9)
    try {
      await api.obs.syncUpdate((list) => {
        const existingIndex = list.findIndex((r) => r.date === record.date)
        if (existingIndex >= 0) {
          const updated = [...list]
          updated[existingIndex] = { ...record, id: list[existingIndex].id }
          return updated
        }
        return [...list, { ...record, id: newId }]
      })
      get().fetchRecords()
    } catch (e) {
      toast.error('Erro de Comunicação', {
        description: 'Falha ao sincronizar registro do observatório.',
      })
      throw e
    }
  },
  deleteRecord: async (id) => {
    try {
      await api.obs.syncUpdate((list) => list.filter((r) => r.id !== id))
      get().fetchRecords()
    } catch (e) {
      toast.error('Erro de Comunicação', {
        description: 'Falha ao excluir registro do observatório.',
      })
      throw e
    }
  },
}))
