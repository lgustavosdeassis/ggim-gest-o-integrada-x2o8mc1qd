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
  fetchReports: () => Promise<void>
  addReport: (report: Omit<ReportRecord, 'id' | 'created_at'>) => Promise<void>
  deleteReport: (id: string) => Promise<void>
}

export const useReportStore = create<ReportState>()((set, get) => ({
  reports: [],
  isFetching: false,
  fetchReports: async () => {
    set({ isFetching: true })
    try {
      const allData: ReportRecord[] = []
      let from = 0
      const step = 25 // Chunk pequeno para prevenir erros de timeout com arquivos em Base64
      let hasMore = true
      let retryCount = 0

      while (hasMore) {
        try {
          const { data, error } = await supabase
            .from('ggim_reports')
            .select('*')
            .order('created_at', { ascending: false })
            .range(from, from + step - 1)

          if (error) throw error

          if (data && data.length > 0) {
            allData.push(...(data as ReportRecord[]))
            from += step
            if (data.length < step) hasMore = false
            retryCount = 0
          } else {
            hasMore = false
          }
        } catch (error) {
          console.warn(`Erro ao buscar ggim_reports lote ${from}. Retentando...`, error)
          retryCount++
          if (retryCount > 3) {
            console.error(`Falha ao buscar relatórios após 3 tentativas. Interrompendo lote.`)
            hasMore = false
          } else {
            await new Promise((r) => setTimeout(r, 2000 * retryCount))
          }
        }
      }

      set((state) => {
        if (JSON.stringify(state.reports) === JSON.stringify(allData)) {
          return { isFetching: false }
        }
        return { reports: allData, isFetching: false }
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
