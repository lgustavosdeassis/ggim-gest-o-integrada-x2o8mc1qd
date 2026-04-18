import { create } from 'zustand'
import { ActivityRecord } from '@/lib/types'
import { api } from '@/lib/api'
import pb from '@/lib/pocketbase/client'
import { toast } from 'sonner'

interface AppState {
  activities: ActivityRecord[]
  isFetching: boolean
  hasMore: boolean
  page: number
  fetchActivities: (loadMore?: boolean) => Promise<void>
  addActivity: (activity: Omit<ActivityRecord, 'id' | 'createdAt'>) => Promise<void>
  updateActivity: (id: string, activity: Partial<ActivityRecord>) => Promise<void>
  deleteActivity: (id: string) => Promise<void>
  bulkDeleteActivities: (ids: string[]) => Promise<void>
  importActivities: (activities: Omit<ActivityRecord, 'id' | 'createdAt'>[]) => Promise<void>
}

export const useAppStore = create<AppState>()((set, get) => ({
  activities: [],
  isFetching: false,
  hasMore: true,
  page: 1,
  fetchActivities: async (loadMore = false) => {
    const state = get()
    if (state.isFetching) return

    set({ isFetching: true })
    try {
      const pageToFetch = loadMore ? state.page + 1 : 1
      const result = await pb.collection('activities').getList(pageToFetch, 50, {
        sort: '-meeting_start',
      })

      const formattedData = result.items.map((d: any) => ({
        id: d.id,
        eventName: d.event_name,
        instance: d.instance,
        eventType: d.event_type,
        modality: d.modality,
        location: d.location,
        meetingStart: d.meeting_start,
        meetingEnd: d.meeting_end,
        hasAdditionalDays: d.has_additional_days,
        additionalDays: d.additional_days,
        hasAction: d.has_action,
        actionStart: d.action_start,
        actionEnd: d.action_end,
        actions: d.actions,
        participantsPF: d.participants_pf,
        participantsPJ: d.participants_pj,
        documents: d.documents,
        deliberations: d.deliberations,
        description: d.description,
        createdAt: d.created,
      })) as ActivityRecord[]

      set((prev) => {
        let newActivities = []
        if (loadMore) {
          newActivities = [...prev.activities, ...formattedData]
        } else {
          newActivities = formattedData
        }

        const unique = Array.from(new Map(newActivities.map((item) => [item.id, item])).values())

        return {
          activities: unique,
          isFetching: false,
          page: pageToFetch,
          hasMore: pageToFetch < result.totalPages,
        }
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
      toast.success('Sucesso', { description: 'Registro salvo com sucesso!' })
    } catch (e: any) {
      console.error(e)
      if (e?.status === 403) {
        toast.error('Erro', { description: 'Você não tem permissão para realizar esta ação.' })
      } else {
        toast.error('Erro', {
          description: 'Erro ao salvar o registro. Por favor, tente novamente.',
        })
      }
      throw e
    }
  },
  updateActivity: async (id, updated) => {
    try {
      const newAct = await api.activities.update(id, updated)
      set((state) => ({
        activities: state.activities.map((a) => (a.id === id ? { ...a, ...newAct } : a)),
      }))
      toast.success('Sucesso', { description: 'Registro salvo com sucesso!' })
    } catch (e: any) {
      console.error(e)
      if (e?.status === 403) {
        toast.error('Erro', { description: 'Você não tem permissão para realizar esta ação.' })
      } else {
        toast.error('Erro', {
          description: 'Erro ao salvar o registro. Por favor, tente novamente.',
        })
      }
      throw e
    }
  },
  deleteActivity: async (id) => {
    try {
      await api.activities.delete(id)
      set((state) => ({
        activities: state.activities.filter((a) => a.id !== id),
      }))
      toast.success('Sucesso', { description: 'Registro excluído com sucesso!' })
    } catch (e: any) {
      console.error(e)
      if (e?.status === 403) {
        toast.error('Erro', { description: 'Você não tem permissão para realizar esta ação.' })
      } else {
        toast.error('Erro', {
          description: 'Erro ao excluir o registro. Por favor, tente novamente.',
        })
      }
      throw e
    }
  },
  bulkDeleteActivities: async (ids) => {
    try {
      await api.activities.bulkDelete(ids)
      set((state) => ({
        activities: state.activities.filter((a) => !ids.includes(a.id)),
      }))
      toast.success('Sucesso', { description: 'Registros excluídos com sucesso!' })
    } catch (e: any) {
      console.error(e)
      if (e?.status === 403) {
        toast.error('Erro', { description: 'Você não tem permissão para realizar esta ação.' })
      } else {
        toast.error('Erro', {
          description: 'Erro ao excluir o registro. Por favor, tente novamente.',
        })
      }
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
