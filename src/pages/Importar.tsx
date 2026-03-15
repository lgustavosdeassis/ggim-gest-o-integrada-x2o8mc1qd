import { useState, useRef } from 'react'
import { UploadCloud, FileType, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function Importar() {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const validateAndSetFile = (selectedFile: File) => {
    const validTypes = [
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ]

    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(csv|xlsx)$/)) {
      toast({
        title: 'Arquivo inválido',
        description: 'Por favor, envie apenas arquivos CSV ou XLSX.',
        variant: 'destructive',
      })
      return
    }

    setFile(selectedFile)
    setUploadComplete(false)
    setUploadProgress(0)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0])
    }
  }

  const handleUpload = () => {
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    // Mock upload process
    let progress = 0
    const interval = setInterval(() => {
      progress += 10

      if (progress >= 100) {
        clearInterval(interval)
        setUploadProgress(100)
        setIsUploading(false)
        setUploadComplete(true)
        toast({
          title: 'Importação concluída',
          description: `${file.name} foi importado com sucesso.`,
        })
      } else {
        setUploadProgress(progress)
      }
    }, 200)
  }

  const resetUpload = () => {
    setFile(null)
    setUploadProgress(0)
    setUploadComplete(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Importar Dados</h1>
        <p className="text-muted-foreground">
          Faça a migração do histórico de dados através de planilhas CSV ou XLSX.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload de Arquivo</CardTitle>
          <CardDescription>
            Arraste e solte o arquivo ou clique para procurar no seu computador.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!file ? (
            <div
              className={cn(
                'border-2 border-dashed rounded-lg p-12 text-center transition-colors duration-200 ease-in-out cursor-pointer hover:bg-slate-50',
                isDragging ? 'border-primary bg-primary/5' : 'border-slate-200',
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={handleFileInput}
              />
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <UploadCloud className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-medium">Arraste um arquivo CSV ou XLSX</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    ou clique para procurar arquivo
                  </p>
                </div>
                <div className="flex gap-2 text-xs text-muted-foreground mt-4">
                  <span className="flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Tamanho máx: 10MB
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                  <FileType className="w-6 h-6" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm truncate max-w-[300px] sm:max-w-[400px]">
                      {file.name}
                    </p>
                    {uploadComplete && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              {(isUploading || uploadComplete) && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{uploadComplete ? 'Concluído' : 'Enviando...'}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={resetUpload} disabled={isUploading}>
                  {uploadComplete ? 'Importar outro' : 'Cancelar'}
                </Button>
                {!uploadComplete && (
                  <Button onClick={handleUpload} disabled={isUploading}>
                    {isUploading ? 'Processando...' : 'Confirmar Importação'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
