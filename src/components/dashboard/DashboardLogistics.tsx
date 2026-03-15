import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function DashboardLogistics({ stats }: { stats: any }) {
  const { locations } = stats

  return (
    <div className="space-y-6 mt-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
      <div className="flex items-center gap-2 mb-4 print-hidden">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Logística de Locais
        </h2>
        <div className="h-px flex-1 bg-border ml-4"></div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 print-break-inside-avoid">
        <Card className="shadow-subtle">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Uso de Locais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold">{locations.total}</div>
                <p className="text-xs text-muted-foreground mt-1">Ocupações Totais</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-semibold text-slate-700">{locations.unique}</div>
                <p className="text-xs text-slate-500">Locais Distintos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-subtle col-span-1 md:col-span-2 bg-slate-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Locais Mais Utilizados (Top 1)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {locations.ranking.names.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Frequência Máxima: {locations.ranking.max}x
                  </span>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[120px] overflow-y-auto">
                  {locations.ranking.names.map((name: string, i: number) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm bg-white p-1.5 rounded-md border shadow-sm"
                    >
                      <Badge
                        variant="secondary"
                        className="bg-slate-700 text-white w-6 h-6 p-0 flex items-center justify-center rounded-full shrink-0"
                      >
                        {i + 1}
                      </Badge>
                      <span className="truncate font-medium text-slate-700" title={name}>
                        {name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Sem dados</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
