import { create } from 'zustand'
import { ActivityRecord } from '@/lib/types'
import { api } from '@/lib/api'
import { toast } from 'sonner'

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

    try {
      await api.activities.syncUpdate((list) => [newActivity, ...list])
      set((state) => ({ activities: [newActivity, ...state.activities] }))
    } catch (e) {
      toast.error('Erro de Comunicação', {
        description: 'Não foi possível salvar o registro na nuvem central.',
      })
      throw e
    }
  },
  updateActivity: async (id, updated) => {
    try {
      await api.activities.syncUpdate((list) =>
        list.map((a) => (a.id === id ? { ...a, ...updated } : a)),
      )
      set((state) => ({
        activities: state.activities.map((a) => (a.id === id ? { ...a, ...updated } : a)),
      }))
    } catch (e) {
      toast.error('Erro de Comunicação', {
        description: 'Não foi possível atualizar o registro na nuvem central.',
      })
      throw e
    }
  },
  deleteActivity: async (id) => {
    try {
      await api.activities.syncUpdate((list) => list.filter((a) => a.id !== id))
      set((state) => ({
        activities: state.activities.filter((a) => a.id !== id),
      }))
    } catch (e) {
      toast.error('Erro de Comunicação', {
        description: 'Não foi possível excluir o registro na nuvem central.',
      })
      throw e
    }
  },
  bulkDeleteActivities: async (ids) => {
    try {
      await api.activities.syncUpdate((list) => list.filter((a) => !ids.includes(a.id)))
      set((state) => ({
        activities: state.activities.filter((a) => !ids.includes(a.id)),
      }))
    } catch (e) {
      toast.error('Erro de Comunicação', {
        description: 'Não foi possível excluir os registros em lote na nuvem.',
      })
      throw e
    }
  },
  importActivities: async (newActivities) => {
    const mapped = newActivities.map((a) => ({
      ...a,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    })) as ActivityRecord[]

    try {
      await api.activities.syncUpdate((list) => [...mapped, ...list])
      set((state) => ({ activities: [...mapped, ...state.activities] }))
    } catch (e) {
      toast.error('Erro de Comunicação', {
        description: 'Falha ao importar o lote de atividades na nuvem central.',
      })
      throw e
    }
  },
}))
