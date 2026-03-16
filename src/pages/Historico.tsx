import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/stores/main'
import { useAuthStore } from '@/stores/auth'
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
import { Checkbox } from '@/components/ui/checkbox'
import { MoreHorizontal, Trash, Eye, Pencil, Clock, FileText } from 'lucide-react'
import { formatDateTime, parseSemicolonList, calculateHoursDifference } from '@/lib/utils'
import { ActivityRecord } from '@/lib/types'
import { FilterSection } from '@/components/historico/FilterSection'
import { ViewDialog } from '@/components/historico/ViewDialog'

export default function Historico() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isViewer = user?.role === 'viewer'
  const { activities, deleteActivity, bulkDeleteActivities } = useAppStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [viewActivity, setViewActivity] = useState<ActivityRecord | null>(null)

  useEffect(() => {
    if (startDate && endDate && endDate < startDate) {
      setEndDate(undefined)
    }
  }, [startDate, endDate])

  const filteredActivities = activities.filter((act) => {
    const s = searchTerm.toLowerCase()
    const matchesSearch =
      !s ||
      act.instance.toLowerCase().includes(s) ||
      act.eventType.toLowerCase().includes(s) ||
      act.location.toLowerCase().includes(s)

    let matchesDate = true
    if (startDate || endDate) {
      const actDate = new Date(act.meetingStart)
      if (startDate) {
        const start = new Date(startDate)
        start.setHours(0, 0, 0, 0)
        if (actDate < start) matchesDate = false
      }
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        if (actDate > end) matchesDate = false
      }
    }
    return matchesSearch && matchesDate
  })

  const toggleSelectAll = () =>
    setSelectedIds(
      selectedIds.size === filteredActivities.length && filteredActivities.length > 0
        ? new Set()
        : new Set(filteredActivities.map((a) => a.id)),
    )
  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) newSelected.delete(id)
    else newSelected.add(id)
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
          <h1 className="text-4xl font-black tracking-tight text-foreground mb-2">
            Acervo Histórico
          </h1>
          <p className="text-muted-foreground text-base font-medium">
            Visualize, filtre e gerencie detalhadamente os dados crus em tabela.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {selectedIds.size > 0 && !isViewer && (
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              className="h-12 px-5 rounded-xl font-bold shadow-sm"
            >
              <Trash className="h-4 w-4 mr-2" /> Excluir ({selectedIds.size})
            </Button>
          )}
        </div>
      </div>

      <FilterSection
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
      />

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="border-border hover:bg-transparent">
              {!isViewer && (
                <TableHead className="w-[60px] pl-6 py-5">
                  <Checkbox
                    checked={
                      selectedIds.size === filteredActivities.length &&
                      filteredActivities.length > 0
                    }
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
              )}
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
              <TableRow className="border-border">
                <TableCell
                  colSpan={isViewer ? 5 : 6}
                  className="text-center py-16 text-muted-foreground font-medium text-base"
                >
                  <FileText className="h-10 w-10 mx-auto mb-4 opacity-20" />
                  Nenhum registro encontrado correspondente à pesquisa e período.
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
                    className="border-border hover:bg-muted/50 transition-colors group"
                  >
                    {!isViewer && (
                      <TableCell className="pl-6 py-4">
                        <Checkbox
                          checked={selectedIds.has(act.id)}
                          onCheckedChange={() => toggleSelect(act.id)}
                        />
                      </TableCell>
                    )}
                    <TableCell className="py-4">
                      <div className="font-bold text-foreground text-sm mb-1">{act.instance}</div>
                      <div className="text-xs text-muted-foreground font-medium line-clamp-1">
                        <span className="text-primary font-semibold">
                          {formatDateTime(act.meetingStart).substring(0, 10)}
                        </span>{' '}
                        • {act.location}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="inline-flex items-center rounded-md border border-border px-2 py-0.5 text-[11px] font-bold uppercase tracking-widest bg-background text-muted-foreground">
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
                      <div className="text-sm text-muted-foreground font-medium">
                        <span className="font-black text-foreground">
                          {parseSemicolonList(act.participantsPF).length}
                        </span>{' '}
                        PF •{' '}
                        <span className="font-black text-foreground">
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
                              className="inline-flex items-center rounded border border-primary/20 px-2 py-0.5 text-[10px] font-bold bg-primary/10 text-primary uppercase tracking-widest truncate max-w-[80px]"
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
                            className="h-9 w-9 p-0 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground"
                          >
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-56 border-border bg-popover shadow-xl rounded-xl"
                        >
                          <DropdownMenuItem
                            onClick={() => setViewActivity(act)}
                            className="cursor-pointer py-2.5 font-medium focus:bg-accent focus:text-accent-foreground"
                          >
                            <Eye className="mr-3 h-4 w-4 text-primary" /> Inspecionar Total
                          </DropdownMenuItem>
                          {!isViewer && (
                            <DropdownMenuItem
                              onClick={() => navigate(`/registrar?edit=${act.id}`)}
                              className="cursor-pointer py-2.5 font-medium focus:bg-accent focus:text-accent-foreground"
                            >
                              <Pencil className="mr-3 h-4 w-4 text-chart-2" /> Editar Dados
                            </DropdownMenuItem>
                          )}
                          {!isViewer && (
                            <DropdownMenuItem
                              className="cursor-pointer py-2.5 font-bold text-destructive focus:bg-destructive/10 focus:text-destructive mt-1"
                              onClick={() => handleDelete(act.id)}
                            >
                              <Trash className="mr-3 h-4 w-4" /> Apagar do Banco
                            </DropdownMenuItem>
                          )}
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

      <ViewDialog viewActivity={viewActivity} setViewActivity={setViewActivity} />
    </div>
  )
}
