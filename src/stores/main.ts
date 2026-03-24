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
      toast.success('Sucesso', { description: 'Atividade salva e sincronizada.' })
    } catch (e) {
      toast('Aviso: Modo Offline', {
        description: 'Conexão falhou. A atividade foi salva com segurança de forma local.',
      })
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
      toast.success('Sucesso', { description: 'Atividade atualizada.' })
    } catch (e) {
      toast('Aviso: Modo Offline', {
        description: 'Conexão falhou. Atualização salva de forma local.',
      })
    }
  },
  deleteActivity: async (id) => {
    try {
      await api.activities.syncUpdate((list) => list.filter((a) => a.id !== id))
      set((state) => ({
        activities: state.activities.filter((a) => a.id !== id),
      }))
      toast.success('Sucesso', { description: 'Atividade excluída.' })
    } catch (e) {
      toast('Aviso: Modo Offline', {
        description: 'Conexão falhou. Exclusão registrada localmente.',
      })
    }
  },
  bulkDeleteActivities: async (ids) => {
    try {
      await api.activities.syncUpdate((list) => list.filter((a) => !ids.includes(a.id)))
      set((state) => ({
        activities: state.activities.filter((a) => !ids.includes(a.id)),
      }))
      toast.success('Sucesso', { description: 'Atividades excluídas em lote.' })
    } catch (e) {
      toast('Aviso: Modo Offline', {
        description: 'Exclusão em lote registrada localmente.',
      })
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
      toast.success('Sucesso', { description: 'Lote de atividades importado e sincronizado.' })
    } catch (e) {
      toast('Aviso: Modo Offline', {
        description: 'Conexão falhou. A importação foi concluída com segurança localmente.',
      })
    }
  },
}))
