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
} from 'lucide-react'
import { openDocumentViewer, downloadDocument, printDocument } from '@/lib/utils'
import { format } from 'date-fns'

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

  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkName, setLinkName] = useState('')

  const [pageMensal, setPageMensal] = useState(0)
  const [pageAnual, setPageAnual] = useState(0)

  useEffect(() => {
    // Limpa cache local a cada 30 minutos
    const interval = setInterval(
      () => {
        useReportStore.setState({ reports: [], page: 0, hasMore: true })
        fetchReports()
      },
      30 * 60 * 1000,
    )

    return () => {
      // Desativa listeners desnecessários ao sair da página
      clearInterval(interval)
    }
  }, [fetchReports])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    for (const file of Array.from(files)) {
      const reader = new FileReader()
      reader.onload = async (event) => {
        let fileType = 'Outros'
        const ext = file.name.split('.').pop()?.toLowerCase()
        if (ext === 'pdf') fileType = 'PDF'
        else if (['doc', 'docx'].includes(ext || '')) fileType = 'Word'
        else if (['mp4', 'mkv', 'avi', 'mov'].includes(ext || '')) fileType = 'Vídeo'

        await addReport({
          report_type: tab === 'mensais' ? 'mensal' : 'anual',
          period_year: parseInt(uploadYear),
          period_month: tab === 'mensais' ? parseInt(uploadMonth) : null,
          name: file.name,
          file_type: fileType,
          url: event.target?.result as string,
        })
      }
      reader.readAsDataURL(file)
    }
    if (fileRef.current) fileRef.current.value = ''
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
                  <div className="w-full md:w-1/3 space-y-2">
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
                  <div className="w-full md:w-1/3 flex gap-2">
                    <input
                      type="file"
                      ref={fileRef}
                      className="hidden"
                      multiple
                      accept=".pdf,.doc,.docx,.mp4,.avi,.mkv,.mov"
                      onChange={handleFileChange}
                    />
                    <Button
                      onClick={() => fileRef.current?.click()}
                      className="flex-1 h-11 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                    >
                      <UploadCloud className="w-4 h-4 mr-2 hidden sm:block" /> Arquivo
                    </Button>
                    <Button
                      onClick={() => setIsLinkDialogOpen(true)}
                      variant="outline"
                      className="flex-1 h-11 rounded-xl font-bold bg-background shadow-sm border-border"
                    >
                      <LinkIcon className="w-4 h-4 mr-2 hidden sm:block" /> Link
                    </Button>
                  </div>
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
                  <div className="w-full md:w-1/2 space-y-2">
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
                  <div className="w-full md:w-1/2 flex gap-2">
                    <input
                      type="file"
                      ref={fileRef}
                      className="hidden"
                      multiple
                      accept=".pdf,.doc,.docx,.mp4,.avi,.mkv,.mov"
                      onChange={handleFileChange}
                    />
                    <Button
                      onClick={() => fileRef.current?.click()}
                      className="flex-1 h-11 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                    >
                      <UploadCloud className="w-4 h-4 mr-2 hidden sm:block" /> Arquivo
                    </Button>
                    <Button
                      onClick={() => setIsLinkDialogOpen(true)}
                      variant="outline"
                      className="flex-1 h-11 rounded-xl font-bold bg-background shadow-sm border-border"
                    >
                      <LinkIcon className="w-4 h-4 mr-2 hidden sm:block" /> Link
                    </Button>
                  </div>
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
