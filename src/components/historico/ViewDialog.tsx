import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Clock, Eye, Download, FileX } from 'lucide-react'
import { formatDateTime, parseSemicolonList, calculateHoursDifference } from '@/lib/utils'
import { ActivityRecord, Document as ActivityDocument } from '@/lib/types'

export function ViewDialog({
  viewActivity,
  setViewActivity,
}: {
  viewActivity: ActivityRecord | null
  setViewActivity: (v: ActivityRecord | null) => void
}) {
  if (!viewActivity) return null

  const handleView = (doc: ActivityDocument) => {
    const content = `Conteúdo simulado para o documento: ${doc.name}\nTipo: ${doc.type}`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const handleDownload = (doc: ActivityDocument) => {
    const content = `Conteúdo simulado para o documento: ${doc.name}\nTipo: ${doc.type}`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = doc.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <Dialog open={!!viewActivity} onOpenChange={(open) => !open && setViewActivity(null)}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-card border-border shadow-2xl rounded-2xl p-0">
        <DialogHeader className="p-6 border-b border-border bg-muted/50 sticky top-0 z-10 backdrop-blur-xl">
          <DialogTitle className="text-xl font-black text-foreground flex items-center gap-3">
            <div className="w-2 h-6 bg-primary rounded-full" />
            Espelho Completo do Registro
          </DialogTitle>
          <DialogDescription className="sr-only">
            Informações completas do registro.
          </DialogDescription>
        </DialogHeader>
        <div className="p-6 space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-6">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">
                Instância
              </span>
              <p className="font-bold text-foreground">{viewActivity.instance}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">
                Tipologia
              </span>
              <p className="font-bold text-foreground">{viewActivity.eventType}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">
                Modalidade
              </span>
              <p className="font-bold text-foreground">{viewActivity.modality}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">
                Localização
              </span>
              <p className="font-bold text-foreground">{viewActivity.location}</p>
            </div>
          </div>

          <div className="bg-muted/30 p-5 rounded-2xl border border-border">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> Tempo e Ações
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-sm font-medium text-muted-foreground">
                  Base ({formatDateTime(viewActivity.meetingStart)} a{' '}
                  {formatDateTime(viewActivity.meetingEnd)})
                </span>
                <span className="font-mono font-bold text-foreground bg-muted px-2 py-1 rounded">
                  {calculateHoursDifference(
                    viewActivity.meetingStart,
                    viewActivity.meetingEnd,
                  ).toFixed(1)}
                  h
                </span>
              </div>

              {viewActivity.actions && viewActivity.actions.length > 0 && (
                <div className="pt-2 space-y-2">
                  {viewActivity.actions.map((a, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center text-sm bg-card p-3 rounded-xl border border-border"
                    >
                      <span className="font-medium text-muted-foreground">
                        Ação Extra #{i + 1} ({formatDateTime(a.start).substring(0, 5)} a{' '}
                        {formatDateTime(a.end).substring(0, 5)})
                      </span>
                      <span className="font-mono font-bold text-primary">
                        +{calculateHoursDifference(a.start, a.end).toFixed(1)}h
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center pt-3 mt-1">
                <span className="font-black text-foreground uppercase tracking-widest text-sm">
                  Horas Dedicadas (Soma):
                </span>
                <span className="text-xl font-black text-primary">
                  {(
                    calculateHoursDifference(viewActivity.meetingStart, viewActivity.meetingEnd) +
                    (viewActivity.actions || []).reduce(
                      (acc, a) => acc + calculateHoursDifference(a.start, a.end),
                      0,
                    )
                  ).toFixed(1)}
                  h
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-between mb-2">
                Nomes (PF){' '}
                <span className="bg-muted px-2 py-0.5 rounded text-foreground">
                  {parseSemicolonList(viewActivity.participantsPF).length}
                </span>
              </span>
              <div className="p-4 bg-muted/50 rounded-xl border border-border text-sm text-foreground leading-relaxed max-h-40 overflow-y-auto font-medium">
                {viewActivity.participantsPF
                  ? parseSemicolonList(viewActivity.participantsPF).join(' • ')
                  : 'Sem dados.'}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-between mb-2">
                Instituições (PJ){' '}
                <span className="bg-muted px-2 py-0.5 rounded text-foreground">
                  {parseSemicolonList(viewActivity.participantsPJ).length}
                </span>
              </span>
              <div className="p-4 bg-muted/50 rounded-xl border border-border text-sm text-foreground leading-relaxed max-h-40 overflow-y-auto font-medium">
                {viewActivity.participantsPJ
                  ? parseSemicolonList(viewActivity.participantsPJ).join(' • ')
                  : 'Sem dados.'}
              </div>
            </div>
          </div>

          {viewActivity.deliberations && (
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-between mb-2">
                Deliberações Firmadas{' '}
                <span className="bg-muted px-2 py-0.5 rounded text-foreground">
                  {parseSemicolonList(viewActivity.deliberations).length}
                </span>
              </span>
              <div className="p-4 bg-muted/50 rounded-xl border border-border text-sm text-foreground leading-relaxed max-h-40 overflow-y-auto font-medium">
                <ul className="list-disc pl-5 space-y-1">
                  {parseSemicolonList(viewActivity.deliberations).map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-between mb-3">
              Acervo / Anexos{' '}
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-black border border-primary/20">
                {viewActivity.documents?.length || 0}
              </span>
            </span>
            {viewActivity.documents && viewActivity.documents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {viewActivity.documents.map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col gap-3 bg-card p-4 border border-border rounded-xl shadow-sm hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className="font-semibold text-sm text-foreground line-clamp-2"
                        title={doc.name}
                      >
                        {doc.name}
                      </span>
                      <span className="text-[10px] font-black bg-muted px-2 py-1 rounded uppercase tracking-widest text-primary shrink-0 border border-border mt-0.5">
                        {doc.type || 'S/TIPO'}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-auto pt-3 border-t border-border/50">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs font-bold h-8 bg-background"
                        onClick={() => handleView(doc)}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1.5" /> Visualizar
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 text-xs font-bold h-8"
                        onClick={() => handleDownload(doc)}
                      >
                        <Download className="w-3.5 h-3.5 mr-1.5" /> Baixar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 bg-muted/30 border border-border border-dashed rounded-xl text-center">
                <FileX className="w-8 h-8 text-muted-foreground/40 mb-3" />
                <span className="text-sm font-semibold text-muted-foreground">
                  Nenhum arquivo anexado
                </span>
                <span className="text-xs text-muted-foreground/70 mt-1">
                  Este registro não possui documentos ou imagens.
                </span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
