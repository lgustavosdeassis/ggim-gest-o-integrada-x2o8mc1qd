import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Building2, UserCheck, Star, Calculator } from 'lucide-react'
import { DashboardStats } from './StatsUtils'

export function DashboardEngagement({ data }: { data: DashboardStats['engagement'] }) {
  return (
    <div className="space-y-6 print-break-inside-avoid">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-xl font-bold border-l-4 border-chart-3 pl-3">Engajamento</h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-muted/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Participações (PF)
            </CardTitle>
            <Users className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-baseline mt-2">
              <div>
                <div className="text-2xl font-bold">{data.pfTotal}</div>
                <p className="text-xs text-muted-foreground">Bruto</p>
              </div>
              <div className="text-right border-l pl-4 border-border/50">
                <div className="text-xl font-bold text-primary">{data.pfUnique}</div>
                <p className="text-xs text-muted-foreground">Únicos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Instituições (PJ)
            </CardTitle>
            <Building2 className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-baseline mt-2">
              <div>
                <div className="text-2xl font-bold">{data.pjTotal}</div>
                <p className="text-xs text-muted-foreground">Bruto</p>
              </div>
              <div className="text-right border-l pl-4 border-border/50">
                <div className="text-xl font-bold text-primary">{data.pjUnique}</div>
                <p className="text-xs text-muted-foreground">Únicas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              PF Mais Frequente
            </CardTitle>
            <UserCheck className="h-4 w-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            {data.topPf.count > 0 ? (
              <>
                <div
                  className="text-sm font-bold leading-tight line-clamp-2"
                  title={data.topPf.names.join(' / ')}
                >
                  {data.topPf.names.join(' / ')}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-primary font-bold">{data.topPf.count}</span> presenças
                </p>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">Nenhum</span>
            )}
          </CardContent>
        </Card>

        <Card className="border-muted/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              PJ Mais Frequente
            </CardTitle>
            <Star className="h-4 w-4 text-chart-5" />
          </CardHeader>
          <CardContent>
            {data.topPj.count > 0 ? (
              <>
                <div
                  className="text-sm font-bold leading-tight line-clamp-2"
                  title={data.topPj.names.join(' / ')}
                >
                  {data.topPj.names.join(' / ')}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-primary font-bold">{data.topPj.count}</span> representações
                </p>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">Nenhuma</span>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-muted/60 shadow-sm bg-muted/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calculator className="h-4 w-4 text-muted-foreground" />
            Estatísticas de Participação PF por Evento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center divide-x divide-border/50">
            <div>
              <p className="text-2xl font-bold">{data.pfStats.mean.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Média</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{data.pfStats.median}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Mediana</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {data.pfStats.mode.length > 0 ? data.pfStats.mode.join(', ') : 'N/A'}
              </p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Moda</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
