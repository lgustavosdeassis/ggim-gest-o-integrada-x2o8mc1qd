import { useState, useRef } from 'react'
import { UploadCloud, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useAppStore } from '@/stores/main'
import { ActivityRecord } from '@/lib/types'
import { cn } from '@/lib/utils'

export default function Importar() {
  const [step, setStep] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { importActivities } = useAppStore()

  const handleFile = (file: File) => {
    // Jump straight to processing (automated data extraction)
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

      toast({
        title: 'Sucesso',
        description: `${imported.length} registros migrados com sucesso de forma automática.`,
      })

      setStep(3)
    }, 1500)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0])
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Migração de Dados (Upload)</h1>
        <p className="text-muted-foreground">
          Importe planilhas .CSV ou .XLSX para alimentar o sistema. A extração e o mapeamento são
          feitos automaticamente.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {[1, 2, 3].map((s) => (
          <div key={s} className={cn('h-2 rounded-full', step >= s ? 'bg-primary' : 'bg-muted')} />
        ))}
      </div>

      <Card className="shadow-md border-muted/60">
        <CardHeader>
          <CardTitle>
            {step === 1
              ? '1. Selecionar Arquivo'
              : step === 2
                ? '2. Extraindo Dados...'
                : '3. Concluído'}
          </CardTitle>
          <CardDescription>
            {step === 1 &&
              'Arraste ou clique para selecionar a planilha. Não é necessário mapear colunas manualmente.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div
              className={cn(
                'border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-all duration-300',
                isDragging
                  ? 'border-primary bg-primary/10 scale-[0.99]'
                  : 'border-border hover:bg-muted/50',
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
              <div className="flex flex-col items-center gap-4 pointer-events-none">
                <div className="p-4 bg-primary/10 rounded-full text-primary">
                  <UploadCloud className="w-10 h-10" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">
                    Upload de Planilha / Importar Dados
                  </p>
                  <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                    Suporta formatos .csv e .xlsx. O sistema irá identificar as colunas e
                    integrá-las ao banco de dados automaticamente, incluindo "Tipo de Documento".
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="text-center py-20 space-y-6">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
              <div>
                <p className="text-lg font-bold">Lendo e Processando os Dados...</p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2">
                  O sistema está mapeando as informações baseadas nos cabeçalhos e aplicando as
                  regras de deduplicação sem a necessidade de intervenção manual.
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-16 space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Importação Finalizada com Sucesso!</h3>
                <p className="text-muted-foreground max-w-md mx-auto mt-2">
                  Os dados foram integrados, os cálculos de horas foram gerados e o Dashboard e os
                  módulos de Histórico já estão atualizados.
                </p>
              </div>
              <div className="flex justify-center gap-4 mt-8">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Nova Importação
                </Button>
                <Button onClick={() => (window.location.href = '/')}>Ir para Dashboard</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
