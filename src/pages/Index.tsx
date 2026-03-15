import { useMemo } from 'react'
import useDataStore from '@/stores/main'
import { DashboardFilters } from '@/components/dashboard/DashboardFilters'
import { DashboardOverview } from '@/components/dashboard/DashboardOverview'
import { DashboardLogistics } from '@/components/dashboard/DashboardLogistics'
import { DashboardEngagement } from '@/components/dashboard/DashboardEngagement'
import { DashboardProductivity } from '@/components/dashboard/DashboardProductivity'
import { calculateDashboardStats } from '@/components/dashboard/StatsUtils'

export default function Index() {
  const { filteredRecords } = useDataStore()

  const stats = useMemo(() => calculateDashboardStats(filteredRecords), [filteredRecords])

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-6 print-hidden">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Dashboard de Desempenho</h1>
        <p className="text-muted-foreground mt-1">Visão analítica das atividades do GGIM.</p>
      </div>

      <div className="hidden print:flex mb-8 items-center justify-between border-b pb-4">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="GGIM Logo" className="w-16 h-16 object-contain" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Gabinete de Gestão Integrada Municipal de Foz do Iguaçu (GGIM)
            </h1>
            <h2 className="text-lg text-slate-600 font-medium">
              Relatório Gerencial - Painel de BI
            </h2>
          </div>
        </div>
        <div className="text-right text-sm text-slate-500 font-medium">
          <p>Período de Referência</p>
          <p>Extraído em: {new Date().toLocaleDateString('pt-BR')}</p>
        </div>
      </div>

      <DashboardFilters />

      {filteredRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl bg-card border-dashed print-hidden">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <span className="text-xl">📊</span>
          </div>
          <h3 className="text-lg font-medium">Nenhum dado encontrado</h3>
          <p className="text-muted-foreground text-sm max-w-sm mt-1">
            Ajuste os filtros acima ou registre novas atividades para visualizar o dashboard.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <DashboardOverview stats={stats} />
          <DashboardLogistics stats={stats} />
          <DashboardEngagement stats={stats} />
          <DashboardProductivity stats={stats} />
        </div>
      )}
    </div>
  )
}
