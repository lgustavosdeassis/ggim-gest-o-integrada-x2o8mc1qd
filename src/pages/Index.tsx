import { DashboardOverview } from '@/components/dashboard/DashboardOverview'
import { DashboardFilters } from '@/components/dashboard/DashboardFilters'

export default function Index() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard (BI)</h1>
        <p className="text-muted-foreground">Visão analítica das atividades do GGIM</p>
      </div>

      <DashboardFilters />
      <DashboardOverview />
    </div>
  )
}
