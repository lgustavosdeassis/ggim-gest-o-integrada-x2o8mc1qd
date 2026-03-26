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
      set((state) => {
        // Prevent unnecessary re-renders and form resets during background polling
        const isSame = JSON.stringify(state.activities) === JSON.stringify(data)
        if (isSame) {
          return { isFetching: false }
        }
        return { activities: data as ActivityRecord[], isFetching: false }
      })
    } catch (e) {
      console.error(e)
      set({ isFetching: false })
    }
  },
  addActivity: async (activity) => {
    try {
      const newAct = await api.activities.create(activity)
      set((state) => ({ activities: [newAct as ActivityRecord, ...state.activities] }))
      toast.success('Sucesso', { description: 'Atividade salva e sincronizada na nuvem.' })
    } catch (e: any) {
      console.error(e)
      toast.error('Erro', { description: 'Falha ao salvar atividade na nuvem.' })
      throw e
    }
  },
  updateActivity: async (id, updated) => {
    try {
      const newAct = await api.activities.update(id, updated)
      set((state) => ({
        activities: state.activities.map((a) => (a.id === id ? { ...a, ...newAct } : a)),
      }))
      toast.success('Sucesso', { description: 'Atividade atualizada na nuvem.' })
    } catch (e: any) {
      console.error(e)
      toast.error('Erro', { description: 'Falha ao atualizar atividade na nuvem.' })
      throw e
    }
  },
  deleteActivity: async (id) => {
    try {
      await api.activities.delete(id)
      set((state) => ({
        activities: state.activities.filter((a) => a.id !== id),
      }))
      toast.success('Sucesso', { description: 'Atividade excluída da nuvem.' })
    } catch (e: any) {
      console.error(e)
      toast.error('Erro', { description: 'Falha ao excluir a atividade.' })
      throw e
    }
  },
  bulkDeleteActivities: async (ids) => {
    try {
      await api.activities.bulkDelete(ids)
      set((state) => ({
        activities: state.activities.filter((a) => !ids.includes(a.id)),
      }))
      toast.success('Sucesso', { description: 'Atividades excluídas em lote.' })
    } catch (e: any) {
      console.error(e)
      toast.error('Erro', { description: 'Falha na exclusão em lote.' })
      throw e
    }
  },
  importActivities: async (newActivities) => {
    try {
      for (const act of newActivities) {
        await api.activities.create(act)
      }
      await get().fetchActivities()
      toast.success('Sucesso', { description: 'Lote de atividades importado e sincronizado.' })
    } catch (e: any) {
      console.error(e)
      toast.error('Erro', { description: 'Falha ao importar atividades.' })
      throw e
    }
  },
}))
