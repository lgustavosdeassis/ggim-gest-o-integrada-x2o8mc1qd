import { useState, useRef } from 'react'
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
  ChevronDown,
  Loader2,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { openDocumentViewer, downloadDocument, printDocument } from '@/lib/utils'

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
          report_type: tab as 'mensal' | 'anual',
          period_year: parseInt(uploadYear),
          period_month: tab === 'mensal' ? parseInt(uploadMonth) : null,
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
      report_type: tab as 'mensal' | 'anual',
      period_year: parseInt(uploadYear),
      period_month: tab === 'mensal' ? parseInt(uploadMonth) : null,
      name: linkName,
      file_type: 'Link',
      url: linkUrl,
    })
    setIsLinkDialogOpen(false)
    setLinkUrl('')
    setLinkName('')
  }

  const getGroupedMensais = () => {
    const mensais = reports.filter((r) => r.report_type === 'mensal')
    const grouped: Record<number, Record<number, typeof reports>> = {}
    mensais.forEach((r) => {
      if (!grouped[r.period_year]) grouped[r.period_year] = {}
      if (!grouped[r.period_year][r.period_month!]) grouped[r.period_year][r.period_month!] = []
      grouped[r.period_year][r.period_month!].push(r)
    })
    return grouped
  }

  const getGroupedAnuais = () => {
    const anuais = reports.filter((r) => r.report_type === 'anual')
    const grouped: Record<number, typeof reports> = {}
    anuais.forEach((r) => {
      if (!grouped[r.period_year]) grouped[r.period_year] = []
      grouped[r.period_year].push(r)
    })
    return grouped
  }

  const groupedMensais = getGroupedMensais()
  const groupedAnuais = getGroupedAnuais()

  const renderReportItem = (r: (typeof reports)[0]) => (
    <div
      key={r.id}
      className="flex flex-col gap-3 bg-card p-4 border border-border rounded-xl shadow-sm hover:border-primary/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        {r.file_type === 'Link' ||
        (r.url && (r.url.startsWith('http://') || r.url.startsWith('https://'))) ? (
          <a
            href={r.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-sm text-primary hover:underline line-clamp-2 flex items-center gap-1.5"
            title={r.name}
          >
            {r.name} <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          </a>
        ) : (
          <span className="font-semibold text-sm text-foreground line-clamp-2" title={r.name}>
            {r.name}
          </span>
        )}
        <span className="text-[10px] font-black bg-muted px-2 py-1 rounded uppercase tracking-widest text-primary shrink-0 border border-border mt-0.5">
          {r.file_type}
        </span>
      </div>
      <div className="flex gap-2 mt-auto pt-3 border-t border-border/50 justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs font-bold h-8 flex items-center justify-center gap-1.5"
            >
              Opções <ChevronDown className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 rounded-xl">
            <DropdownMenuItem
              className="cursor-pointer font-medium py-2"
              onClick={() => openDocumentViewer({ name: r.name, url: r.url, type: r.file_type })}
            >
              <Eye className="w-4 h-4 mr-2" /> Visualizar
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer font-medium py-2"
              onClick={() => downloadDocument({ name: r.name, url: r.url, type: r.file_type })}
            >
              <Download className="w-4 h-4 mr-2" /> Baixar
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer font-medium py-2"
              onClick={() => printDocument({ name: r.name, url: r.url, type: r.file_type })}
            >
              <Printer className="w-4 h-4 mr-2" /> Imprimir
            </DropdownMenuItem>
            {canDelete && (
              <>
                <div className="h-px bg-border my-1" />
                <DropdownMenuItem
                  className="cursor-pointer font-bold py-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                  onClick={() => {
                    if (window.confirm('Excluir este relatório?')) deleteReport(r.id)
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Excluir
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  const renderLoadMore = () => {
    if (!hasMore) return null
    return (
      <div className="flex justify-center pt-4 pb-8">
        <Button
          variant="outline"
          onClick={() => fetchReports(true)}
          disabled={isFetching}
          className="h-12 px-8 rounded-xl font-bold bg-card shadow-sm border-border hover:bg-muted"
        >
          {isFetching && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Carregar Mais
        </Button>
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

          <div className="space-y-8">
            {Object.keys(groupedMensais).length === 0 ? (
              <div className="text-center py-16 text-muted-foreground font-medium border border-dashed border-border rounded-2xl">
                Nenhum relatório mensal encontrado.
              </div>
            ) : (
              Object.keys(groupedMensais)
                .sort((a, b) => Number(b) - Number(a))
                .map((year) => (
                  <div key={year} className="space-y-4">
                    <h2 className="text-2xl font-black text-foreground border-b border-border pb-2">
                      {year}
                    </h2>
                    <div className="grid gap-6">
                      {Object.keys(groupedMensais[Number(year)])
                        .sort((a, b) => Number(b) - Number(a))
                        .map((month) => (
                          <div
                            key={month}
                            className="bg-muted/30 p-5 rounded-2xl border border-border shadow-sm"
                          >
                            <h3 className="text-lg font-bold text-foreground mb-4 capitalize">
                              {MONTHS[Number(month) - 1]}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {groupedMensais[Number(year)][Number(month)].map(renderReportItem)}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))
            )}
          </div>
          {renderLoadMore()}
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

          <div className="space-y-8">
            {Object.keys(groupedAnuais).length === 0 ? (
              <div className="text-center py-16 text-muted-foreground font-medium border border-dashed border-border rounded-2xl">
                Nenhum relatório anual encontrado.
              </div>
            ) : (
              Object.keys(groupedAnuais)
                .sort((a, b) => Number(b) - Number(a))
                .map((year) => (
                  <div
                    key={year}
                    className="bg-muted/30 p-5 rounded-2xl border border-border shadow-sm"
                  >
                    <h2 className="text-xl font-black text-foreground mb-4">Referência: {year}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {groupedAnuais[Number(year)].map(renderReportItem)}
                    </div>
                  </div>
                ))
            )}
          </div>
          {renderLoadMore()}
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
