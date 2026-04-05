import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useReportStore } from '@/stores/reports'
import { useAuthStore } from '@/stores/auth'
import {
  FolderKanban,
  UploadCloud,
  Link as LinkIcon,
  Trash2,
  ExternalLink,
  Download,
  Printer,
  Eye,
  Loader2,
  Video,
} from 'lucide-react'
import { openDocumentViewer, downloadDocument, printDocument } from '@/lib/utils'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

export default function Relatorios() {
  const { reports, addReport, deleteReport, fetchReports, isFetching, hasMore } = useReportStore()
  const { user } = useAuthStore()

  const isOwnerOrAdmin = user?.role === 'owner' || user?.role === 'admin'
  const isEditor = user?.role === 'editor'
  const isViewer = !isOwnerOrAdmin && !(isEditor && user?.allowedTabs?.includes('Relatórios GGIM'))
  const canDelete = isOwnerOrAdmin || (isEditor && user?.canDeleteReports)

  const [tab, setTab] = useState('mensais')
  const [uploadYear, setUploadYear] = useState<string>(new Date().getFullYear().toString())
  const [uploadMonth, setUploadMonth] = useState<string>((new Date().getMonth() + 1).toString())

  const fileRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)

  const [isUploading, setIsUploading] = useState(false)
  const [videoUploadStatus, setVideoUploadStatus] = useState<'idle' | 'compressing' | 'uploading'>(
    'idle',
  )
  const [videoUploadProgress, setVideoUploadProgress] = useState(0)

  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkName, setLinkName] = useState('')

  const [pageMensal, setPageMensal] = useState(0)
  const [pageAnual, setPageAnual] = useState(0)

  useEffect(() => {
    const interval = setInterval(
      () => {
        useReportStore.setState({ reports: [], page: 0, hasMore: true })
        fetchReports()
      },
      30 * 60 * 1000,
    )
    return () => clearInterval(interval)
  }, [fetchReports])

  const uploadToStorage = async (file: File, folder: string) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
    const filePath = `${folder}/${fileName}`
    const { error } = await supabase.storage.from('reports').upload(filePath, file)
    if (error) throw error
    const { data } = supabase.storage.from('reports').getPublicUrl(filePath)
    return data.publicUrl
  }

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setIsUploading(true)
    try {
      for (const file of Array.from(files)) {
        let fileType = 'Outros'
        const ext = file.name.split('.').pop()?.toLowerCase()
        if (ext === 'pdf') fileType = 'PDF'
        else if (['doc', 'docx'].includes(ext || '')) fileType = 'Word'

        const url = await uploadToStorage(file, 'documents')
        await addReport({
          report_type: tab === 'mensais' ? 'mensal' : 'anual',
          period_year: parseInt(uploadYear),
          period_month: tab === 'mensais' ? parseInt(uploadMonth) : null,
          name: file.name,
          file_type: fileType,
          url,
        })
      }
    } catch (err) {
      toast.error('Erro ao enviar documento')
    } finally {
      setIsUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]

    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Formato inválido. Aceitamos apenas MP4, WebM ou MOV.')
      if (videoRef.current) videoRef.current.value = ''
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('O tamanho máximo permitido é 50MB.')
      if (videoRef.current) videoRef.current.value = ''
      return
    }

    try {
      setVideoUploadStatus('compressing')
      setVideoUploadProgress(0)

      // 1. Simular Compressão Otimizada
      for (let i = 0; i <= 100; i += 20) {
        setVideoUploadProgress(i)
        await new Promise((r) => setTimeout(r, 400))
      }

      // 2. Upload em Chunks (5MB)
      setVideoUploadStatus('uploading')
      setVideoUploadProgress(0)

      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
      const filePath = `videos/${fileName}`

      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token
      if (!token) throw new Error('Usuário não autenticado')

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const bucketName = btoa(unescape(encodeURIComponent('reports')))
      const objectName = btoa(unescape(encodeURIComponent(filePath)))
      const contentType = btoa(unescape(encodeURIComponent(file.type)))

      const initRes = await fetch(`${supabaseUrl}/storage/v1/upload/resumable`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Tus-Resumable': '1.0.0',
          'Upload-Length': file.size.toString(),
          'Upload-Metadata': `bucketName ${bucketName}, objectName ${objectName}, contentType ${contentType}`,
        },
      })

      if (!initRes.ok) {
        throw new Error('Falha ao iniciar upload do vídeo')
      }

      const location = initRes.headers.get('Location')
      if (!location) throw new Error('Endpoint de upload não retornado')

      const uploadUrl = new URL(location, supabaseUrl).href

      const chunkSize = 5 * 1024 * 1024 // 5MB chunks
      let offset = 0

      while (offset < file.size) {
        const chunk = file.slice(offset, offset + chunkSize)
        const patchRes = await fetch(uploadUrl, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Tus-Resumable': '1.0.0',
            'Upload-Offset': offset.toString(),
            'Content-Type': 'application/offset+octet-stream',
          },
          body: chunk,
        })

        if (!patchRes.ok) {
          throw new Error('Falha ao enviar chunk do vídeo')
        }

        offset += chunkSize
        const progress = Math.min(Math.round((offset / file.size) * 100), 100)
        setVideoUploadProgress(progress)
      }

      const { data: publicUrlData } = supabase.storage.from('reports').getPublicUrl(filePath)

      await addReport({
        report_type: tab === 'mensais' ? 'mensal' : 'anual',
        period_year: parseInt(uploadYear),
        period_month: tab === 'mensais' ? parseInt(uploadMonth) : null,
        name: file.name,
        file_type: 'Vídeo',
        url: publicUrlData.publicUrl,
      })

      toast.success('Vídeo comprimido e enviado com sucesso!')
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Erro ao processar e enviar vídeo')
    } finally {
      setVideoUploadStatus('idle')
      setVideoUploadProgress(0)
      if (videoRef.current) videoRef.current.value = ''
    }
  }

  const handleAddLink = async () => {
    if (!linkUrl || !linkName) return
    await addReport({
      report_type: tab === 'mensais' ? 'mensal' : 'anual',
      period_year: parseInt(uploadYear),
      period_month: tab === 'mensais' ? parseInt(uploadMonth) : null,
      name: linkName,
      file_type: 'Link',
      url: linkUrl,
    })
    setIsLinkDialogOpen(false)
    setLinkUrl('')
    setLinkName('')
  }

  const renderTable = (type: 'mensal' | 'anual') => {
    const filtered = reports.filter((r) => r.report_type === type)
    const currentPage = type === 'mensal' ? pageMensal : pageAnual
    const setCurrentPage = type === 'mensal' ? setPageMensal : setPageAnual

    const itemsPerPage = 10
    const totalPages = Math.ceil(filtered.length / itemsPerPage)
    const paginated = filtered.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)

    const handleNext = () => {
      if (currentPage < totalPages - 1) {
        setCurrentPage((p) => p + 1)
      } else if (hasMore) {
        fetchReports(true).then(() => {
          setCurrentPage((p) => p + 1)
        })
      }
    }

    return (
      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-bold text-foreground">Relatórios Enviados</h2>
        <div className="border border-border rounded-xl bg-card overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Nome do Arquivo</TableHead>
                <TableHead>Data de Envio</TableHead>
                <TableHead>Período (Mês/Ano)</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground font-medium"
                  >
                    Nenhum relatório encontrado
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {r.file_type === 'Link' || (r.url && r.url.startsWith('http')) ? (
                          <a
                            href={r.url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1 line-clamp-1"
                            title={r.name}
                          >
                            {r.name} <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        ) : (
                          <span className="line-clamp-1" title={r.name}>
                            {r.name}
                          </span>
                        )}
                        <span className="text-[10px] font-black bg-muted px-2 py-0.5 rounded uppercase tracking-wider text-primary border border-border shrink-0">
                          {r.file_type}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {r.created_at ? format(new Date(r.created_at), 'dd/MM/yyyy HH:mm') : '-'}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {r.report_type === 'mensal'
                        ? `${MONTHS[(r.period_month || 1) - 1]} / ${r.period_year}`
                        : r.period_year}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() =>
                            openDocumentViewer({ name: r.name, url: r.url, type: r.file_type })
                          }
                          title="Visualizar"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() =>
                            downloadDocument({ name: r.name, url: r.url, type: r.file_type })
                          }
                          title="Baixar"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() =>
                            printDocument({ name: r.name, url: r.url, type: r.file_type })
                          }
                          title="Imprimir"
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              if (window.confirm('Excluir este relatório?')) deleteReport(r.id)
                            }}
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {(totalPages > 1 || hasMore) && (
          <div className="flex justify-between items-center pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {currentPage + 1} {totalPages > 0 ? `de ${totalPages}` : ''}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages - 1 && !hasMore}
              onClick={handleNext}
            >
              {isFetching && currentPage >= totalPages - 1 ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Próxima'
              )}
            </Button>
          </div>
        )}
      </div>
    )
  }

  const renderUploadControls = () => (
    <div className="w-full md:flex-1 flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input
          type="file"
          ref={fileRef}
          className="hidden"
          multiple
          accept=".pdf,.doc,.docx"
          onChange={handleDocumentUpload}
        />
        <input
          type="file"
          ref={videoRef}
          className="hidden"
          accept="video/mp4,video/webm,video/quicktime"
          onChange={handleVideoUpload}
        />

        <Button
          disabled={isUploading || videoUploadStatus !== 'idle'}
          onClick={() => fileRef.current?.click()}
          className="w-full h-11 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <UploadCloud className="w-4 h-4 mr-2 hidden xl:block" />
          )}{' '}
          Arquivo
        </Button>
        <Button
          disabled={isUploading || videoUploadStatus !== 'idle'}
          onClick={() => videoRef.current?.click()}
          variant="outline"
          className="w-full h-11 rounded-xl font-bold bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-sm border-border"
        >
          {videoUploadStatus !== 'idle' ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Video className="w-4 h-4 mr-2 hidden xl:block" />
          )}{' '}
          Vídeo
        </Button>
        <Button
          disabled={isUploading || videoUploadStatus !== 'idle'}
          onClick={() => setIsLinkDialogOpen(true)}
          variant="outline"
          className="w-full h-11 rounded-xl font-bold bg-background shadow-sm border-border"
        >
          <LinkIcon className="w-4 h-4 mr-2 hidden xl:block" /> Link
        </Button>
      </div>

      {videoUploadStatus !== 'idle' && (
        <div className="w-full p-4 border border-border rounded-xl bg-muted/30 animate-in fade-in slide-in-from-top-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              {videoUploadStatus === 'compressing'
                ? 'Otimizando e comprimindo vídeo...'
                : 'Enviando em chunks de 5MB...'}
            </span>
            <span className="text-sm font-bold text-primary">{videoUploadProgress}%</span>
          </div>
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${videoUploadProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-3 mb-2">
          <FolderKanban className="w-10 h-10 text-primary" /> Relatórios GGIM
        </h1>
        <p className="text-muted-foreground text-base font-medium">
          Acesse, organize e gerencie os relatórios consolidados mensais e anuais do sistema.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="h-14 bg-muted/50 p-1 rounded-xl mb-6 w-full sm:w-auto inline-flex overflow-x-auto flex-nowrap shrink-0 max-w-full">
          <TabsTrigger
            value="mensais"
            className="h-full rounded-lg px-6 sm:px-8 font-bold text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Relatórios Mensais
          </TabsTrigger>
          <TabsTrigger
            value="anuais"
            className="h-full rounded-lg px-6 sm:px-8 font-bold text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Relatórios Anuais
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mensais" className="space-y-6">
          {!isViewer && (
            <Card className="border-border shadow-sm rounded-2xl bg-card">
              <CardHeader className="border-b border-border pb-4 bg-muted/20">
                <CardTitle className="text-lg font-bold">Anexar Novo Relatório Mensal</CardTitle>
                <CardDescription>
                  Selecione o período e envie arquivos (PDF, DOC, Vídeo) ou Links.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6 items-end">
                  <div className="w-full md:w-1/4 space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Ano Referência
                    </Label>
                    <Select value={uploadYear} onValueChange={setUploadYear}>
                      <SelectTrigger className="h-11 rounded-xl bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }).map((_, i) => {
                          const y = new Date().getFullYear() - 5 + i
                          return (
                            <SelectItem key={y} value={y.toString()}>
                              {y}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-full md:w-1/4 space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Mês Referência
                    </Label>
                    <Select value={uploadMonth} onValueChange={setUploadMonth}>
                      <SelectTrigger className="h-11 rounded-xl bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((m, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {renderUploadControls()}
                </div>
              </CardContent>
            </Card>
          )}

          {renderTable('mensal')}
        </TabsContent>

        <TabsContent value="anuais" className="space-y-6">
          {!isViewer && (
            <Card className="border-border shadow-sm rounded-2xl bg-card">
              <CardHeader className="border-b border-border pb-4 bg-muted/20">
                <CardTitle className="text-lg font-bold">Anexar Novo Relatório Anual</CardTitle>
                <CardDescription>
                  Selecione o ano de referência e envie arquivos ou links consolidados.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6 items-end">
                  <div className="w-full md:w-1/3 space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Ano Referência
                    </Label>
                    <Select value={uploadYear} onValueChange={setUploadYear}>
                      <SelectTrigger className="h-11 rounded-xl bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }).map((_, i) => {
                          const y = new Date().getFullYear() - 5 + i
                          return (
                            <SelectItem key={y} value={y.toString()}>
                              {y}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  {renderUploadControls()}
                </div>
              </CardContent>
            </Card>
          )}

          {renderTable('anual')}
        </TabsContent>
      </Tabs>

      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Inserir Link Externo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome do Relatório / Link</Label>
              <Input
                value={linkName}
                onChange={(e) => setLinkName(e.target.value)}
                placeholder="Ex: Painel PowerBI"
              />
            </div>
            <div className="space-y-2">
              <Label>URL Completa</Label>
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <Button onClick={handleAddLink} className="w-full" disabled={!linkName || !linkUrl}>
              Adicionar Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
