import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Target } from 'lucide-react'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { DashboardStats } from './StatsUtils'

export function DashboardProductivity({ data }: { data: DashboardStats['productivity'] }) {
  return (
    <div className="space-y-6 print-break-inside-avoid">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-xl font-bold border-l-4 border-chart-4 pl-3">Produtividade</h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-muted/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Deliberações
            </CardTitle>
            <Target className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{data.totalDeliberations}</div>
            <p className="text-xs text-muted-foreground mt-1">Acordos registrados formalmente</p>
          </CardContent>
        </Card>

        <Card className="border-muted/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Documentos
            </CardTitle>
            <FileText className="h-4 w-4 text-chart-5" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{data.totalDocs}</div>
            <p className="text-xs text-muted-foreground mt-1">Arquivos anexados no período</p>
          </CardContent>
        </Card>

        <Card className="border-muted/60 shadow-sm md:col-span-2 lg:col-span-1 row-span-2 lg:row-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Documentos por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.docsData.length > 0 ? (
              <ChartContainer config={{ value: { label: 'Qtd' } }} className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.docsData}
                    layout="vertical"
                    margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="hsl(var(--muted-foreground)/0.2)"
                    />
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={80}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                      content={<ChartTooltipContent className="bg-popover border-border" />}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {data.docsData.map((entry, index) => (
                        <cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">
                Nenhum documento
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
