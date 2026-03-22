import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  addRecord: (record: Omit<ObsRecord, 'id'>) => void
  deleteRecord: (id: string) => void
}

export const useObsStore = create<ObsState>()(
  persist(
    (set) => ({
      records: [
        {
          id: 'o1',
          date: '2026-02',
          sinistrosVitimas: 58,
          sinistrosTotal: 324,
          autosInfracao: 16716,
          homicidios: 4,
          violenciaDomestica: 244,
          roubos: 89,
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
      name: 'obs-storage',
    },
  ),
)

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'obs-storage') {
      useObsStore.persist.rehydrate()
    }
  })
}
