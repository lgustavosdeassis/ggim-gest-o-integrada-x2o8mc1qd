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
      toast.success('Sucesso', { description: 'Registro de vídeo sincronizado.' })
    } catch (e) {
      toast('Aviso: Modo Offline', {
        description:
          'A comunicação com a nuvem falhou. Seus dados foram salvos com segurança de forma local.',
      })
    } finally {
      get().fetchRecords()
    }
  },
  deleteRecord: async (id) => {
    try {
      await api.video.syncUpdate((list) => list.filter((r) => r.id !== id))
      toast.success('Sucesso', { description: 'Registro de vídeo excluído.' })
    } catch (e) {
      toast('Aviso: Modo Offline', {
        description: 'Exclusão registrada localmente devido a falha de conexão.',
      })
    } finally {
      get().fetchRecords()
    }
  },
}))
