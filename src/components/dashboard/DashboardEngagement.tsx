import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function DashboardEngagement({ stats }: { stats: any }) {
  const { engagement } = stats

  return (
    <div className="space-y-6 mt-8 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
      <div className="flex items-center gap-2 mb-4 print-hidden">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Engajamento e Participação
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
                <p className="text-xs text-muted-foreground mt-1">Total Bruto</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-semibold text-primary">{engagement.pfUnique}</div>
                <p className="text-xs text-primary/80">Participantes Únicos</p>
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
                <p className="text-xs text-muted-foreground mt-1">Total Bruto</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-semibold text-secondary">{engagement.pjUnique}</div>
                <p className="text-xs text-secondary/80">Instituições Únicas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-subtle col-span-1 md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Estatísticas de Presença por Evento (PF)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-around mt-1">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800">
                  {engagement.pfStats.mean.toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Média
                </p>
              </div>
              <div className="w-px h-10 bg-border"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800">
                  {engagement.pfStats.median.toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Mediana
                </p>
              </div>
              <div className="w-px h-10 bg-border"></div>
              <div className="text-center max-w-[80px]">
                <div
                  className="text-2xl font-bold text-slate-800 truncate"
                  title={engagement.pfStats.mode.join(', ')}
                >
                  {engagement.pfStats.mode.join(', ') || 0}
                </div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Moda
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 print-break-inside-avoid">
        <RankingCard
          title="Pessoas Mais Frequentes (Top 1 Empatados)"
          ranking={engagement.pfRanking}
          type="pf"
        />
        <RankingCard
          title="Instituições Frequentes (Top 1 Empatados)"
          ranking={engagement.pjRanking}
          type="pj"
        />
      </div>
    </div>
  )
}

function RankingCard({ title, ranking, type }: { title: string; ranking: any; type: string }) {
  const badgeColor = type === 'pf' ? 'bg-primary' : 'bg-secondary text-white'

  return (
    <Card className="shadow-subtle bg-slate-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {ranking.names.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Frequência Máxima: {ranking.max}x
              </span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-2">
              {ranking.names.map((name: string, i: number) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-sm bg-white p-1.5 rounded-md border shadow-sm"
                >
                  <Badge
                    variant="secondary"
                    className={`${badgeColor} w-6 h-6 p-0 flex items-center justify-center rounded-full shrink-0`}
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
  )
}
