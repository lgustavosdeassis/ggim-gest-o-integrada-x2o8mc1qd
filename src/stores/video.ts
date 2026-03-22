import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  addRecord: (record: Omit<VideoRecord, 'id'>) => void
  deleteRecord: (id: string) => void
}

export const useVideoStore = create<VideoState>()(
  persist(
    (set) => ({
      records: [
        {
          id: 'v1',
          date: '2026-02',
          particulares: 3,
          instituicoes: 7,
          imprensa: 0,
          operadores: 21,
        },
      ],
      addRecord: (record) =>
        set((state) => {
          const existingIndex = state.records.findIndex((r) => r.date === record.date)
          if (existingIndex >= 0) {
            const newRecords = [...state.records]
            newRecords[existingIndex] = { ...record, id: state.records[existingIndex].id }
            return { records: newRecords }
          }
          return {
            records: [...state.records, { ...record, id: Math.random().toString(36).substr(2, 9) }],
          }
        }),
      deleteRecord: (id) =>
        set((state) => ({
          records: state.records.filter((r) => r.id !== id),
        })),
    }),
    {
      name: 'video-storage',
    },
  ),
)

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'video-storage') {
      useVideoStore.persist.rehydrate()
    }
  })
}
