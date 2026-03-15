import { useMemo } from 'react'
import useDataStore from '@/stores/main'
import { DashboardFilters } from '@/components/dashboard/DashboardFilters'
import { DashboardOverview } from '@/components/dashboard/DashboardOverview'
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
        <p className="text-muted-foreground mt-1">
          Visão analítica das atividades do Gabinete de Gestão Integrada.
        </p>
      </div>

      <div className="hidden print:block mb-8 text-center">
        <h1 className="text-2xl font-bold">Relatório Gerencial GGIM</h1>
        <p className="text-sm text-gray-500">
          Período de referência - Dados extraídos em {new Date().toLocaleDateString('pt-BR')}
        </p>
      </div>

      <DashboardFilters />

      {filteredRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl bg-card border-dashed">
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
          <DashboardEngagement stats={stats} />
          <DashboardProductivity stats={stats} />
        </div>
      )}
    </div>
  )
}
