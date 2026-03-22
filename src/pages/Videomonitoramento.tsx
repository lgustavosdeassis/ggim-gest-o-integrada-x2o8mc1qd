import { useState } from 'react'
import { MonitorPlay, Plus, Calendar as CalendarIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { useVideoStore } from '@/stores/video'
import { VideoFormDialog } from '@/components/video/VideoFormDialog'

const getYYYYMM = (d: Date) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

export default function Videomonitoramento() {
  const { records } = useVideoStore()
  const [period, setPeriod] = useState('Personalizado')
  const [customStart, setCustomStart] = useState<Date | undefined>(new Date(2026, 0, 1))
  const [customEnd, setCustomEnd] = useState<Date | undefined>(new Date(2026, 11, 31))
  const [isFormOpen, setIsFormOpen] = useState(false)

  const filteredRecords = records.filter((r) => {
    if (period === 'Personalizado') {
      if (customStart && customEnd) {
        const startStr = getYYYYMM(customStart)
        const endStr = getYYYYMM(customEnd)
        return r.date >= startStr && r.date <= endStr
      }
      return true
    }
    return true
  })

  const record = filteredRecords.reduce(
    (acc, curr) => ({
      particulares: acc.particulares + curr.particulares,
      instituicoes: acc.instituicoes + curr.instituicoes,
      imprensa: acc.imprensa + curr.imprensa,
      operadores: acc.operadores + curr.operadores,
    }),
    { particulares: 0, instituicoes: 0, imprensa: 0, operadores: 0 },
  )

  const total = record.particulares + record.instituicoes + record.imprensa + record.operadores
  const seguranca = record.instituicoes + record.operadores
  const percSeguranca = total > 0 ? Math.round((seguranca / total) * 100) : 0
  const percOperadores = total > 0 ? Math.round((record.operadores / total) * 100) : 0

  const chartData = [
    { name: 'Particulares', value: record.particulares, fill: '#60a5fa' },
    { name: 'Instituições', value: record.instituicoes, fill: '#a78bfa' },
    { name: 'Imprensa', value: record.imprensa, fill: '#94a3b8' },
    { name: 'Operadores', value: record.operadores, fill: '#d946ef' },
  ]

  const chartConfig = {
    value: { label: 'Solicitações' },
  }

  return (
    <div className="flex-1 space-y-8 max-w-[1200px] mx-auto min-h-[calc(100vh-80px)] animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground uppercase mb-2">
            Videomonitoramento DITM/DVVSE
          </h1>
          <p className="text-muted-foreground text-lg font-bold flex items-center gap-2">
            <MonitorPlay className="w-5 h-5 text-primary" /> Fornecimento de Imagens e Provas
            Materiais
          </p>
        </div>
        <div className="flex flex-col md:flex-row flex-wrap items-stretch md:items-center justify-end gap-4 w-full xl:w-auto mt-4 xl:mt-0">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-full md:w-48 h-12 rounded-xl bg-background border-border text-foreground font-bold">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="Personalizado"
                className="data-[state=checked]:bg-[#eab308] data-[state=checked]:text-[#0f172a] focus:bg-[#eab308]/80 focus:text-[#0f172a] font-bold"
              >
                Personalizado
              </SelectItem>
            </SelectContent>
          </Select>

          {period === 'Personalizado' && (
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto mt-1 md:mt-0">
              <div className="relative flex-1 md:flex-none">
                <span className="absolute -top-2.5 left-3 bg-background px-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider z-10">
                  Data Inicial
                </span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full md:w-[170px] h-12 justify-start text-left font-bold rounded-xl border-border bg-background',
                        !customStart && 'text-muted-foreground',
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customStart ? (
                        customStart.toLocaleDateString('pt-BR')
                      ) : (
                        <span>Selecione</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={customStart}
                      onSelect={setCustomStart}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="relative flex-1 md:flex-none">
                <span className="absolute -top-2.5 left-3 bg-background px-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider z-10">
                  Data Final
                </span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full md:w-[170px] h-12 justify-start text-left font-bold rounded-xl border-border bg-background',
                        !customEnd && 'text-muted-foreground',
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customEnd ? customEnd.toLocaleDateString('pt-BR') : <span>Selecione</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={customEnd}
                      onSelect={setCustomEnd}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          <Button
            onClick={() => setIsFormOpen(true)}
            className="w-full md:w-auto h-12 px-6 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md whitespace-nowrap"
          >
            <Plus className="w-5 h-5 mr-2" /> Lançar Dados
          </Button>
        </div>
      </div>

      <Card className="border-border shadow-sm bg-card rounded-2xl overflow-hidden p-6 md:p-10 space-y-10">
        <div className="space-y-3">
          <div className="flex items-center gap-6">
            <div className="flex-1 h-8 bg-muted rounded-md overflow-hidden relative">
              <div
                className="h-full bg-[#12d3a3] transition-all duration-1000 ease-out"
                style={{ width: `${percSeguranca}%` }}
              />
            </div>
            <span className="text-4xl font-black text-foreground w-20 text-right">
              {percSeguranca}%
            </span>
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Das imagens cedidas foram destinadas a Forças de Segurança (Instituições + Operadores).
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pt-6">
          <div className="space-y-6">
            <h3 className="text-xl font-black text-center text-foreground">
              Perfil dos Solicitantes
              <br />
              <span className="text-sm text-muted-foreground font-semibold">
                ({customStart ? customStart.toLocaleDateString('pt-BR') : '...'} a{' '}
                {customEnd ? customEnd.toLocaleDateString('pt-BR') : '...'})
              </span>
            </h3>
            <ChartContainer config={chartConfig} className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 30, right: 10, left: 10, bottom: 60 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 13, fontWeight: 700, fill: 'currentColor' }}
                    tickLine={false}
                    axisLine={false}
                    angle={-45}
                    textAnchor="end"
                    dy={15}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fontWeight: 700, fill: 'currentColor' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                    content={<ChartTooltipContent className="bg-popover border-border" />}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} minPointSize={2}>
                    <LabelList
                      dataKey="value"
                      position="top"
                      style={{ fontSize: '14px', fontWeight: 'bold', fill: 'currentColor' }}
                    />
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          <div className="flex flex-col justify-center space-y-12 pl-0 lg:pl-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <MonitorPlay className="w-5 h-5 text-primary" />
                </div>
                <h4 className="text-lg font-bold text-foreground uppercase tracking-widest">
                  Total de Solicitações
                </h4>
              </div>
              <div className="text-6xl font-black text-primary pl-14">{total}</div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-[#12d3a3]/20 flex items-center justify-center">
                  <MonitorPlay className="w-5 h-5 text-[#12d3a3]" />
                </div>
                <h4 className="text-lg font-bold text-foreground uppercase tracking-widest">
                  Demandas Internas
                  <br />
                  <span className="text-sm text-muted-foreground font-semibold">(Operadores)</span>
                </h4>
              </div>
              <div className="text-6xl font-black text-foreground pl-14">{percOperadores}%</div>
            </div>
          </div>
        </div>

        <div className="pt-8 text-right border-t border-border mt-10">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted px-4 py-2 rounded-lg">
            Fonte: SMSP/DITM/DVVSE
          </span>
        </div>
      </Card>

      <VideoFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        initialDate={getYYYYMM(customStart || new Date())}
      />
    </div>
  )
}
