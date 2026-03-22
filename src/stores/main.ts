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

    // Optimistic UI Update
    set((state) => ({ activities: [newActivity, ...state.activities] }))

    // Atomic Background Sync (No overwriting)
    await api.activities.syncUpdate((list) => [newActivity, ...list])
    get().fetchActivities()
  },
  updateActivity: async (id, updated) => {
    set((state) => ({
      activities: state.activities.map((a) => (a.id === id ? { ...a, ...updated } : a)),
    }))

    await api.activities.syncUpdate((list) =>
      list.map((a) => (a.id === id ? { ...a, ...updated } : a)),
    )
    get().fetchActivities()
  },
  deleteActivity: async (id) => {
    set((state) => ({
      activities: state.activities.filter((a) => a.id !== id),
    }))

    await api.activities.syncUpdate((list) => list.filter((a) => a.id !== id))
    get().fetchActivities()
  },
  bulkDeleteActivities: async (ids) => {
    set((state) => ({
      activities: state.activities.filter((a) => !ids.includes(a.id)),
    }))

    await api.activities.syncUpdate((list) => list.filter((a) => !ids.includes(a.id)))
    get().fetchActivities()
  },
  importActivities: async (newActivities) => {
    const mapped = newActivities.map((a) => ({
      ...a,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    })) as ActivityRecord[]

    set((state) => ({ activities: [...mapped, ...state.activities] }))

    await api.activities.syncUpdate((list) => [...mapped, ...list])
    get().fetchActivities()
  },
}))
