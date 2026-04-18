import { create } from 'zustand'
import pb from '@/lib/pocketbase/client'
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
  addReport: (report: any) => Promise<void>
  deleteReport: (id: string) => Promise<void>
}

export const useReportStore = create<ReportState>()((set, get) => ({
  reports: [],
  isFetching: false,
  hasMore: true,
  page: 0,
  fetchReports: async () => {
    const state = get()
    if (state.isFetching) return

    set({ isFetching: true })
    try {
      const records = await pb.collection('ggim_reports').getFullList({
        sort: '-created',
      })

      const fetchedData = records.map((r) => ({
        id: r.id,
        report_type: r.report_type as 'mensal' | 'anual',
        period_year: r.period_year,
        period_month: r.period_month || null,
        name: r.name,
        file_type: r.file_type,
        url: r.file ? pb.files.getURL(r, r.file) : r.url || null,
        created_at: r.created,
      }))

      set({
        reports: fetchedData,
        isFetching: false,
        hasMore: false,
      })
    } catch (e) {
      console.error(e)
      set({ isFetching: false })
    }
  },
  addReport: async (report) => {
    try {
      const formData = new FormData()
      formData.append('report_type', report.report_type)
      formData.append('period_year', report.period_year.toString())
      if (report.period_month) formData.append('period_month', report.period_month.toString())
      formData.append('name', report.name)
      formData.append('file_type', report.file_type)
      if (report.url) formData.append('url', report.url)
      if (report.file) formData.append('file', report.file)

      await pb.collection('ggim_reports').create(formData)
      toast.success('Relatório anexado com sucesso.')
      get().fetchReports()
    } catch (e) {
      toast.error('Erro ao anexar relatório.')
      throw e
    }
  },
  deleteReport: async (id) => {
    try {
      await pb.collection('ggim_reports').delete(id)
      toast.success('Relatório excluído.')
      get().fetchReports()
    } catch (e) {
      toast.error('Erro ao excluir relatório.')
      throw e
    }
  },
}))

export default useReportStore
