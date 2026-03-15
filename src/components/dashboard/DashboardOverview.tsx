import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Activity, CalendarDays, CheckCircle2, Clock, Landmark } from 'lucide-react'
import { Pie, PieChart, ResponsiveContainer, Tooltip, Legend, Cell } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { DashboardStats } from './StatsUtils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function DashboardOverview({ data }: { data: DashboardStats['overview'] }) {
  return (
    <div className="space-y-6 print-break-inside-avoid">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-xl font-bold border-l-4 border-primary pl-3">Visão Geral</h3>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        <Card className="border-muted/60 shadow-sm bg-card hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ocorrências / Eventos
            </CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalEvents}</div>
          </CardContent>
        </Card>
        <Card className="border-muted/60 shadow-sm bg-card hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Reuniões Formais
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.formalMeetings}</div>
          </CardContent>
        </Card>
        <Card className="border-muted/60 shadow-sm bg-card hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Institucionais
            </CardTitle>
            <Landmark className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.institutionalEvents}</div>
          </CardContent>
        </Card>
        <Card className="border-muted/60 shadow-sm bg-card hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ações Geradas
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.actionsGenerated}</div>
          </CardContent>
        </Card>
        <Card className="border-muted/60 shadow-sm bg-card hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Horas
            </CardTitle>
            <Clock className="h-4 w-4 text-chart-5" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalHours.toFixed(1)}h</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-muted/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Eventos por Tipo</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <div className="max-h-[250px] overflow-auto px-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Qtd</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.eventsByType.map((t) => (
                    <TableRow key={t.name}>
                      <TableCell className="font-medium text-xs">{t.name}</TableCell>
                      <TableCell className="text-right text-xs">{t.value}</TableCell>
                    </TableRow>
                  ))}
                  {data.eventsByType.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-xs">
                        Sem dados
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Modalidade</CardTitle>
          </CardHeader>
          <CardContent>
            {data.modalityData.length > 0 ? (
              <ChartContainer config={{ value: { label: 'Eventos' } }} className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      content={
                        <ChartTooltipContent className="bg-popover border-border shadow-lg" />
                      }
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    <Pie
                      data={data.modalityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      dataKey="value"
                      stroke="hsl(var(--background))"
                      strokeWidth={2}
                    >
                      {data.modalityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                Sem dados
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
