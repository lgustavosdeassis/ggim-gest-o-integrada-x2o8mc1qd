import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UploadCloud, FileSpreadsheet, CheckCircle2, ArrowRight } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

export default function Importar() {
  const [step, setStep] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const navigate = useNavigate()

  const processFile = () => {
    setStep(2)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile()
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      if (file.name.endsWith('.csv') || file.name.endsWith('.xlsx')) {
        processFile()
      } else {
        toast({
          title: 'Arquivo inválido',
          description: 'Apenas arquivos .csv e .xlsx são suportados.',
          variant: 'destructive',
        })
      }
    }
  }

  const handleSimulateImport = () => {
    toast({
      title: 'Importando...',
      description: 'Processando os registros da planilha.',
    })
    setTimeout(() => {
      toast({
        title: 'Importação Concluída',
        description: 'Foram processados 12 registros da planilha com sucesso.',
      })
      navigate('/historico')
    }, 2000)
  }

  return (
    <div className="max-w-3xl mx-auto pb-12 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Importação de Dados</h1>
        <p className="text-muted-foreground mt-1">
          Carregue planilhas antigas (.xlsx, .csv) para o sistema.
        </p>
      </div>

      <div className="grid gap-6">
        {step === 1 && (
          <Card
            className={cn(
              'shadow-subtle border-dashed border-2 transition-colors duration-200',
              isDragging ? 'border-primary bg-primary/5' : 'border-primary/20',
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <UploadCloud className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Arraste e solte sua planilha aqui</h3>
              <p className="text-sm text-muted-foreground max-w-md mb-8">
                O sistema tentará mapear automaticamente as colunas da sua planilha com os campos do
                banco de dados do GGIM. Aceita .CSV ou .XLSX.
              </p>

              <div className="flex gap-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv, .xlsx"
                  className="hidden"
                />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Procurar Arquivo
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="shadow-subtle animate-fade-in-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Arquivo Carregado e Analisado
              </CardTitle>
              <CardDescription>
                Mapeamento de colunas detectado. Verifique e confirme a importação.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="p-3 text-left font-medium">Coluna no Excel</th>
                      <th className="p-3 text-center w-10"></th>
                      <th className="p-3 text-left font-medium">Campo no Sistema</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {[
                      'Instância',
                      'Tipo de Evento',
                      'Data Inicial',
                      'Local',
                      'Participantes PF',
                    ].map((field, i) => (
                      <tr key={i}>
                        <td className="p-3 font-mono text-xs bg-slate-50">{field}</td>
                        <td className="p-3 text-center text-muted-foreground">
                          <ArrowRight className="h-4 w-4 inline" />
                        </td>
                        <td className="p-3 font-semibold text-primary">{field}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Cancelar
                </Button>
                <Button onClick={handleSimulateImport}>Processar Importação</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
