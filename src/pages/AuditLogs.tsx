import { useAuthStore } from '@/stores/auth'
import { useAuditStore } from '@/stores/audit'
import { Navigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScrollText, Clock, Download, FileText } from 'lucide-react'

export default function AuditLogs() {
  const { user } = useAuthStore()
  const { logs } = useAuditStore()

  if (user?.role !== 'owner') return <Navigate to="/" replace />

  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )

  const formatTime = (isoString: string) => {
    const d = new Date(isoString)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d)
  }

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-2">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
            <ScrollText className="w-10 h-10 text-primary" /> Logs de Auditoria
          </h1>
          <p className="text-muted-foreground text-base font-medium mt-2">
            Monitoramento de atividades e modificações realizadas na plataforma. Acesso exclusivo
            para Proprietários.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            className="h-11 px-5 rounded-xl font-bold shadow-sm flex-1 sm:flex-none"
            onClick={() => alert('Funcionalidade de exportação para Excel em desenvolvimento.')}
          >
            <Download className="w-4 h-4 mr-2" /> Exportar Excel
          </Button>
          <Button
            variant="outline"
            className="h-11 px-5 rounded-xl font-bold shadow-sm flex-1 sm:flex-none"
            onClick={() => alert('Funcionalidade de exportação para PDF em desenvolvimento.')}
          >
            <FileText className="w-4 h-4 mr-2" /> Exportar PDF
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="text-xs font-bold uppercase tracking-widest py-5 pl-6 w-[250px] md:w-[300px]">
                Usuário
              </TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-widest py-5">
                Ação Realizada
              </TableHead>
              <TableHead className="text-right pr-6 py-5 text-xs font-bold uppercase tracking-widest w-[180px]">
                Data e Hora
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedLogs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center py-16 text-muted-foreground font-medium text-base"
                >
                  <ScrollText className="h-10 w-10 mx-auto mb-4 opacity-20" />
                  Nenhum registro de auditoria encontrado.
                </TableCell>
              </TableRow>
            ) : (
              sortedLogs.map((log) => (
                <TableRow key={log.id} className="border-border hover:bg-muted/50">
                  <TableCell className="py-4 pl-6">
                    <div className="font-bold text-foreground text-sm">{log.userName}</div>
                    <div className="text-xs text-muted-foreground font-medium mt-0.5">
                      {log.userEmail}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-sm text-foreground font-medium">
                    {log.action}
                  </TableCell>
                  <TableCell className="text-right pr-6 py-4">
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
                      <Clock className="w-3.5 h-3.5" />
                      {formatTime(log.timestamp)}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
