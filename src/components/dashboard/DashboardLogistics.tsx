import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Map, Trophy } from 'lucide-react'
import { DashboardStats } from './StatsUtils'

export function DashboardLogistics({ data }: { data: DashboardStats['logistics'] }) {
  return (
    <div className="space-y-6 print-break-inside-avoid animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-1.5 h-6 bg-chart-2 rounded-full" />
        <h3 className="text-xl font-bold text-foreground">Infraestrutura e Locais</h3>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Card className="border-border shadow-sm bg-card hover:shadow-md transition-all rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Usos Totais
            </CardTitle>
            <div className="p-2 bg-chart-2/10 rounded-lg">
              <MapPin className="h-5 w-5 text-chart-2" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-foreground">{data.totalUsages}</div>
            <p className="text-sm text-muted-foreground mt-2 font-medium">Uso bruto de espaços</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm bg-card hover:shadow-md transition-all rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Locais Únicos
            </CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Map className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-foreground">{data.uniqueLocations}</div>
            <p className="text-sm text-muted-foreground mt-2 font-medium">
              Diferentes espaços físicos/virtuais
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm bg-muted/30 rounded-2xl sm:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border mb-4">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <Trophy className="h-5 w-5 text-secondary" />
              Local Mais Frequente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.topLocation.count > 0 ? (
              <div className="flex items-center justify-between">
                <div className="text-xl font-bold text-foreground leading-snug pr-6 break-words max-w-[70%]">
                  {data.topLocation.names.join(' / ')}
                </div>
                <div className="shrink-0 text-center px-5 py-3 bg-secondary rounded-xl shadow-sm border border-secondary">
                  <span className="text-3xl font-black text-secondary-foreground block leading-none">
                    {data.topLocation.count}
                  </span>
                  <span className="text-xs uppercase tracking-widest font-bold text-secondary-foreground/80 mt-1 block">
                    {data.topLocation.count === 1 ? 'Vez' : 'Vezes'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground font-medium py-2">
                Nenhum local registrado
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
