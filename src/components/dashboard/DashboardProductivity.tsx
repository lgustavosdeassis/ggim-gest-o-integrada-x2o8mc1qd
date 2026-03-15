import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Target } from 'lucide-react'
import { DashboardStats } from './StatsUtils'

export function DashboardProductivity({ data }: { data: DashboardStats['productivity'] }) {
  return (
    <div className="space-y-6 print-break-inside-avoid">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-xl font-bold border-l-4 border-chart-4 pl-3">Produtividade</h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card className="border-muted/60 shadow-sm hover:border-chart-4/50 transition-colors">
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

        <Card className="border-muted/60 shadow-sm hover:border-chart-5/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Documentos Anexados
            </CardTitle>
            <FileText className="h-4 w-4 text-chart-5" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{data.totalDocs}</div>
            <p className="text-xs text-muted-foreground mt-1">Soma geral no período</p>
          </CardContent>
        </Card>

        <Card className="border-muted/60 shadow-sm md:col-span-2 bg-muted/5">
          <CardHeader className="pb-3 border-b border-border/50 mb-4">
            <CardTitle className="text-sm font-medium text-foreground">
              Detalhamento de Documentos por Tipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {data.docsData.map((d) => (
                <div
                  key={d.name}
                  className="flex flex-col p-3 bg-background rounded-lg border border-border/60 shadow-sm"
                >
                  <span className="text-xs text-muted-foreground font-semibold truncate">
                    {d.name}
                  </span>
                  <span className="text-xl font-bold text-primary mt-1">{d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
