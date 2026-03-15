import { useState, useMemo } from 'react'
import useDataStore from '@/stores/main'
import { ActivityRecord } from '@/lib/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Search, MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function Historico() {
  const { records, deleteRecord } = useDataStore()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [viewRecord, setViewRecord] = useState<ActivityRecord | null>(null)
  const [editRecord, setEditRecord] = useState<ActivityRecord | null>(null)

  const filtered = useMemo(
    () =>
      records.filter(
        (r) =>
          r.instance.toLowerCase().includes(search.toLowerCase()) ||
          r.eventType.toLowerCase().includes(search.toLowerCase()),
      ),
    [records, search],
  )

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(filtered.map((r) => r.id)))
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const handleBulkDelete = () => {
    if (confirm(`Tem certeza que deseja excluir ${selectedIds.size} registros?`)) {
      selectedIds.forEach((id) => deleteRecord(id))
      setSelectedIds(new Set())
      toast({
        title: 'Registros excluídos',
        description: 'Os registros selecionados foram removidos.',
      })
    }
  }

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-fade-in">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Histórico de Registros</h1>
          <p className="text-muted-foreground mt-1">
            Consulte e gerencie todas as atividades cadastradas.
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por instância ou tipo..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {selectedIds.size > 0 && (
            <Button variant="destructive" onClick={handleBulkDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir ({selectedIds.size})
            </Button>
          )}
        </div>
      </div>

      <Card className="shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="w-12 text-center">
                  <Checkbox
                    checked={filtered.length > 0 && selectedIds.size === filtered.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-[120px]">Data Inicial</TableHead>
                <TableHead>Instância</TableHead>
                <TableHead>Tipo / Modalidade</TableHead>
                <TableHead>Participantes</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Nenhum registro encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => (
                  <TableRow key={r.id} data-state={selectedIds.has(r.id) ? 'selected' : undefined}>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={selectedIds.has(r.id)}
                        onCheckedChange={() => toggleSelect(r.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-xs whitespace-nowrap">
                      {formatDateTime(r.meetingStart)}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{r.instance}</div>
                      <div className="text-xs text-muted-foreground">{r.location}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="mb-1">
                        {r.eventType}
                      </Badge>
                      <div className="text-xs text-muted-foreground">{r.modality}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        <span className="font-semibold text-primary">
                          {r.participantsPF.split(';').filter(Boolean).length}
                        </span>{' '}
                        PF •{' '}
                        <span className="font-semibold text-secondary">
                          {r.participantsPJ.split(';').filter(Boolean).length}
                        </span>{' '}
                        PJ
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {r.files.length} Docs Anexos
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
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => setViewRecord(r)}
                          >
                            <Eye className="mr-2 h-4 w-4" /> Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => setEditRecord(r)}
                          >
                            <Pencil className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer text-destructive focus:text-destructive"
                            onClick={() => {
                              if (confirm('Excluir registro?')) deleteRecord(r.id)
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
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
      </Card>

      <Dialog open={!!viewRecord} onOpenChange={(open) => !open && setViewRecord(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Visualizar Registro</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold">Instância / Tipo</p>
              <p className="text-sm text-muted-foreground">
                {viewRecord?.instance} - {viewRecord?.eventType}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold">Local e Modalidade</p>
              <p className="text-sm text-muted-foreground">
                {viewRecord?.location} ({viewRecord?.modality})
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold">Datas</p>
              <p className="text-sm text-muted-foreground">
                {viewRecord && formatDateTime(viewRecord.meetingStart)} até{' '}
                {viewRecord && formatDateTime(viewRecord.meetingEnd)}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={!!editRecord} onOpenChange={(open) => !open && setEditRecord(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Registro</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-muted-foreground">
            Funcionalidade de edição completa será implementada no módulo de Registrar.
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setEditRecord(null)}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
