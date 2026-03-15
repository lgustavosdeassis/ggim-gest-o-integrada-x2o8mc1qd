import { create } from 'zustand'
import { Activity } from '@/lib/types'
import { mockActivities } from '@/lib/mock-data'

interface AppState {
  activities: Activity[]
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt'>) => void
  updateActivity: (id: string, activity: Partial<Activity>) => void
  deleteActivity: (id: string) => void
  bulkDeleteActivities: (ids: string[]) => void
}

export const useAppStore = create<AppState>((set) => ({
  activities: mockActivities,
  addActivity: (activity) =>
    set((state) => ({
      activities: [
        {
          ...activity,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString(),
        } as Activity,
        ...state.activities,
      ],
    })),
  updateActivity: (id, updated) =>
    set((state) => ({
      activities: state.activities.map((a) => (a.id === id ? { ...a, ...updated } : a)),
    })),
  deleteActivity: (id) =>
    set((state) => ({
      activities: state.activities.filter((a) => a.id !== id),
    })),
  bulkDeleteActivities: (ids) =>
    set((state) => ({
      activities: state.activities.filter((a) => !ids.includes(a.id)),
    })),
}))
