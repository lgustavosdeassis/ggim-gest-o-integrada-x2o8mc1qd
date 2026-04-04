import { create } from 'zustand'
import { ActivityRecord } from '@/lib/types'
import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase/client'
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
  page: 0,
  fetchActivities: async (loadMore = false) => {
    const state = get()
    if (state.isFetching) return

    set({ isFetching: true })
    try {
      let from = 0
      let to = 49
      let isAppending = false

      if (loadMore) {
        if (!state.hasMore) {
          set({ isFetching: false })
          return
        }
        from = state.page * 50
        to = from + 49
        isAppending = true
      } else {
        const currentLoadedCount = Math.max(50, state.page * 50)
        from = 0
        to = currentLoadedCount - 1
        isAppending = false
      }

      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('meeting_start', { ascending: false })
        .range(from, to)

      if (error) throw error

      const formattedData = (data || []).map((d: any) => ({
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
        createdAt: d.created_at,
      })) as ActivityRecord[]

      set((prev) => {
        let newActivities = []
        let newPage = prev.page
        let newHasMore = prev.hasMore

        if (isAppending) {
          newActivities = [...prev.activities, ...formattedData]
          newPage = prev.page + 1
          newHasMore = formattedData.length === 50
        } else {
          newActivities = formattedData
          if (prev.page === 0) newPage = 1
          if (formattedData.length < to - from + 1) {
            newHasMore = false
          } else if (formattedData.length === to - from + 1) {
            newHasMore = true
          }
        }

        const unique = Array.from(new Map(newActivities.map((item) => [item.id, item])).values())

        if (JSON.stringify(prev.activities) === JSON.stringify(unique)) {
          return { isFetching: false, page: newPage, hasMore: newHasMore }
        }

        return {
          activities: unique,
          isFetching: false,
          page: newPage,
          hasMore: newHasMore,
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
