import { create } from 'zustand'
import { api } from '@/lib/api'
import { toast } from 'sonner'

export interface VideoRecord {
  id: string
  date: string // YYYY-MM
  particulares: number
  instituicoes: number
  imprensa: number
  operadores: number
}

interface VideoState {
  records: VideoRecord[]
  isFetching: boolean
  fetchRecords: () => Promise<void>
  addRecord: (record: Omit<VideoRecord, 'id'>) => Promise<void>
  deleteRecord: (id: string) => Promise<void>
}

export const useVideoStore = create<VideoState>()((set, get) => ({
  records: [],
  isFetching: false,
  fetchRecords: async () => {
    set({ isFetching: true })
    try {
      const data = await api.video.list()
      set({ records: data, isFetching: false })
    } catch (e) {
      set({ isFetching: false })
    }
  },
  addRecord: async (record) => {
    const newId = Math.random().toString(36).substr(2, 9)
    try {
      await api.video.syncUpdate((list) => {
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
        description: 'Falha ao sincronizar registro de vídeo na nuvem.',
      })
      throw e
    }
  },
  deleteRecord: async (id) => {
    try {
      await api.video.syncUpdate((list) => list.filter((r) => r.id !== id))
      get().fetchRecords()
    } catch (e) {
      toast.error('Erro de Comunicação', { description: 'Falha ao excluir registro de vídeo.' })
      throw e
    }
  },
}))
