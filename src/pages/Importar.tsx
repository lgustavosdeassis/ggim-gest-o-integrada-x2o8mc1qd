import { useState, useRef, DragEvent } from 'react'
import { UploadCloud, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

  const processFile = (file: File) => {
    setStep(2)

    // Simulate reading the file and auto-extracting data without manual mapping
    setTimeout(() => {
      const extractedData = [
        {
          instance: 'CMTEC-PVC',
          eventType: 'Reunião Ordinária',
          modality: 'Presencial',
          meetingStart: '2026-03-01T10:00:00Z',
          meetingEnd: '2026-03-01T12:00:00Z',
          location: 'Sede GGIM',
          participantsPF: 'Ana; Carlos; Roberto',
          participantsPJ: 'PMFI; Guarda Municipal',
          deliberations: 'Aprovação de diretrizes; Encaminhamento de ofício',
        },
        {
          instance: 'Eventos Institucionais',
          eventType: 'Seminário',
          modality: 'Remota',
          meetingStart: '2026-03-05T14:00:00Z',
          meetingEnd: '2026-03-05T18:00:00Z',
          location: 'Zoom',
          participantsPF: 'Pedro; João; Maria Souza',
          participantsPJ: 'Corpo de Bombeiros',
          deliberations: 'Apresentação de resultados',
        },
      ]

      const imported: Omit<ActivityRecord, 'id' | 'createdAt'>[] = extractedData.map((row) => {
        return {
          ...row,
          hasAction: false,
          actions: [],
          documents: [],
        }
      })

      importActivities(imported)
      toast({
        title: 'Sucesso',
        description: `${imported.length} registros extraídos e importados com sucesso.`,
      })
      setStep(3)
    }, 1500)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      processFile(selected)
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      processFile(droppedFile)
    }
  }

  const reset = () => {
    setStep(1)
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Importar Dados</h1>
        <p className="text-muted-foreground">
          Faça a importação automática do histórico de dados (CSV/XLSX).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1
              ? '1. Upload de Arquivo'
              : step === 2
                ? '2. Processando...'
                : '3. Concluído'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div
              className={cn(
                'border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors',
                isDragging ? 'border-primary bg-primary/5' : 'border-slate-200 hover:bg-slate-50',
              )}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".csv,.xlsx"
                onChange={handleFileChange}
              />
              <div className="flex flex-col items-center gap-4 pointer-events-none">
                <div className="p-4 bg-primary/10 rounded-full">
                  <UploadCloud className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-medium">Clique ou arraste seu arquivo para cá</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Suporta arquivos .csv e .xlsx
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="text-center py-12 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
              <p className="font-medium">Extraindo e mapeando colunas automaticamente...</p>
              <p className="text-sm text-muted-foreground">
                Por favor, aguarde enquanto processamos os dados.
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-12 space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-medium">Importação Finalizada</h3>
              <p className="text-muted-foreground">
                Os dados foram lidos, mapeados automaticamente e integrados ao histórico e Dashboard
                com sucesso.
              </p>
              <Button onClick={reset} className="mt-4">
                Nova Importação
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
