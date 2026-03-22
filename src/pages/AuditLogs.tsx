import { useState } from 'react'
import { useAuthStore } from '@/stores/auth'
import { useAuditStore } from '@/stores/audit'
import { Navigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  if (user?.role !== 'owner') return <Navigate to="/" replace />

  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )

  const filteredLogs = sortedLogs.filter((log) => {
    if (!log.timestamp) return false
    const logDateStr = log.timestamp.split('T')[0]
    if (startDate && logDateStr < startDate) return false
    if (endDate && logDateStr > endDate) return false
    return true
  })

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

  const handleExportExcel = () => {
    const htmlTable = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="UTF-8"></head>
      <body>
        <table border="1">
          <thead>
            <tr>
              <th style="background-color: #f3f4f6;">Usuário</th>
              <th style="background-color: #f3f4f6;">Email</th>
              <th style="background-color: #f3f4f6;">Ação Realizada</th>
              <th style="background-color: #f3f4f6;">Data e Hora</th>
            </tr>
          </thead>
          <tbody>
            ${filteredLogs
              .map((log) => {
                const d = new Date(log.timestamp)
                const dateTime = d.toLocaleString('pt-BR', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })
                return `
                <tr>
                  <td>${log.userName}</td>
                  <td>${log.userEmail}</td>
                  <td>${log.action}</td>
                  <td>${dateTime}</td>
                </tr>
              `
              })
              .join('')}
          </tbody>
        </table>
      </body>
      </html>
    `
    const blob = new Blob([htmlTable], { type: 'application/vnd.ms-excel' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `logs_auditoria_${new Date().toISOString().split('T')[0]}.xls`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => {
    const win = window.open('', '_blank')
    if (!win) {
      alert('Permita pop-ups no seu navegador para gerar o PDF.')
      return
    }

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Logs de Auditoria - GGIM</title>
        <style>
          body { font-family: sans-serif; padding: 20px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; }
          h2 { margin: 0 0 10px 0; color: #111; }
          .meta { font-size: 14px; color: #666; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #f4f4f4; font-weight: bold; text-transform: uppercase; }
          tr:nth-child(even) { background-color: #fafafa; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>Logs de Auditoria - GGIM</h2>
          <div class="meta">
            Período filtrado: ${startDate ? new Date(startDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'Início'} até ${endDate ? new Date(endDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'Hoje'}<br/>
            Gerado em: ${new Date().toLocaleString('pt-BR')}
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Usuário</th>
              <th>Email</th>
              <th>Ação Realizada</th>
              <th>Data e Hora</th>
            </tr>
          </thead>
          <tbody>
    `

    filteredLogs.forEach((log) => {
      const d = new Date(log.timestamp)
      const dateTimeStr = d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
      html += `
            <tr>
              <td><strong>${log.userName}</strong></td>
              <td>${log.userEmail}</td>
              <td>${log.action}</td>
              <td>${dateTimeStr}</td>
            </tr>
      `
    })

    html += `
          </tbody>
        </table>
        <script>
          window.onload = () => { 
            window.print(); 
            setTimeout(() => window.close(), 500); 
          }
        </script>
      </body>
      </html>
    `

    win.document.write(html)
    win.document.close()
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
            <ScrollText className="w-10 h-10 text-primary" /> Logs de Auditoria
          </h1>
          <p className="text-muted-foreground text-base font-medium mt-2">
            Monitoramento de atividades e modificações realizadas na plataforma. Acesso exclusivo
            para Proprietários.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-end justify-between gap-4 bg-muted/30 p-5 rounded-2xl border border-border shadow-sm">
        <div className="flex flex-wrap gap-4 w-full sm:w-auto">
          <div className="space-y-1.5 flex-1 sm:flex-none">
            <Label
              htmlFor="start-date"
              className="text-xs font-bold text-muted-foreground uppercase tracking-wider"
            >
              Data inicial
            </Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-11 bg-background"
            />
          </div>
          <div className="space-y-1.5 flex-1 sm:flex-none">
            <Label
              htmlFor="end-date"
              className="text-xs font-bold text-muted-foreground uppercase tracking-wider"
            >
              Data final
            </Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-11 bg-background"
            />
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
          <Button
            variant="outline"
            className="h-11 px-5 rounded-xl font-bold shadow-sm flex-1 sm:flex-none bg-background text-foreground"
            onClick={handleExportExcel}
            disabled={filteredLogs.length === 0}
          >
            <Download className="w-4 h-4 mr-2" /> Exportar para Excel
          </Button>
          <Button
            variant="outline"
            className="h-11 px-5 rounded-xl font-bold shadow-sm flex-1 sm:flex-none bg-background text-foreground"
            onClick={handleExportPDF}
            disabled={filteredLogs.length === 0}
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
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center py-16 text-muted-foreground font-medium text-base"
                >
                  <ScrollText className="h-10 w-10 mx-auto mb-4 opacity-20" />
                  Nenhum registro de auditoria encontrado para o período.
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
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
