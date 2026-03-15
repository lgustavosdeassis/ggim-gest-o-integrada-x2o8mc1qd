import { createContext, useContext, useState, ReactNode, useMemo } from 'react'
import { ActivityRecord, DashboardFilters } from '@/lib/types'
import { mockRecords } from '@/lib/mock-data'

interface DataStore {
  records: ActivityRecord[]
  addRecord: (record: ActivityRecord) => void
  updateRecord: (id: string, record: Partial<ActivityRecord>) => void
  deleteRecord: (id: string) => void
  filters: DashboardFilters
  setFilters: (filters: DashboardFilters) => void
  filteredRecords: ActivityRecord[]
}

const DataStoreContext = createContext<DataStore | null>(null)

export function DataStoreProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<ActivityRecord[]>(mockRecords)
  const [filters, setFilters] = useState<DashboardFilters>({
    startDate: '',
    endDate: '',
    instances: [],
  })

  const addRecord = (record: ActivityRecord) => setRecords((prev) => [record, ...prev])

  const updateRecord = (id: string, updated: Partial<ActivityRecord>) => {
    setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated } : r)))
  }

  const deleteRecord = (id: string) => setRecords((prev) => prev.filter((r) => r.id !== id))

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      let match = true
      if (filters.instances.length > 0) {
        match = match && filters.instances.includes(r.instance)
      }
      if (filters.startDate) {
        match = match && new Date(r.meetingStart) >= new Date(filters.startDate)
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate)
        end.setHours(23, 59, 59, 999)
        match = match && new Date(r.meetingEnd) <= end
      }
      return match
    })
  }, [records, filters])

  return createContext({
    records,
    addRecord,
    updateRecord,
    deleteRecord,
    filters,
    setFilters,
    filteredRecords,
  })
    ? React.createElement(
        DataStoreContext.Provider,
        {
          value: {
            records,
            addRecord,
            updateRecord,
            deleteRecord,
            filters,
            setFilters,
            filteredRecords,
          },
        },
        children,
      )
    : null
}

export default function useDataStore() {
  const context = useContext(DataStoreContext)
  if (!context) throw new Error('useDataStore must be used within a DataStoreProvider')
  return context
}
