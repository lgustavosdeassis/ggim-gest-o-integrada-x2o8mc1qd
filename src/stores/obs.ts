import { create } from 'zustand'
import { api } from '@/lib/api'

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
    const currentServer = await api.obs.list(true)
    const existingIndex = currentServer.findIndex((r) => r.date === record.date)
    let newRecords: ObsRecord[]

    if (existingIndex >= 0) {
      newRecords = [...currentServer]
      newRecords[existingIndex] = { ...record, id: currentServer[existingIndex].id }
    } else {
      newRecords = [...currentServer, { ...record, id: Math.random().toString(36).substr(2, 9) }]
    }

    set({ records: newRecords })
    await api.obs.sync(newRecords)
  },
  deleteRecord: async (id) => {
    const currentServer = await api.obs.list(true)
    const newRecords = currentServer.filter((r) => r.id !== id)
    set({ records: newRecords })
    await api.obs.sync(newRecords)
  },
}))
