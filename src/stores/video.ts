import { create } from 'zustand'
import { api } from '@/lib/api'

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
    const currentServer = await api.video.list(true)
    const existingIndex = currentServer.findIndex((r) => r.date === record.date)
    let newRecords: VideoRecord[]

    if (existingIndex >= 0) {
      newRecords = [...currentServer]
      newRecords[existingIndex] = { ...record, id: currentServer[existingIndex].id }
    } else {
      newRecords = [...currentServer, { ...record, id: Math.random().toString(36).substr(2, 9) }]
    }

    set({ records: newRecords })
    await api.video.sync(newRecords)
  },
  deleteRecord: async (id) => {
    const currentServer = await api.video.list(true)
    const newRecords = currentServer.filter((r) => r.id !== id)
    set({ records: newRecords })
    await api.video.sync(newRecords)
  },
}))
