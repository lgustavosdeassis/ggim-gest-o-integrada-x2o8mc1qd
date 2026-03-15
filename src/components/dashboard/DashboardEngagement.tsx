import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function DashboardEngagement({ stats }: { stats: any }) {
  const { engagement, locations } = stats

  return (
    <div className="space-y-6 mt-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
      <div className="flex items-center gap-2 mb-4 print-hidden">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Engajamento e Logística
        </h2>
        <div className="h-px flex-1 bg-border ml-4"></div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 print-break-inside-avoid">
        {/* Engagement Cards */}
        <Card className="shadow-subtle">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Participações (PF)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold">{engagement.pfTotal}</div>
                <p className="text-xs text-muted-foreground mt-1">Bruto</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-semibold text-primary">{engagement.pfUnique}</div>
                <p className="text-xs text-primary/80">Únicos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-subtle">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Instituições (PJ)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold">{engagement.pjTotal}</div>
                <p className="text-xs text-muted-foreground mt-1">Bruto</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-semibold text-secondary">{engagement.pjUnique}</div>
                <p className="text-xs text-secondary/80">Únicas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Cards */}
        <Card className="shadow-subtle col-span-1 md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Uso de Locais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <div>
                <div className="text-3xl font-bold">{locations.total}</div>
                <p className="text-xs text-muted-foreground mt-1">Ocupações Totais</p>
              </div>
              <div className="h-10 w-px bg-border"></div>
              <div>
                <div className="text-3xl font-bold">{locations.unique}</div>
                <p className="text-xs text-muted-foreground mt-1">Locais Distintos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3 print-break-inside-avoid">
        <RankingCard title="Pessoas Mais Frequentes" ranking={engagement.pfRanking} type="pf" />
        <RankingCard title="Instituições Frequentes" ranking={engagement.pjRanking} type="pj" />
        <RankingCard title="Locais Mais Utilizados" ranking={locations.ranking} type="loc" />
      </div>
    </div>
  )
}

function RankingCard({ title, ranking, type }: { title: string; ranking: any; type: string }) {
  const badgeColor =
    type === 'pf' ? 'bg-primary' : type === 'pj' ? 'bg-secondary text-white' : 'bg-slate-700'

  return (
    <Card className="shadow-subtle bg-slate-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {ranking.names.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Top 1 ({ranking.max}x)
              </span>
            </div>
            <ul className="space-y-2">
              {ranking.names.slice(0, 5).map((name: string, i: number) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Badge
                    variant="secondary"
                    className={`${badgeColor} w-6 h-6 p-0 flex items-center justify-center rounded-full shrink-0`}
                  >
                    {i + 1}
                  </Badge>
                  <span className="truncate" title={name}>
                    {name}
                  </span>
                </li>
              ))}
              {ranking.names.length > 5 && (
                <li className="text-xs text-muted-foreground italic">
                  + {ranking.names.length - 5} empatados
                </li>
              )}
            </ul>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Sem dados</div>
        )}
      </CardContent>
    </Card>
  )
}
