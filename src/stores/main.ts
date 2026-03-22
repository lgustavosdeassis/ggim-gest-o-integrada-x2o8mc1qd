import { create } from 'zustand'
import { ActivityRecord } from '@/lib/types'
import { api } from '@/lib/api'

interface AppState {
  activities: ActivityRecord[]
  isFetching: boolean
  fetchActivities: () => Promise<void>
  addActivity: (activity: Omit<ActivityRecord, 'id' | 'createdAt'>) => Promise<void>
  updateActivity: (id: string, activity: Partial<ActivityRecord>) => Promise<void>
  deleteActivity: (id: string) => Promise<void>
  bulkDeleteActivities: (ids: string[]) => Promise<void>
  importActivities: (activities: Omit<ActivityRecord, 'id' | 'createdAt'>[]) => Promise<void>
}

export const useAppStore = create<AppState>()((set, get) => ({
  activities: [],
  isFetching: false,
  fetchActivities: async () => {
    set({ isFetching: true })
    try {
      const data = await api.activities.list()
      set({ activities: data, isFetching: false })
    } catch (e) {
      set({ isFetching: false })
    }
  },
  addActivity: async (activity) => {
    const newActivity = {
      ...activity,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    } as ActivityRecord
    const newActivities = [newActivity, ...get().activities]
    set({ activities: newActivities })
    await api.activities.sync(newActivities)
  },
  updateActivity: async (id, updated) => {
    const newActivities = get().activities.map((a) => (a.id === id ? { ...a, ...updated } : a))
    set({ activities: newActivities })
    await api.activities.sync(newActivities)
  },
  deleteActivity: async (id) => {
    const newActivities = get().activities.filter((a) => a.id !== id)
    set({ activities: newActivities })
    await api.activities.sync(newActivities)
  },
  bulkDeleteActivities: async (ids) => {
    const newActivities = get().activities.filter((a) => !ids.includes(a.id))
    set({ activities: newActivities })
    await api.activities.sync(newActivities)
  },
  importActivities: async (newActivities) => {
    const mapped = newActivities.map(
      (a) =>
        ({
          ...a,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString(),
        }) as ActivityRecord,
    )
    const combined = [...mapped, ...get().activities]
    set({ activities: combined })
    await api.activities.sync(combined)
  },
}))
