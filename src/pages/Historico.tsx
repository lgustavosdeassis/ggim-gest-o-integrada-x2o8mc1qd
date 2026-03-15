import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/stores/main'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { MoreHorizontal, Search, Trash, Eye, Pencil, Clock, FileText } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { formatDateTime, parseSemicolonList, calculateHoursDifference } from '@/lib/utils'
import { ActivityRecord } from '@/lib/types'

export default function Historico() {
  const navigate = useNavigate()
  const { activities, deleteActivity, bulkDeleteActivities } = useAppStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [viewActivity, setViewActivity] = useState<ActivityRecord | null>(null)

  const filteredActivities = activities.filter(
    (act) =>
      act.instance.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const toggleSelectAll = () =>
    setSelectedIds(
      selectedIds.size === filteredActivities.length
        ? new Set()
        : new Set(filteredActivities.map((a) => a.id)),
    )
  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const handleBulkDelete = () => {
    if (
      window.confirm(
        'Tem certeza que deseja excluir os registros selecionados de forma definitiva?',
      )
    ) {
      bulkDeleteActivities(Array.from(selectedIds))
      setSelectedIds(new Set())
    }
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este registro de forma definitiva?')) {
      deleteActivity(id)
      const newSelected = new Set(selectedIds)
      newSelected.delete(id)
      setSelectedIds(newSelected)
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-[1600px] mx-auto py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2">Acervo Histórico</h1>
          <p className="text-muted-foreground text-base">
            Visualize, filtre e gerencie detalhadamente os dados crus em tabela.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Pesquisa global..."
              className="pl-11 bg-card border-border/30 h-12 rounded-xl text-white focus-visible:ring-primary/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {selectedIds.size > 0 && (
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              className="h-12 px-5 rounded-xl font-bold shadow-lg"
            >
              <Trash className="h-4 w-4 mr-2" /> Excluir ({selectedIds.size})
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border/20 bg-card shadow-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-border/20 hover:bg-transparent">
              <TableHead className="w-[60px] pl-6 py-5">
                <Checkbox
                  checked={
                    selectedIds.size === filteredActivities.length && filteredActivities.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                  className="border-muted-foreground/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
              </TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-widest text-muted-foreground py-5">
                Identificação
              </TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-widest text-muted-foreground py-5">
                Tipologia
              </TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-widest text-muted-foreground py-5">
                Métricas
              </TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-widest text-muted-foreground py-5">
                Acervo Doc
              </TableHead>
              <TableHead className="text-right pr-6 py-5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Cmd
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredActivities.length === 0 ? (
              <TableRow className="border-border/10">
                <TableCell
                  colSpan={6}
                  className="text-center py-16 text-muted-foreground font-medium text-base"
                >
                  <FileText className="h-10 w-10 mx-auto mb-4 opacity-20" />
                  Nenhum registro encontrado correspondente à pesquisa.
                </TableCell>
              </TableRow>
            ) : (
              filteredActivities.map((act) => {
                const mtgDuration = calculateHoursDifference(act.meetingStart, act.meetingEnd)
                const actDuration =
                  (act.actions || []).reduce(
                    (acc, a) => acc + calculateHoursDifference(a.start, a.end),
                    0,
                  ) +
                  (act.hasAction &&
                  act.actionStart &&
                  act.actionEnd &&
                  (!act.actions || act.actions.length === 0)
                    ? calculateHoursDifference(act.actionStart, act.actionEnd)
                    : 0)

                return (
                  <TableRow
                    key={act.id}
                    className="border-border/10 hover:bg-muted/20 transition-colors group"
                  >
                    <TableCell className="pl-6 py-4">
                      <Checkbox
                        checked={selectedIds.has(act.id)}
                        onCheckedChange={() => toggleSelect(act.id)}
                        className="border-muted-foreground/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="font-bold text-white text-sm mb-1">{act.instance}</div>
                      <div className="text-xs text-muted-foreground font-medium line-clamp-1">
                        <span className="text-primary font-semibold">
                          {formatDateTime(act.meetingStart).substring(0, 10)}
                        </span>{' '}
                        • {act.location}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="inline-flex items-center rounded-md border border-border/40 px-2 py-0.5 text-[11px] font-bold uppercase tracking-widest bg-background text-gray-300">
                        {act.eventType}
                      </div>
                      <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mt-2">
                        {act.modality}{' '}
                        {((act.actions && act.actions.length > 0) || act.hasAction) && (
                          <span className="text-primary ml-1">• C/ Ação Extra</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="text-sm text-gray-300 font-medium">
                        <span className="font-black text-white">
                          {parseSemicolonList(act.participantsPF).length}
                        </span>{' '}
                        PF •{' '}
                        <span className="font-black text-white">
                          {parseSemicolonList(act.participantsPJ).length}
                        </span>{' '}
                        PJ
                      </div>
                      <div className="text-xs text-primary font-bold flex items-center gap-1.5 mt-1.5">
                        <Clock className="w-3.5 h-3.5" /> {(mtgDuration + actDuration).toFixed(1)}h
                        Totais
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      {act.documents && act.documents.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                          {act.documents.map((d, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center rounded border border-primary/30 px-2 py-0.5 text-[10px] font-bold bg-primary/10 text-primary uppercase tracking-widest truncate max-w-[80px]"
                              title={d.name}
                            >
                              {d.type || 'S/TIPO'}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                          S/ Anexos
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-9 w-9 p-0 rounded-xl hover:bg-muted/50 text-muted-foreground hover:text-white"
                          >
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-56 border-border/40 bg-card/95 backdrop-blur shadow-2xl rounded-xl"
                        >
                          <DropdownMenuItem
                            onClick={() => setViewActivity(act)}
                            className="cursor-pointer py-2.5 font-medium focus:bg-muted focus:text-white"
                          >
                            <Eye className="mr-3 h-4 w-4 text-primary" /> Inspecionar Total
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => navigate(`/registrar?edit=${act.id}`)}
                            className="cursor-pointer py-2.5 font-medium focus:bg-muted focus:text-white"
                          >
                            <Pencil className="mr-3 h-4 w-4 text-chart-2" /> Editar Dados
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer py-2.5 font-bold text-destructive focus:bg-destructive/10 focus:text-destructive mt-1"
                            onClick={() => handleDelete(act.id)}
                          >
                            <Trash className="mr-3 h-4 w-4" /> Apagar do Banco
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!viewActivity} onOpenChange={(open) => !open && setViewActivity(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-card border-border/20 shadow-2xl rounded-2xl p-0">
          <DialogHeader className="p-6 border-b border-border/10 bg-muted/20 sticky top-0 z-10 backdrop-blur-xl">
            <DialogTitle className="text-xl font-black text-white flex items-center gap-3">
              <div className="w-2 h-6 bg-primary rounded-full" />
              Espelho Completo do Registro
            </DialogTitle>
            <DialogDescription className="sr-only">
              Informações completas do registro.
            </DialogDescription>
          </DialogHeader>
          {viewActivity && (
            <div className="p-6 space-y-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-6">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">
                    Instância
                  </span>
                  <p className="font-bold text-white">{viewActivity.instance}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">
                    Tipologia
                  </span>
                  <p className="font-bold text-white">{viewActivity.eventType}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">
                    Modalidade
                  </span>
                  <p className="font-bold text-white">{viewActivity.modality}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">
                    Localização
                  </span>
                  <p className="font-bold text-white">{viewActivity.location}</p>
                </div>
              </div>

              <div className="bg-background/50 p-5 rounded-2xl border border-border/20">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" /> Tempo e Ações
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-border/20">
                    <span className="text-sm font-medium text-muted-foreground">
                      Base ({formatDateTime(viewActivity.meetingStart)} a{' '}
                      {formatDateTime(viewActivity.meetingEnd)})
                    </span>
                    <span className="font-mono font-bold text-white bg-muted px-2 py-1 rounded">
                      {calculateHoursDifference(
                        viewActivity.meetingStart,
                        viewActivity.meetingEnd,
                      ).toFixed(1)}
                      h
                    </span>
                  </div>

                  {viewActivity.actions && viewActivity.actions.length > 0 && (
                    <div className="pt-2 space-y-2">
                      {viewActivity.actions.map((a, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center text-sm bg-card p-3 rounded-xl border border-border/30"
                        >
                          <span className="font-medium text-muted-foreground">
                            Ação Extra #{i + 1} ({formatDateTime(a.start).substring(0, 5)} a{' '}
                            {formatDateTime(a.end).substring(0, 5)})
                          </span>
                          <span className="font-mono font-bold text-primary">
                            +{calculateHoursDifference(a.start, a.end).toFixed(1)}h
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-3 mt-1">
                    <span className="font-black text-white uppercase tracking-widest text-sm">
                      Horas Dedicadas (Soma):
                    </span>
                    <span className="text-xl font-black text-primary">
                      {(
                        calculateHoursDifference(
                          viewActivity.meetingStart,
                          viewActivity.meetingEnd,
                        ) +
                        (viewActivity.actions || []).reduce(
                          (acc, a) => acc + calculateHoursDifference(a.start, a.end),
                          0,
                        )
                      ).toFixed(1)}
                      h
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-between mb-2">
                    Nomes (PF){' '}
                    <span className="bg-muted px-2 py-0.5 rounded text-white">
                      {parseSemicolonList(viewActivity.participantsPF).length}
                    </span>
                  </span>
                  <div className="p-4 bg-muted/10 rounded-xl border border-border/20 text-sm text-gray-300 leading-relaxed max-h-40 overflow-y-auto font-medium">
                    {viewActivity.participantsPF
                      ? parseSemicolonList(viewActivity.participantsPF).join(' • ')
                      : 'Sem dados.'}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-between mb-2">
                    Instituições (PJ){' '}
                    <span className="bg-muted px-2 py-0.5 rounded text-white">
                      {parseSemicolonList(viewActivity.participantsPJ).length}
                    </span>
                  </span>
                  <div className="p-4 bg-muted/10 rounded-xl border border-border/20 text-sm text-gray-300 leading-relaxed max-h-40 overflow-y-auto font-medium">
                    {viewActivity.participantsPJ
                      ? parseSemicolonList(viewActivity.participantsPJ).join(' • ')
                      : 'Sem dados.'}
                  </div>
                </div>
              </div>

              {viewActivity.deliberations && (
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-between mb-2">
                    Deliberações Firmadas{' '}
                    <span className="bg-muted px-2 py-0.5 rounded text-white">
                      {parseSemicolonList(viewActivity.deliberations).length}
                    </span>
                  </span>
                  <div className="p-4 bg-muted/10 rounded-xl border border-border/20 text-sm text-white leading-relaxed max-h-40 overflow-y-auto font-medium">
                    <ul className="list-disc pl-5 space-y-1">
                      {parseSemicolonList(viewActivity.deliberations).map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {viewActivity.documents && viewActivity.documents.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-between mb-3">
                    Acervo / Anexos{' '}
                    <span className="bg-primary/20 text-primary px-2 py-0.5 rounded font-black">
                      {viewActivity.documents.length}
                    </span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {viewActivity.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-card p-3 border border-border/30 rounded-xl"
                      >
                        <span className="font-semibold text-sm text-white truncate pr-4">
                          {doc.name}
                        </span>
                        <span className="text-[10px] font-black bg-muted px-2 py-1 rounded uppercase tracking-widest text-primary shrink-0">
                          {doc.type || 'S/TIPO'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
