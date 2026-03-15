import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Building2, UserCheck, Star, Calculator } from 'lucide-react'
import { DashboardStats } from './StatsUtils'

export function DashboardEngagement({ data }: { data: DashboardStats['engagement'] }) {
  return (
    <div className="space-y-6 print-break-inside-avoid">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-1.5 h-6 bg-chart-3 rounded-full" />
        <h3 className="text-xl font-bold text-foreground">Engajamento e Presenças</h3>
      </div>

      <div className="grid gap-5 grid-cols-2">
        <Card className="border-border shadow-sm bg-card hover:shadow-md transition-all rounded-2xl col-span-2 sm:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Participantes (PF)
            </CardTitle>
            <div className="p-2 bg-chart-3/10 rounded-lg">
              <Users className="h-5 w-5 text-chart-3" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end mt-2">
              <div>
                <div className="text-3xl font-black text-foreground">{data.pfTotal}</div>
                <p className="text-xs text-muted-foreground font-medium mt-1">Soma Bruta</p>
              </div>
              <div className="text-right border-l pl-5 border-border">
                <div className="text-2xl font-black text-primary">{data.pfUnique}</div>
                <p className="text-xs text-muted-foreground font-medium mt-1">Pessoas Únicas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm bg-card hover:shadow-md transition-all rounded-2xl col-span-2 sm:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Instituições (PJ)
            </CardTitle>
            <div className="p-2 bg-chart-4/10 rounded-lg">
              <Building2 className="h-5 w-5 text-chart-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end mt-2">
              <div>
                <div className="text-3xl font-black text-foreground">{data.pjTotal}</div>
                <p className="text-xs text-muted-foreground font-medium mt-1">Soma Bruta</p>
              </div>
              <div className="text-right border-l pl-5 border-border">
                <div className="text-2xl font-black text-primary">{data.pjUnique}</div>
                <p className="text-xs text-muted-foreground font-medium mt-1">Inst. Únicas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm bg-card hover:shadow-md transition-all rounded-2xl col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border mb-4">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-chart-1" />
              Presença Pessoal Mais Frequente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.topPf.count > 0 ? (
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-foreground leading-tight pr-4">
                  {data.topPf.names.join(' / ')}
                </div>
                <div className="shrink-0 text-center px-4 py-2 bg-secondary rounded-xl shadow-sm border border-secondary">
                  <span className="text-2xl font-black text-secondary-foreground block leading-none">
                    {data.topPf.count}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-secondary-foreground/80 mt-1 block">
                    Vezes
                  </span>
                </div>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground font-medium">Nenhum registro</span>
            )}
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm bg-card hover:shadow-md transition-all rounded-2xl col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border mb-4">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <Star className="h-4 w-4 text-chart-5" />
              Instituição Mais Frequente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.topPj.count > 0 ? (
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-foreground leading-tight pr-4">
                  {data.topPj.names.join(' / ')}
                </div>
                <div className="shrink-0 text-center px-4 py-2 bg-secondary rounded-xl shadow-sm border border-secondary">
                  <span className="text-2xl font-black text-secondary-foreground block leading-none">
                    {data.topPj.count}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-secondary-foreground/80 mt-1 block">
                    Represent.
                  </span>
                </div>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground font-medium">Nenhum registro</span>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-sm bg-muted/30 rounded-2xl">
        <CardHeader className="pb-4 border-b border-border mb-4">
          <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
            <Calculator className="h-4 w-4 text-primary" />
            Métricas de Público (PF/Evento)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 text-center divide-x divide-border">
            <div className="px-2">
              <p className="text-2xl font-black text-foreground">{data.pfStats.mean.toFixed(1)}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1.5">
                Média
              </p>
            </div>
            <div className="px-2">
              <p className="text-2xl font-black text-foreground">{data.pfStats.median}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1.5">
                Mediana
              </p>
            </div>
            <div className="px-2">
              <p className="text-2xl font-black text-foreground line-clamp-1">
                {data.pfStats.mode.length > 0 ? data.pfStats.mode.join(', ') : 'N/A'}
              </p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1.5">
                Moda
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
