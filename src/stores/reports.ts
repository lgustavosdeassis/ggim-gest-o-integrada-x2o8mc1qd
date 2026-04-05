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
  fetchReports: () => Promise<void>
  addReport: (report: Omit<ReportRecord, 'id' | 'created_at'>) => Promise<void>
  deleteReport: (id: string) => Promise<void>
}

const useReportStore = create<ReportState>()((set, get) => ({
  reports: [],
  isFetching: false,
  hasMore: true,
  page: 0,
  fetchReports: async () => {
    const state = get()
    if (state.isFetching) return

    set({ isFetching: true })
    try {
      const { data, error } = await supabase
        .from('ggim_reports')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const fetchedData = (data || []) as ReportRecord[]

      set((prev) => {
        const isSame =
          prev.reports.length === fetchedData.length &&
          prev.reports.every(
            (r, i) => r.id === fetchedData[i].id && r.created_at === fetchedData[i].created_at,
          )

        if (isSame) {
          return { isFetching: false, hasMore: false }
        }

        return {
          reports: fetchedData,
          isFetching: false,
          hasMore: false,
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

export default useReportStore
