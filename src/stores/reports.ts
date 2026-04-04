import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

export interface ReportRecord {
  id: string
  report_type: 'mensal' | 'anual'
  period_year: number
  period_month: number | null
  name: string
  file_type: string
  url: string | null
  created_at: string
}

interface ReportState {
  reports: ReportRecord[]
  isFetching: boolean
  hasMore: boolean
  page: number
  fetchReports: (loadMore?: boolean) => Promise<void>
  addReport: (report: Omit<ReportRecord, 'id' | 'created_at'>) => Promise<void>
  deleteReport: (id: string) => Promise<void>
}

export const useReportStore = create<ReportState>()((set, get) => ({
  reports: [],
  isFetching: false,
  hasMore: true,
  page: 0,
  fetchReports: async (loadMore = false) => {
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
        .from('ggim_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error

      const fetchedData = (data || []) as ReportRecord[]

      set((prev) => {
        let newReports = []
        let newPage = prev.page
        let newHasMore = prev.hasMore

        if (isAppending) {
          newReports = [...prev.reports, ...fetchedData]
          newPage = prev.page + 1
          newHasMore = fetchedData.length === 50
        } else {
          newReports = fetchedData
          if (prev.page === 0) newPage = 1
          if (fetchedData.length < to - from + 1) {
            newHasMore = false
          } else if (fetchedData.length === to - from + 1) {
            newHasMore = true
          }
        }

        const unique = Array.from(new Map(newReports.map((item) => [item.id, item])).values())

        if (JSON.stringify(prev.reports) === JSON.stringify(unique)) {
          return { isFetching: false, page: newPage, hasMore: newHasMore }
        }

        return {
          reports: unique,
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
  addReport: async (report) => {
    try {
      const { error } = await supabase.from('ggim_reports').insert(report)
      if (error) throw error
      toast.success('Relatório anexado com sucesso.')
      get().fetchReports()
    } catch (e) {
      toast.error('Erro ao anexar relatório.')
      throw e
    }
  },
  deleteReport: async (id) => {
    try {
      const { error } = await supabase.from('ggim_reports').delete().eq('id', id)
      if (error) throw error
      toast.success('Relatório excluído.')
      get().fetchReports()
    } catch (e) {
      toast.error('Erro ao excluir relatório.')
      throw e
    }
  },
}))
