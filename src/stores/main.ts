import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ActivityRecord } from '@/lib/types'
import { mockActivities } from '@/lib/mock-data'

interface AppState {
  activities: ActivityRecord[]
  addActivity: (activity: Omit<ActivityRecord, 'id' | 'createdAt'>) => void
  updateActivity: (id: string, activity: Partial<ActivityRecord>) => void
  deleteActivity: (id: string) => void
  bulkDeleteActivities: (ids: string[]) => void
  importActivities: (activities: Omit<ActivityRecord, 'id' | 'createdAt'>[]) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activities: mockActivities,
      addActivity: (activity) =>
        set((state) => ({
          activities: [
            {
              ...activity,
              id: Math.random().toString(36).substr(2, 9),
              createdAt: new Date().toISOString(),
            } as ActivityRecord,
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
      importActivities: (newActivities) =>
        set((state) => ({
          activities: [
            ...newActivities.map(
              (a) =>
                ({
                  ...a,
                  id: Math.random().toString(36).substr(2, 9),
                  createdAt: new Date().toISOString(),
                }) as ActivityRecord,
            ),
            ...state.activities,
          ],
        })),
    }),
    {
      name: 'app-storage',
    },
  ),
)
