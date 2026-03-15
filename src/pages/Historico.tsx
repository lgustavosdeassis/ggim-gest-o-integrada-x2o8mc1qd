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
import { MoreHorizontal, Search, Trash, Eye, Pencil, Clock } from 'lucide-react'
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
    if (window.confirm('Tem certeza que deseja excluir os registros selecionados?')) {
      bulkDeleteActivities(Array.from(selectedIds))
      setSelectedIds(new Set())
    }
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este registro?')) {
      deleteActivity(id)
      const newSelected = new Set(selectedIds)
      newSelected.delete(id)
      setSelectedIds(newSelected)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Histórico de Registros</h1>
          <p className="text-muted-foreground">
            Consulte e gerencie todas as atividades cadastradas no sistema.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por instância, tipo, local..."
              className="pl-8 bg-card"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {selectedIds.size > 0 && (
            <Button variant="destructive" onClick={handleBulkDelete}>
              <Trash className="h-4 w-4 mr-2" /> Excluir ({selectedIds.size})
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={
                    selectedIds.size === filteredActivities.length && filteredActivities.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Data Inicial</TableHead>
              <TableHead>Instância / Local</TableHead>
              <TableHead>Tipo / Modalidade</TableHead>
              <TableHead>Engajamento / Carga Horária</TableHead>
              <TableHead>Documentos</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredActivities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Nenhum registro encontrado.
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
                  <TableRow key={act.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(act.id)}
                        onCheckedChange={() => toggleSelect(act.id)}
                      />
                    </TableCell>
                    <TableCell>{formatDateTime(act.meetingStart)}</TableCell>
                    <TableCell>
                      <div className="font-semibold text-primary">{act.instance}</div>
                      <div className="text-xs text-muted-foreground font-medium">
                        {act.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-muted/30">
                        {act.eventType}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {act.modality}{' '}
                        {(act.actions && act.actions.length > 0) || act.hasAction
                          ? `• ${act.actions?.length || 1} Ação(ões)`
                          : ''}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="font-bold">
                          {parseSemicolonList(act.participantsPF).length}
                        </span>{' '}
                        PF •{' '}
                        <span className="font-bold">
                          {parseSemicolonList(act.participantsPJ).length}
                        </span>{' '}
                        PJ
                      </div>
                      <div className="text-xs text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> {(mtgDuration + actDuration).toFixed(1)}h
                        Total
                      </div>
                    </TableCell>
                    <TableCell>
                      {act.documents && act.documents.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {act.documents.map((d, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center rounded border border-primary/20 px-1.5 py-0.5 text-[10px] font-bold bg-primary/5 text-primary truncate"
                            >
                              {d.type || 'OUTROS'}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Nenhum</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewActivity(act)}>
                            <Eye className="mr-2 h-4 w-4" /> Visualizar Completo
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/registrar?edit=${act.id}`)}>
                            <Pencil className="mr-2 h-4 w-4" /> Editar Atividade
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(act.id)}
                          >
                            <Trash className="mr-2 h-4 w-4" /> Excluir Registro
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
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl border-b pb-2">Detalhes da Atividade</DialogTitle>
            <DialogDescription className="sr-only">
              Informações completas do registro.
            </DialogDescription>
          </DialogHeader>
          {viewActivity && (
            <div className="space-y-6 text-sm mt-2">
              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Instância
                  </span>
                  <p className="mt-1 font-semibold text-primary">{viewActivity.instance}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Tipo e Modalidade
                  </span>
                  <p className="mt-1 font-medium">
                    {viewActivity.eventType} • {viewActivity.modality}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Local
                  </span>
                  <p className="mt-1 font-medium">{viewActivity.location}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Período da Reunião
                  </span>
                  <p className="mt-1 font-medium">
                    {formatDateTime(viewActivity.meetingStart)} a{' '}
                    {formatDateTime(viewActivity.meetingEnd)}
                  </p>
                </div>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 block">
                  Resumo de Carga Horária e Ações
                </span>
                <div className="space-y-2">
                  <div className="flex justify-between items-center pb-2 border-b border-border/50">
                    <span>Tempo de Reunião:</span>
                    <span className="font-mono font-medium">
                      {calculateHoursDifference(
                        viewActivity.meetingStart,
                        viewActivity.meetingEnd,
                      ).toFixed(1)}
                      h
                    </span>
                  </div>

                  {viewActivity.actions && viewActivity.actions.length > 0 && (
                    <div className="pt-2">
                      <span className="text-xs font-semibold mb-2 block">Ações Vinculadas:</span>
                      <ul className="space-y-2">
                        {viewActivity.actions.map((a, i) => (
                          <li
                            key={i}
                            className="flex justify-between items-center text-xs bg-background p-2 rounded border"
                          >
                            <span>
                              Ação {i + 1} ({formatDateTime(a.start)} - {formatDateTime(a.end)})
                            </span>
                            <span className="font-mono font-bold text-primary">
                              {calculateHoursDifference(a.start, a.end).toFixed(1)}h
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 mt-2 font-bold text-base text-primary">
                    <span>Total de Horas Dedicadas:</span>
                    <span>
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

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Participantes Físicos ({parseSemicolonList(viewActivity.participantsPF).length})
                  </span>
                  <div className="mt-1 p-3 bg-muted/20 rounded-md border text-xs leading-relaxed max-h-32 overflow-y-auto">
                    {viewActivity.participantsPF || 'Nenhum participante informado.'}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Instituições ({parseSemicolonList(viewActivity.participantsPJ).length})
                  </span>
                  <div className="mt-1 p-3 bg-muted/20 rounded-md border text-xs leading-relaxed max-h-32 overflow-y-auto">
                    {viewActivity.participantsPJ || 'Nenhuma instituição informada.'}
                  </div>
                </div>
                {viewActivity.deliberations && (
                  <div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Deliberações ({parseSemicolonList(viewActivity.deliberations).length})
                    </span>
                    <div className="mt-1 p-3 bg-muted/20 rounded-md border text-xs leading-relaxed max-h-32 overflow-y-auto">
                      {viewActivity.deliberations}
                    </div>
                  </div>
                )}
                {viewActivity.documents && viewActivity.documents.length > 0 && (
                  <div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Documentos Anexados ({viewActivity.documents.length})
                    </span>
                    <div className="mt-2 space-y-2">
                      {viewActivity.documents.map((doc, idx) => (
                        <div key={idx} className="flex flex-col bg-muted/10 p-2 border rounded">
                          <span className="font-medium text-sm">{doc.name}</span>
                          <span className="text-xs font-bold text-primary mt-0.5">
                            Tipo: {doc.type || 'Não especificado'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
