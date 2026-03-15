import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Map, Trophy } from 'lucide-react'
import { DashboardStats } from './StatsUtils'

export function DashboardLogistics({ data }: { data: DashboardStats['logistics'] }) {
  return (
    <div className="space-y-6 print-break-inside-avoid">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-xl font-bold border-l-4 border-chart-2 pl-3">Logística</h3>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-muted/60 shadow-sm bg-card hover:border-chart-2/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Usos Totais de Locais
            </CardTitle>
            <MapPin className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalUsages}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              Uso bruto (com repetições)
            </p>
          </CardContent>
        </Card>

        <Card className="border-muted/60 shadow-sm bg-card hover:border-chart-2/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Locais Únicos
            </CardTitle>
            <Map className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.uniqueLocations}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              Diferentes espaços utilizados
            </p>
          </CardContent>
        </Card>

        <Card className="border-muted/60 shadow-sm bg-card hover:border-chart-2/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Local Mais Utilizado
            </CardTitle>
            <Trophy className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {data.topLocation.count > 0 ? (
              <>
                <div className="text-lg font-bold leading-tight break-words">
                  {data.topLocation.names.join(' / ')}
                </div>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  Utilizado <span className="text-primary font-bold">{data.topLocation.count}</span>{' '}
                  vezes
                </p>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">Nenhum local registrado</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
