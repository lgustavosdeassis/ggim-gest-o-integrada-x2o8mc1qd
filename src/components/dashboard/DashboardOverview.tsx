import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
    <div className="space-y-6 print-break-inside-avoid animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-1.5 h-6 bg-primary rounded-full" />
        <h3 className="text-xl font-bold text-white">Visão Geral</h3>
      </div>

      <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-5">
        <Card className="border-border/20 shadow-lg bg-card hover:bg-muted/20 transition-all duration-300 rounded-2xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Ocorrências
            </CardTitle>
            <Activity className="h-5 w-5 text-primary drop-shadow-md" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-black text-white">{data.totalEvents}</div>
          </CardContent>
        </Card>

        <Card className="border-border/20 shadow-lg bg-card hover:bg-muted/20 transition-all duration-300 rounded-2xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-chart-2/5 rounded-full blur-2xl group-hover:bg-chart-2/10 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Formais
            </CardTitle>
            <CalendarDays className="h-5 w-5 text-chart-2 drop-shadow-md" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-black text-white">{data.formalMeetings}</div>
          </CardContent>
        </Card>

        <Card className="border-border/20 shadow-lg bg-card hover:bg-muted/20 transition-all duration-300 rounded-2xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-chart-3/5 rounded-full blur-2xl group-hover:bg-chart-3/10 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Institucionais
            </CardTitle>
            <Landmark className="h-5 w-5 text-chart-3 drop-shadow-md" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-black text-white">{data.institutionalEvents}</div>
          </CardContent>
        </Card>

        <Card className="border-border/20 shadow-lg bg-card hover:bg-muted/20 transition-all duration-300 rounded-2xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-chart-4/5 rounded-full blur-2xl group-hover:bg-chart-4/10 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Ações Geradas
            </CardTitle>
            <CheckCircle2 className="h-5 w-5 text-chart-4 drop-shadow-md" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-black text-white">{data.actionsGenerated}</div>
          </CardContent>
        </Card>

        <Card className="border-border/20 shadow-lg bg-card hover:bg-muted/20 transition-all duration-300 rounded-2xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-chart-5/5 rounded-full blur-2xl group-hover:bg-chart-5/10 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Horas Dedicadas
            </CardTitle>
            <Clock className="h-5 w-5 text-chart-5 drop-shadow-md" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-black text-white">
              {data.totalHours.toFixed(1)}
              <span className="text-xl text-muted-foreground ml-1">h</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Card className="border-border/20 shadow-lg bg-card rounded-2xl">
          <CardHeader className="border-b border-border/20 pb-4">
            <CardTitle className="text-base font-bold text-white">Eventos por Tipo</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[280px] overflow-auto px-6 py-2">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30 hover:bg-transparent">
                    <TableHead className="text-muted-foreground font-bold uppercase tracking-widest text-xs">
                      Tipo
                    </TableHead>
                    <TableHead className="text-right text-muted-foreground font-bold uppercase tracking-widest text-xs">
                      Qtd
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.eventsByType.map((t) => (
                    <TableRow key={t.name} className="border-border/10 hover:bg-muted/30">
                      <TableCell className="font-medium text-sm text-gray-200">{t.name}</TableCell>
                      <TableCell className="text-right font-bold text-primary">{t.value}</TableCell>
                    </TableRow>
                  ))}
                  {data.eventsByType.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={2}
                        className="text-center text-sm py-8 text-muted-foreground"
                      >
                        Sem dados disponíveis para os filtros selecionados
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/20 shadow-lg bg-card rounded-2xl">
          <CardHeader className="border-b border-border/20 pb-4">
            <CardTitle className="text-base font-bold text-white">
              Distribuição por Modalidade
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {data.modalityData.length > 0 ? (
              <ChartContainer config={{ value: { label: 'Eventos' } }} className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      content={
                        <ChartTooltipContent className="bg-popover border-border shadow-2xl font-medium" />
                      }
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={40}
                      iconType="circle"
                      wrapperStyle={{ fontSize: '13px', fontWeight: 500 }}
                    />
                    <Pie
                      data={data.modalityData}
                      cx="50%"
                      cy="45%"
                      innerRadius={70}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="transparent"
                    >
                      {data.modalityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm font-medium">
                Sem dados suficientes para exibição
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
