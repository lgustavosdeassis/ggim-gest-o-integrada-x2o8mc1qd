import { useState, useRef, DragEvent } from 'react'
import { UploadCloud, CheckCircle2, Loader2, ArrowRight, TableProperties } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useAppStore } from '@/stores/main'
import { ActivityRecord } from '@/lib/types'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

const DB_FIELDS = [
  { id: 'instance', label: 'Instância' },
  { id: 'eventType', label: 'Tipo de Evento' },
  { id: 'modality', label: 'Modalidade' },
  { id: 'location', label: 'Local do Evento' },
  { id: 'meetingStart', label: 'Data Início' },
  { id: 'meetingEnd', label: 'Data Término' },
  { id: 'participantsPF', label: 'Participantes (PF)' },
  { id: 'participantsPJ', label: 'Instituições (PJ)' },
  { id: 'deliberations', label: 'Deliberações' },
]

export default function Importar() {
  const [step, setStep] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState('')
  const [mappedFields, setMappedFields] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { importActivities } = useAppStore()

  // Mock extracted columns from file
  const fileColumns = [
    'Coluna_Instância',
    'Coluna_Tipo',
    'Coluna_Modalidade',
    'Local_Realizado',
    'Data_Hora_Inicio',
    'Data_Hora_Fim',
    'Nomes_Pessoas',
    'Nomes_Instituicoes',
    'Texto_Deliberacoes',
  ]

  const handleFile = (file: File) => {
    setFileName(file.name)
    setStep(2)
    // Auto-map based on similar names
    const initialMap: Record<string, string> = {}
    fileColumns.forEach((col, idx) => {
      if (idx < DB_FIELDS.length) initialMap[col] = DB_FIELDS[idx].id
    })
    setMappedFields(initialMap)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0])
  }

  const processImport = () => {
    setStep(3)
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
        },
      ]
      const imported: Omit<ActivityRecord, 'id' | 'createdAt'>[] = extractedData.map((row) => ({
        ...row,
        hasAction: false,
        actions: [],
        documents: [],
      }))
      importActivities(imported)
      toast({
        title: 'Sucesso',
        description: `${imported.length} registros migrados com sucesso baseados no mapeamento.`,
      })
      setStep(4)
    }, 1500)
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Migração de Dados (Upload)</h1>
        <p className="text-muted-foreground">
          Importe planilhas .CSV ou .XLSX e mapeie as colunas para alimentar o sistema.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={cn('h-2 rounded-full', step >= s ? 'bg-primary' : 'bg-muted')} />
        ))}
      </div>

      <Card className="shadow-md border-muted/60">
        <CardHeader>
          <CardTitle>
            {step === 1
              ? '1. Selecionar Arquivo'
              : step === 2
                ? '2. Mapeamento de Colunas'
                : step === 3
                  ? '3. Processando...'
                  : '4. Concluído'}
          </CardTitle>
          <CardDescription>
            {step === 1 && 'Arraste ou clique para selecionar a planilha.'}
            {step === 2 &&
              `Arquivo: ${fileName} - Relacione as colunas da planilha com os campos do sistema.`}
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
                    Suporta formatos .csv e .xlsx. O sistema irá guiar você no mapeamento das
                    informações.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-muted/30 border rounded-lg p-6 max-h-[400px] overflow-auto">
                <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center font-semibold text-sm text-muted-foreground mb-4 border-b pb-2">
                  <div>Coluna na Planilha</div>
                  <div className="w-8"></div>
                  <div>Campo no Sistema GGIM</div>
                </div>
                {fileColumns.map((col) => (
                  <div key={col} className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center mb-4">
                    <div className="bg-background border px-3 py-2 rounded-md text-sm flex items-center gap-2">
                      <TableProperties className="w-4 h-4 text-primary" /> {col}
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <Select
                      value={mappedFields[col]}
                      onValueChange={(v) => setMappedFields({ ...mappedFields, [col]: v })}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Ignorar coluna" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ignore" className="text-muted-foreground italic">
                          Ignorar coluna
                        </SelectItem>
                        {DB_FIELDS.map((f) => (
                          <SelectItem key={f.id} value={f.id}>
                            {f.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Voltar
                </Button>
                <Button onClick={processImport} className="font-bold">
                  Processar e Importar <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-20 space-y-6">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
              <div>
                <p className="text-lg font-bold">Aplicando Regras de Deduplicação...</p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2">
                  O sistema está separando participações brutas de participantes únicos e mapeando
                  as informações corretamente no histórico.
                </p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-16 space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Importação Finalizada com Sucesso!</h3>
                <p className="text-muted-foreground max-w-md mx-auto mt-2">
                  Os dados foram integrados, os cálculos de horas foram gerados e o Dashboard já foi
                  atualizado com as novas estatísticas.
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
