import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Target, Award } from 'lucide-react'
import { DashboardStats } from './StatsUtils'

export function DashboardProductivity({ data }: { data: DashboardStats['productivity'] }) {
  return (
    <div className="space-y-6 print-break-inside-avoid animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex items-center gap-3 mb-2 mt-4">
        <div className="w-1.5 h-6 bg-chart-4 rounded-full" />
        <h3 className="text-xl font-bold text-white">Produtividade Gerencial</h3>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border/20 shadow-lg bg-card hover:bg-muted/20 transition-all rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Total de Deliberações
            </CardTitle>
            <div className="p-2.5 bg-chart-4/10 rounded-xl">
              <Target className="h-5 w-5 text-chart-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-white">{data.totalDeliberations}</div>
            <p className="text-sm text-muted-foreground mt-2 font-medium">
              Acordos registrados formalmente
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/20 shadow-lg bg-card hover:bg-muted/20 transition-all rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Soma de Anexos
            </CardTitle>
            <div className="p-2.5 bg-chart-5/10 rounded-xl">
              <FileText className="h-5 w-5 text-chart-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-white">{data.totalDocs}</div>
            <p className="text-sm text-muted-foreground mt-2 font-medium">
              Documentos comprobatórios
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/20 shadow-lg bg-background/50 rounded-2xl md:col-span-2 lg:col-span-3">
          <CardHeader className="pb-4 border-b border-border/20 mb-5">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-white">
              <Award className="h-5 w-5 text-primary" />
              Detalhamento de Documentos por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {data.docsData.map((d) => (
                <div
                  key={d.name}
                  className="flex flex-col p-4 bg-card rounded-2xl border border-border/30 shadow-md transition-all hover:border-primary/50 group"
                >
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-gray-300 transition-colors">
                    {d.name}
                  </span>
                  <div className="flex items-end justify-between mt-2">
                    <span className="text-3xl font-black text-white">{d.value}</span>
                    <span className="text-xs font-semibold text-primary/80 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      REGISTROS
                    </span>
                  </div>
                  <div className="mt-3 w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${data.totalDocs > 0 ? Math.max((d.value / data.totalDocs) * 100, 2) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
