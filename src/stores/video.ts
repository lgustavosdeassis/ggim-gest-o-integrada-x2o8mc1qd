import { create } from 'zustand'
import { api } from '@/lib/api'
import { toast } from 'sonner'

export interface VideoRecord {
  id: string
  date: string
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
      set({ records: data as VideoRecord[], isFetching: false })
    } catch (e) {
      set({ isFetching: false })
    }
  },
  addRecord: async (record) => {
    try {
      await api.video.save(record)
      toast.success('Sucesso', { description: 'Registro de vídeo sincronizado na nuvem.' })
    } catch (e) {
      toast.error('Erro', { description: 'A comunicação com a nuvem falhou.' })
    } finally {
      get().fetchRecords()
    }
  },
  deleteRecord: async (id) => {
    try {
      await api.video.delete(id)
      toast.success('Sucesso', { description: 'Registro de vídeo excluído.' })
    } catch (e) {
      toast.error('Erro', { description: 'Falha ao excluir registro.' })
    } finally {
      get().fetchRecords()
    }
  },
}))
