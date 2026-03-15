import { useState } from 'react'
import useDataStore from '@/stores/main'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function Historico() {
  const { records, deleteRecord } = useDataStore()
  const [search, setSearch] = useState('')

  const filtered = records.filter(
    (r) =>
      r.instance.toLowerCase().includes(search.toLowerCase()) ||
      r.eventType.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-fade-in">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Histórico de Registros</h1>
          <p className="text-muted-foreground mt-1">
            Consulte e gerencie todas as atividades cadastradas.
          </p>
        </div>
        <div className="relative w-full md:w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por instância ou tipo..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
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
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Nenhum registro encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => (
                  <TableRow key={r.id}>
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
                          <DropdownMenuItem className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" /> Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <Pencil className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer text-destructive focus:text-destructive"
                            onClick={() => {
                              if (confirm('Tem certeza que deseja excluir?')) deleteRecord(r.id)
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
        <div className="p-4 border-t bg-muted/20 text-xs text-muted-foreground flex justify-between">
          <span>Mostrando {filtered.length} registros</span>
        </div>
      </Card>
    </div>
  )
}
