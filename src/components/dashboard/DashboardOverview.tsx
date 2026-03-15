import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ActivityIcon, Users, Building, Clock, CheckSquare } from 'lucide-react'
import { PieChart, Pie, Cell, Legend } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

export function DashboardOverview({ stats }: { stats: any }) {
  if (!stats || stats.totalEvents === 0) {
    return (
      <Card className="w-full mt-4 print-break-inside-avoid">
        <CardContent className="flex items-center justify-center p-12 text-muted-foreground">
          Nenhum dado encontrado para os filtros selecionados.
        </CardContent>
      </Card>
    )
  }

  const chartConfig = {
    value: { label: 'Eventos' },
  }

  return (
    <div className="flex flex-col gap-6 mt-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 print-break-inside-avoid">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
            <ActivityIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reuniões Formais</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReunioes}</div>
            <p className="text-xs text-muted-foreground">Ordinária/Extraord.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Institucionais</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInstitucionais}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ações Geradas</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAcoesGeradas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Horas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">Dedicadas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 print-break-inside-avoid">
        <Card className="col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Modalidade</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            {stats.modalityData.length > 0 ? (
              <ChartContainer config={chartConfig} className="w-full h-full">
                <PieChart>
                  <Pie
                    data={stats.modalityData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                  >
                    {stats.modalityData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Sem dados
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
