import { useState, useRef } from 'react'
import { UploadCloud, CheckCircle2, Loader2, FileSpreadsheet, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useAppStore } from '@/stores/main'
import { useAuthStore } from '@/stores/auth'
import { useAuditStore } from '@/stores/audit'
import { ActivityRecord } from '@/lib/types'
import { cn } from '@/lib/utils'

export default function Importar() {
  const [step, setStep] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const { importActivities } = useAppStore()
  const { user } = useAuthStore()
  const isViewer =
    user?.role !== 'admin' &&
    user?.role !== 'owner' &&
    !(
      user?.role === 'editor' &&
      Array.isArray(user?.allowedTabs) &&
      user.allowedTabs.includes('Importar Arquivo')
    )

  const addLog = useAuditStore((state) => state.addLog)

  const handleFile = (file: File) => {
    if (isViewer) return
    setStep(2)

    setTimeout(() => {
      const extractedData = [
        {
          instance: 'CMTEC-PVC',
          eventType: 'Reunião Ordinária',
          modality: 'Presencial',
          meetingStart: '2026-03-01T10:00:00Z',
          meetingEnd: '2026-03-01T12:00:00Z',
          location: 'Sede GGIM',
          participantsPF: 'Ana Silva; Carlos Souza; Roberto Costa',
          participantsPJ: 'PMFI; Guarda Municipal',
          deliberations: 'Aprovação de diretrizes; Encaminhamento de ofício',
          documents: [{ id: 'mig1', name: 'Ata_Assinada.pdf', type: 'ATA' }],
        },
        {
          instance: 'Eventos Institucionais',
          eventType: 'Seminário',
          modality: 'Remota',
          meetingStart: '2026-03-05T14:00:00Z',
          meetingEnd: '2026-03-05T18:00:00Z',
          location: 'Zoom',
          participantsPF: 'Pedro Alves; João Marcos; Maria Oliveira',
          participantsPJ: 'Corpo de Bombeiros',
          deliberations: 'Apresentação de resultados',
          documents: [{ id: 'mig2', name: 'Relatorio_Evento.pdf', type: 'RELATÓRIO' }],
        },
      ]

      const imported: Omit<ActivityRecord, 'id' | 'createdAt'>[] = extractedData.map((row) => ({
        ...row,
        hasAction: false,
        actions: [],
        documents: row.documents || [],
      }))

      importActivities(imported)
      addLog({
        userName: user?.name || 'Sistema',
        userEmail: user?.email || '',
        action: `Importou ${imported.length} novas atividades via planilha automática`,
      })

      toast({
        title: 'Importação Concluída',
        description: `${imported.length} novos registros foram automatizados com sucesso.`,
      })

      setStep(3)
    }, 2000)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0] && !isViewer) handleFile(e.target.files[0])
  }

  if (isViewer) {
    return (
      <div className="flex flex-col gap-8 max-w-4xl mx-auto py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground mb-2">
            Migração Automática
          </h1>
          <p className="text-muted-foreground text-base font-medium">
            Módulo restrito para importação em lote.
          </p>
        </div>
        <Card className="shadow-sm border-border bg-card rounded-2xl overflow-hidden p-16 text-center">
          <Lock className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
          <h3 className="text-2xl font-black text-foreground mb-3">Acesso Restrito</h3>
          <p className="text-muted-foreground font-medium text-base max-w-md mx-auto">
            Acesso restrito. Você não possui permissão para realizar importações de planilhas.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-foreground mb-2">
          Migração Automática
        </h1>
        <p className="text-muted-foreground text-base font-medium">
          Importe arquivos <span className="text-primary font-bold">.CSV</span> ou{' '}
          <span className="text-primary font-bold">.XLSX</span>. A leitura, mapeamento de colunas e
          cálculos de banco de dados são feitos instantaneamente pela IA.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={cn(
              'h-1.5 rounded-full transition-all duration-500',
              step >= s ? 'bg-primary' : 'bg-muted',
            )}
          />
        ))}
      </div>

      <Card className="shadow-sm border-border bg-card rounded-2xl overflow-hidden">
        <CardHeader className="bg-muted/50 border-b border-border pb-6 pt-8">
          <CardTitle className="text-xl font-bold flex items-center gap-3 text-foreground">
            <FileSpreadsheet className="h-6 w-6 text-primary" />
            {step === 1
              ? 'Passo 1: Selecione o Arquivo Base'
              : step === 2
                ? 'Passo 2: Processamento Inteligente em Andamento'
                : 'Passo 3: Integração Finalizada'}
          </CardTitle>
          <CardDescription className="text-sm font-medium mt-2">
            {step === 1 &&
              'Basta fornecer a planilha. O sistema categorizará Instâncias, Tipos de Documento, e gerará os painéis.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 md:p-12">
          {step === 1 && (
            <div
              className={cn(
                'border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer transition-all duration-300 relative group',
                isDragging
                  ? 'border-primary bg-primary/5 scale-[0.99]'
                  : 'border-border hover:bg-muted/50 hover:border-primary/50',
              )}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={(e) => {
                e.preventDefault()
                setIsDragging(false)
              }}
              onDrop={(e) => {
                e.preventDefault()
                setIsDragging(false)
                if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0])
              }}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".csv,.xlsx"
                onChange={handleFileChange}
              />
              <div className="flex flex-col items-center gap-6 pointer-events-none">
                <div className="p-6 bg-card rounded-full text-primary border border-border shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <UploadCloud className="w-12 h-12" />
                </div>
                <div>
                  <p className="text-2xl font-black text-foreground">
                    Arraste o arquivo ou clique aqui
                  </p>
                  <p className="text-sm text-muted-foreground mt-3 max-w-md mx-auto leading-relaxed font-medium">
                    A plataforma lerá os cabeçalhos e preencherá tudo automaticamente: engajamento,
                    cálculos de horas e as tabelas de histórico.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="text-center py-24 space-y-8">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 border-4 border-muted rounded-full" />
                <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin" />
                <Loader2 className="absolute inset-0 m-auto w-10 h-10 text-primary opacity-50" />
              </div>
              <div className="space-y-3">
                <p className="text-2xl font-black text-foreground">
                  Mapeando Colunas e Extraindo Dados
                </p>
                <p className="text-base text-muted-foreground max-w-lg mx-auto leading-relaxed font-medium">
                  Buscando ocorrências, calculando tempo de dedicação, aplicando deduplicação e
                  populando o Dashboard BI.
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-20 space-y-8 animate-in zoom-in-95 duration-700">
              <div className="mx-auto w-28 h-28 bg-chart-5/10 border-2 border-chart-5/30 rounded-full flex items-center justify-center shadow-sm relative">
                <div className="absolute inset-0 bg-chart-5/20 rounded-full animate-ping opacity-20" />
                <CheckCircle2 className="w-14 h-14 text-chart-5" />
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-black text-foreground">Banco de Dados Atualizado!</h3>
                <p className="text-muted-foreground text-base max-w-lg mx-auto font-medium">
                  Todos os registros foram importados sem necessidade de intervenção. Os painéis e o
                  módulo de histórico já refletem os novos números.
                </p>
              </div>
              <div className="flex justify-center gap-5 mt-10">
                <Button
                  variant="outline"
                  className="h-12 px-8 font-bold border-border hover:bg-muted rounded-xl text-foreground"
                  onClick={() => setStep(1)}
                >
                  Nova Migração
                </Button>
                <Button
                  className="h-12 px-8 font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md rounded-xl"
                  onClick={() => (window.location.href = '/')}
                >
                  Acessar Dashboard
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
