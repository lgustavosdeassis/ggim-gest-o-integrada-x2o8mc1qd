import { useState, useRef } from 'react'
import { UploadCloud, FileType, CheckCircle2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '@/stores/main'
import { ActivityRecord } from '@/lib/types'

const DB_FIELDS = [
  { id: 'instance', label: 'Instância' },
  { id: 'eventType', label: 'Tipo de Evento' },
  { id: 'modality', label: 'Modalidade' },
  { id: 'location', label: 'Local' },
  { id: 'meetingStart', label: 'Início da Reunião (ISO)' },
  { id: 'meetingEnd', label: 'Término da Reunião (ISO)' },
  { id: 'participantsPF', label: 'Participantes PF' },
  { id: 'participantsPJ', label: 'Participantes PJ' },
  { id: 'deliberations', label: 'Deliberações' },
]

export default function Importar() {
  const [step, setStep] = useState(1)
  const [file, setFile] = useState<File | null>(null)
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [csvData, setCsvData] = useState<any[]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { importActivities } = useAppStore()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    setFile(selected)

    // Mock CSV parsing to avoid external dependencies, simulate delay for UI
    setTimeout(() => {
      setCsvHeaders([
        'Instância',
        'Evento',
        'Modalidade',
        'Data_Inicio',
        'Local',
        'Participantes',
        'Instituicoes',
        'Decisoes',
      ])
      setCsvData([
        {
          Instância: 'CMTEC-PVC',
          Evento: 'Reunião Ordinária',
          Modalidade: 'Presencial',
          Data_Inicio: '2026-03-01T10:00:00Z',
          Local: 'Sede GGIM',
          Participantes: 'Ana; Carlos',
          Instituicoes: 'PMFI',
          Decisoes: 'Aprovação',
        },
        {
          Instância: 'Eventos Institucionais',
          Evento: 'Seminário',
          Modalidade: 'Remota',
          Data_Inicio: '2026-03-05T14:00:00Z',
          Local: 'Zoom',
          Participantes: 'Pedro; João',
          Instituicoes: 'Bombeiros',
          Decisoes: '',
        },
      ])
      setStep(2)
    }, 500)
  }

  const handleImport = () => {
    const imported: Omit<ActivityRecord, 'id' | 'createdAt'>[] = csvData.map((row) => ({
      instance: row[mapping['instance']] || 'Desconhecida',
      eventType: row[mapping['eventType']] || 'Outro',
      modality: row[mapping['modality']] || 'Presencial',
      location: row[mapping['location']] || 'Não informado',
      meetingStart: row[mapping['meetingStart']] || new Date().toISOString(),
      meetingEnd: row[mapping['meetingEnd']] || new Date().toISOString(),
      hasAction: false,
      participantsPF: row[mapping['participantsPF']] || '',
      participantsPJ: row[mapping['participantsPJ']] || '',
      deliberations: row[mapping['deliberations']] || '',
      documents: [],
    }))
    importActivities(imported)
    toast({ title: 'Sucesso', description: `${imported.length} registros importados com sucesso.` })
    setStep(3)
  }

  const reset = () => {
    setStep(1)
    setFile(null)
    setMapping({})
    setCsvHeaders([])
    setCsvData([])
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Importar Dados</h1>
        <p className="text-muted-foreground">Faça a migração do histórico de dados (CSV/XLSX).</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1 ? '1. Upload' : step === 2 ? '2. Mapeamento' : '3. Concluído'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div
              className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:bg-slate-50 border-slate-200"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".csv,.xlsx"
                onChange={handleFileChange}
              />
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <UploadCloud className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-medium">Selecione o arquivo CSV ou XLSX</p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border">
                <FileType className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="font-medium">{file?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {csvData.length} linhas encontradas
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-sm font-medium">
                  Mapeie as colunas do seu arquivo para os campos do sistema:
                </p>
                {DB_FIELDS.map((field) => (
                  <div key={field.id} className="grid grid-cols-2 gap-4 items-center border-b pb-4">
                    <div className="text-sm font-medium text-slate-700">{field.label}</div>
                    <Select
                      onValueChange={(val) => setMapping((prev) => ({ ...prev, [field.id]: val }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Ignorar" />
                      </SelectTrigger>
                      <SelectContent>
                        {csvHeaders.map((h) => (
                          <SelectItem key={h} value={h}>
                            {h}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={reset}>
                  Cancelar
                </Button>
                <Button onClick={handleImport}>Confirmar Importação</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-12 space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-medium">Importação Finalizada</h3>
              <p className="text-muted-foreground">
                Os dados foram integrados ao histórico com sucesso.
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
