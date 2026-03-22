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
    const current = get().records
    const existingIndex = current.findIndex((r) => r.date === record.date)
    let newRecords: VideoRecord[]

    if (existingIndex >= 0) {
      newRecords = [...current]
      newRecords[existingIndex] = { ...record, id: current[existingIndex].id }
    } else {
      newRecords = [...current, { ...record, id: Math.random().toString(36).substr(2, 9) }]
    }

    set({ records: newRecords })
    await api.video.sync(newRecords)
  },
  deleteRecord: async (id) => {
    const newRecords = get().records.filter((r) => r.id !== id)
    set({ records: newRecords })
    await api.video.sync(newRecords)
  },
}))
