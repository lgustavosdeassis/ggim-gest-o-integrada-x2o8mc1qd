import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity as ActivityIcon, Users, FileText, Building } from 'lucide-react'
import { Bar, BarChart, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { mockActivities } from '@/lib/mock-data'

type DashboardData =
  | {
      totalEvents: number
      totalReunioes: number
      totalInstitucionais: number
      totalDocs: number
      eventTypeData: Array<{ name: string; value: number }>
      docsData: Array<{ name: string; value: number }>
    }
  | null
  | undefined

export function DashboardOverview() {
  const [data, setData] = useState<DashboardData>(undefined)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      let totalReunioes = 0
      let totalInstitucionais = 0
      let totalDocs = 0
      const evtCount: Record<string, number> = {}
      const docCount: Record<string, number> = {}

      mockActivities.forEach((r) => {
        evtCount[r.type] = (evtCount[r.type] || 0) + 1
        if (r.type.toLowerCase().includes('reunião')) totalReunioes++
        if (r.instance === 'Eventos Institucionais') totalInstitucionais++
        r.documents?.forEach((d) => {
          docCount[d.category] = (docCount[d.category] || 0) + 1
          totalDocs++
        })
      })

      setData({
        totalEvents: mockActivities.length || 0,
        totalReunioes,
        totalInstitucionais,
        totalDocs,
        eventTypeData: Object.entries(evtCount)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value),
        docsData: Object.entries(docCount)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value),
      })
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  // Safely access data properties with a fallback object to prevent TypeError
  const safeData = data || {
    totalEvents: 0,
    totalReunioes: 0,
    totalInstitucionais: 0,
    totalDocs: 0,
    eventTypeData: [],
    docsData: [],
  }

  return (
    <div className="flex flex-col gap-4 md:gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atividades Totais</CardTitle>
            <ActivityIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : safeData.totalEvents}</div>
            <p className="text-xs text-muted-foreground">Registros na plataforma</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reuniões</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : safeData.totalReunioes}</div>
            <p className="text-xs text-muted-foreground">Encontros de comitês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Institucionais</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : safeData.totalInstitucionais}
            </div>
            <p className="text-xs text-muted-foreground">Representações oficiais</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : safeData.totalDocs}</div>
            <p className="text-xs text-muted-foreground">Anexados aos eventos</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Eventos por Tipo</CardTitle>
            <CardDescription>Distribuição das atividades por categoria.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer
              config={{ value: { label: 'Quantidade', color: 'hsl(var(--primary))' } }}
              className="h-[300px] w-full"
            >
              <BarChart data={safeData.eventTypeData} layout="vertical" margin={{ left: 30 }}>
                <XAxis
                  type="number"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="var(--color-value)" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Documentos por Categoria</CardTitle>
            <CardDescription>Volume de documentação gerada por tipo.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer
              config={{ value: { label: 'Quantidade', color: 'hsl(var(--primary))' } }}
              className="h-[300px] w-full"
            >
              <BarChart data={safeData.docsData}>
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="number"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
