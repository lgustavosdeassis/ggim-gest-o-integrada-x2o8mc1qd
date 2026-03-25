import { create } from 'zustand'
import { api } from '@/lib/api'
import { toast } from 'sonner'

export interface ObsRecord {
  id: string
  date: string
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
      set({ records: data as ObsRecord[], isFetching: false })
    } catch (e) {
      set({ isFetching: false })
    }
  },
  addRecord: async (record) => {
    try {
      await api.obs.save(record)
      toast.success('Sucesso', { description: 'Registro do observatório sincronizado na nuvem.' })
    } catch (e) {
      toast.error('Erro', { description: 'A comunicação com a nuvem falhou.' })
    } finally {
      get().fetchRecords()
    }
  },
  deleteRecord: async (id) => {
    try {
      await api.obs.delete(id)
      toast.success('Sucesso', { description: 'Registro do observatório excluído.' })
    } catch (e) {
      toast.error('Erro', { description: 'Falha ao excluir registro.' })
    } finally {
      get().fetchRecords()
    }
  },
}))
