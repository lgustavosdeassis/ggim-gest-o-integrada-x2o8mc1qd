import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { FileText, Files } from 'lucide-react'

export function DashboardProductivity({ stats }: { stats: any }) {
  if (!stats || stats.totalEvents === 0) return null

  const { productivity } = stats
  const barConfig = { value: { label: 'Arquivos', color: 'hsl(var(--chart-5))' } }

  return (
    <div className="space-y-6 mt-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      <div className="flex items-center gap-2 mb-4 print-hidden">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Produtividade e Evidências
        </h2>
        <div className="h-px flex-1 bg-border ml-4"></div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 print-break-inside-avoid">
        <div className="flex flex-col gap-4">
          <Card className="shadow-subtle flex-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Deliberações</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{productivity.deliberations}</div>
              <p className="text-xs text-muted-foreground mt-1">Registradas no sistema</p>
            </CardContent>
          </Card>

          <Card className="shadow-subtle flex-1 bg-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary">Total Geral Docs.</CardTitle>
              <Files className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{productivity.totalDocs}</div>
              <p className="text-xs text-primary/70 mt-1">Arquivos anexados ao sistema</p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-subtle col-span-1 md:col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Tipos de Arquivos Gerados</CardTitle>
          </CardHeader>
          <CardContent className="h-[200px]">
            {productivity.docsData.length > 0 ? (
              <ChartContainer config={barConfig} className="h-full w-full">
                <BarChart
                  data={productivity.docsData}
                  margin={{ top: 10, right: 0, bottom: 20, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                    dy={10}
                  />
                  <YAxis hide />
                  <ChartTooltip content={<ChartTooltipContent hideIndicator />} />
                  <Bar
                    dataKey="value"
                    fill="var(--color-value)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Sem documentos
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
