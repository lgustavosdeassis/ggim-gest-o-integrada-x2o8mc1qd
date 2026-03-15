import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, AlertTriangle, CheckCircle2, Clock, ShieldAlert } from 'lucide-react'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

// Mock data structure
type DashboardData =
  | {
      totalEvents: number
      activeIncidents: number
      resolvedToday: number
      pendingAnalysis: number
      eventsByMonth: Array<{ name: string; total: number }>
    }
  | null
  | undefined

const mockData: DashboardData = {
  totalEvents: 1248,
  activeIncidents: 42,
  resolvedToday: 18,
  pendingAnalysis: 7,
  eventsByMonth: [
    { name: 'Jan', total: 120 },
    { name: 'Fev', total: 150 },
    { name: 'Mar', total: 180 },
    { name: 'Abr', total: 220 },
    { name: 'Mai', total: 190 },
    { name: 'Jun', total: 240 },
  ],
}

export function DashboardOverview() {
  const [data, setData] = useState<DashboardData>(undefined)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API fetch delay
    const timer = setTimeout(() => {
      setData(mockData)
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  // BUG FIX: Safely access data properties with a fallback object.
  // This prevents "Cannot read properties of undefined (reading 'totalEvents')"
  // when the component renders before data is fully loaded or if the API returns null/undefined.
  const safeData = data || {
    totalEvents: 0,
    activeIncidents: 0,
    resolvedToday: 0,
    pendingAnalysis: 0,
    eventsByMonth: [],
  }

  return (
    <div className="flex flex-col gap-4 md:gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Totais</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : safeData.totalEvents}</div>
            <p className="text-xs text-muted-foreground">+20.1% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ocorrências Ativas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {isLoading ? '...' : safeData.activeIncidents}
            </div>
            <p className="text-xs text-muted-foreground">Requerem atenção imediata</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolvidos Hoje</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : safeData.resolvedToday}</div>
            <p className="text-xs text-muted-foreground">+12 incidentes desde ontem</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Análise</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : safeData.pendingAnalysis}</div>
            <p className="text-xs text-muted-foreground">Aguardando verificação</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Visão Geral de Eventos</CardTitle>
            <CardDescription>
              Comparativo de eventos registrados nos últimos 6 meses.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer
              config={{
                total: {
                  label: 'Total de Eventos',
                  color: 'hsl(var(--primary))',
                },
              }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={safeData.eventsByMonth}>
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Ocorrências Recentes</CardTitle>
            <CardDescription>Últimos incidentes reportados na central.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {[
                {
                  title: 'Acidente de Trânsito',
                  time: 'Há 10 min',
                  status: 'Crítico',
                  icon: AlertTriangle,
                  color: 'text-red-500',
                },
                {
                  title: 'Aglomeração Suspeita',
                  time: 'Há 35 min',
                  status: 'Atenção',
                  icon: ShieldAlert,
                  color: 'text-yellow-500',
                },
                {
                  title: 'Queda de Árvore',
                  time: 'Há 2 horas',
                  status: 'Resolvido',
                  icon: CheckCircle2,
                  color: 'text-emerald-500',
                },
                {
                  title: 'Semáforo Inoperante',
                  time: 'Há 3 horas',
                  status: 'Em andamento',
                  icon: Clock,
                  color: 'text-blue-500',
                },
              ].map((item, i) => (
                <div key={i} className="flex items-center">
                  <div className={`mr-4 rounded-full p-2 bg-muted/50 ${item.color}`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium leading-none">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.status}</p>
                  </div>
                  <div className="font-medium text-xs text-muted-foreground">{item.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
