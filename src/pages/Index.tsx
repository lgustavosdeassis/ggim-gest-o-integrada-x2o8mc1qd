import { DashboardOverview } from '@/components/dashboard/DashboardOverview'
import { DashboardEngagement } from '@/components/dashboard/DashboardEngagement'
import { DashboardLogistics } from '@/components/dashboard/DashboardLogistics'
import { DashboardProductivity } from '@/components/dashboard/DashboardProductivity'
import { Activity, Users, Truck, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Index() {
  return (
    <div className="flex-1 space-y-6 p-6 sm:p-8 pt-6 bg-background min-h-screen">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Painel Gerencial GGIM</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-muted/60 shadow-sm bg-card hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Ocorrências
            </CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">12.450</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              <span className="text-chart-3">+15%</span> em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
        <Card className="border-muted/60 shadow-sm bg-card hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Efetivo Engajado
            </CardTitle>
            <Users className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">845</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              Agentes em operação atualmente
            </p>
          </CardContent>
        </Card>
        <Card className="border-muted/60 shadow-sm bg-card hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Viaturas Disponíveis
            </CardTitle>
            <Truck className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">92%</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              Da frota total operacional
            </p>
          </CardContent>
        </Card>
        <Card className="border-muted/60 shadow-sm bg-card hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Atendimentos Concluídos
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">11.230</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              Taxa de resolução de <span className="text-chart-3 font-bold">90%</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <DashboardOverview />
        <DashboardEngagement />
        <DashboardLogistics />
        <DashboardProductivity />
      </div>
    </div>
  )
}
