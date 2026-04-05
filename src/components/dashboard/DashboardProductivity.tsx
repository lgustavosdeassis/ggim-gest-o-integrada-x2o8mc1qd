import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Target, Award } from 'lucide-react'
import { DashboardStats } from './StatsUtils'

function pluralizeDocType(type: string, count: number) {
  if (count === 1) return type
  const map: Record<string, string> = {
    Ata: 'Atas',
    Ofício: 'Ofícios',
    Relatório: 'Relatórios',
    Transcrição: 'Transcrições',
    'E-mail': 'E-mails',
    SID: 'SIDs',
    Formulário: 'Formulários',
    Foto: 'Fotos',
    Áudio: 'Áudios',
    Vídeo: 'Vídeos',
    'Lista de Presença': 'Listas de Presença',
    Link: 'Links',
    Outros: 'Outros',
  }
  return map[type] || type + 's'
}

export function DashboardProductivity({ data }: { data: DashboardStats['productivity'] }) {
  return (
    <div className="space-y-6 print-break-inside-avoid animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex items-center gap-3 mb-2 mt-4">
        <div className="w-1.5 h-6 bg-chart-4 rounded-full" />
        <h3 className="text-xl font-bold text-foreground">Produtividade Gerencial</h3>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border shadow-sm bg-card hover:shadow-md transition-all rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {data.totalDeliberations === 1 ? 'Deliberação' : 'Total de Deliberações'}
            </CardTitle>
            <div className="p-2.5 bg-chart-4/10 rounded-xl">
              <Target className="h-5 w-5 text-chart-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-foreground">{data.totalDeliberations}</div>
            <p className="text-sm text-muted-foreground mt-2 font-medium">
              Acordos registrados formalmente
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm bg-card hover:shadow-md transition-all rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {data.totalDocs === 1 ? 'Anexo' : 'Soma de Anexos'}
            </CardTitle>
            <div className="p-2.5 bg-chart-5/10 rounded-xl">
              <FileText className="h-5 w-5 text-chart-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-foreground">{data.totalDocs}</div>
            <p className="text-sm text-muted-foreground mt-2 font-medium">
              Documentos comprobatórios
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm bg-muted/30 rounded-2xl md:col-span-2 lg:col-span-3">
          <CardHeader className="pb-4 border-b border-border mb-5">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <Award className="h-5 w-5 text-secondary" />
              Detalhamento de Documentos por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {data.docsData.map((d) => (
                <div
                  key={d.name}
                  className="flex flex-col p-4 bg-card rounded-2xl border border-border shadow-sm transition-all hover:border-primary/50 hover:shadow-md group"
                >
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
                    {pluralizeDocType(d.name, d.value)}
                  </span>
                  <div className="flex items-end justify-between mt-2">
                    <span className="text-3xl font-black text-foreground">{d.value}</span>
                    <span className="text-xs font-semibold text-primary/80 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {d.value === 1 ? 'REGISTRO' : 'REGISTROS'}
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
