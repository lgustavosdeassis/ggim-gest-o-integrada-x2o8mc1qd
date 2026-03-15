import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { Clock, Users, BookOpen, AlertCircle } from 'lucide-react'

export function DashboardOverview({ stats }: { stats: any }) {
  const chartConfig = {
    presencial: { label: 'Presencial', color: 'hsl(var(--chart-1))' },
    remota: { label: 'Remota', color: 'hsl(var(--chart-2))' },
    hibrida: { label: 'Híbrida', color: 'hsl(var(--chart-3))' },
  }

  const barConfig = {
    value: { label: 'Quantidade', color: 'hsl(var(--primary))' },
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-2 mb-4 print-hidden">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Visão Geral e Tempo
        </h2>
        <div className="h-px flex-1 bg-border ml-4"></div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="shadow-subtle border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Geral Eventos</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalEvents}</div>
          </CardContent>
        </Card>

        <Card className="shadow-subtle">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reuniões Formais</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-700">{stats.totalReunioes}</div>
          </CardContent>
        </Card>

        <Card className="shadow-subtle">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Instituc.</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-700">{stats.totalInstitucionais}</div>
          </CardContent>
        </Card>

        <Card className="shadow-subtle">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ações Geradas</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-700">{stats.totalAcoesGeradas}</div>
          </CardContent>
        </Card>

        <Card className="bg-secondary/10 border-secondary/30 shadow-subtle">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-secondary-foreground drop-shadow-sm">
              Total Horas Dedicadas
            </CardTitle>
            <Clock className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary">{Math.round(stats.totalHours)}h</div>
            <p className="text-xs text-muted-foreground mt-1">Soma de reuniões e ações</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 print-break-inside-avoid">
        <Card className="lg:col-span-4 shadow-subtle">
          <CardHeader>
            <CardTitle>Eventos por Tipo</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ChartContainer config={barConfig} className="h-full w-full">
              <BarChart
                data={stats.eventTypeData}
                layout="vertical"
                margin={{ top: 0, right: 0, bottom: 0, left: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  width={120}
                />
                <ChartTooltip content={<ChartTooltipContent hideIndicator />} />
                <Bar dataKey="value" fill="var(--color-value)" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 shadow-subtle">
          <CardHeader>
            <CardTitle>Proporção por Modalidade</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center h-[250px]">
            <ChartContainer config={chartConfig} className="h-full w-full max-w-[300px]">
              <PieChart>
                <Pie
                  data={stats.modalityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.modalityData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
