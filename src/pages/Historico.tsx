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
import { MoreHorizontal, Search, Trash, Eye, Pencil } from 'lucide-react'
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
      act.eventType.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const toggleSelectAll = () => {
    setSelectedIds(
      selectedIds.size === filteredActivities.length
        ? new Set()
        : new Set(filteredActivities.map((a) => a.id)),
    )
  }

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
            Consulte e gerencie todas as atividades cadastradas.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {selectedIds.size > 0 && (
            <Button variant="destructive" onClick={handleBulkDelete}>
              <Trash className="h-4 w-4 mr-2" />
              Excluir ({selectedIds.size})
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border bg-card">
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
              <TableHead>Participantes</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredActivities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredActivities.map((act) => (
                <TableRow key={act.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(act.id)}
                      onCheckedChange={() => toggleSelect(act.id)}
                    />
                  </TableCell>
                  <TableCell>{formatDateTime(act.meetingStart)}</TableCell>
                  <TableCell>
                    <div className="font-medium">{act.instance}</div>
                    <div className="text-xs text-muted-foreground">{act.location}</div>
                  </TableCell>
                  <TableCell>
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
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
                      <span className="font-medium">
                        {parseSemicolonList(act.participantsPF).length}
                      </span>{' '}
                      PF •{' '}
                      <span className="font-medium">
                        {parseSemicolonList(act.participantsPJ).length}
                      </span>{' '}
                      PJ
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {act.documents?.length || 0} Docs
                    </div>
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
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/registrar?edit=${act.id}`)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:bg-red-50"
                          onClick={() => handleDelete(act.id)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!viewActivity} onOpenChange={(open) => !open && setViewActivity(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes da Atividade</DialogTitle>
            <DialogDescription className="sr-only">
              Informações completas do registro.
            </DialogDescription>
          </DialogHeader>
          {viewActivity && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold text-muted-foreground">Instância</span>
                  <p>{viewActivity.instance}</p>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">Tipo de Evento</span>
                  <p>{viewActivity.eventType}</p>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">Reunião</span>
                  <p>
                    {formatDateTime(viewActivity.meetingStart)} a{' '}
                    {formatDateTime(viewActivity.meetingEnd)}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">Local</span>
                  <p>{viewActivity.location}</p>
                </div>

                {viewActivity.hasAction &&
                  viewActivity.actionStart &&
                  (!viewActivity.actions || viewActivity.actions.length === 0) && (
                    <div className="col-span-2">
                      <span className="font-semibold text-muted-foreground">
                        Ação Gerada (Legado)
                      </span>
                      <p>
                        {formatDateTime(viewActivity.actionStart || '')} a{' '}
                        {formatDateTime(viewActivity.actionEnd || '')}
                      </p>
                    </div>
                  )}

                {viewActivity.actions && viewActivity.actions.length > 0 && (
                  <div className="col-span-2">
                    <span className="font-semibold text-muted-foreground">Ações Vinculadas</span>
                    <ul className="mt-1 space-y-1">
                      {viewActivity.actions.map((a, i) => (
                        <li key={i} className="text-sm bg-slate-50 p-2 rounded border">
                          {formatDateTime(a.start)} a {formatDateTime(a.end)}
                          <span className="ml-2 text-xs text-muted-foreground font-medium">
                            ({calculateHoursDifference(a.start, a.end).toFixed(1)}h)
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div>
                <span className="font-semibold text-muted-foreground">Participantes PF</span>
                <p className="mt-1">{viewActivity.participantsPF}</p>
              </div>
              <div>
                <span className="font-semibold text-muted-foreground">Participantes PJ</span>
                <p className="mt-1">{viewActivity.participantsPJ}</p>
              </div>
              {viewActivity.deliberations && (
                <div>
                  <span className="font-semibold text-muted-foreground">Deliberações</span>
                  <p className="mt-1">{viewActivity.deliberations}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
