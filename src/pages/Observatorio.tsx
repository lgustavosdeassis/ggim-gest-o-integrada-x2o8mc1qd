import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { useObsStore } from '@/stores/obs'
import { ObsFormDialog } from '@/components/obs/ObsFormDialog'

export default function Observatorio() {
  const { records } = useObsStore()
  const [filterMonth, setFilterMonth] = useState('2026-02')
  const [period, setPeriod] = useState('Mensal')
  const [customStart, setCustomStart] = useState('2026-01')
  const [customEnd, setCustomEnd] = useState('2026-12')
  const [isFormOpen, setIsFormOpen] = useState(false)

  const filteredRecords = records.filter((r) => {
    if (period === 'Personalizado') {
      if (customStart && customEnd) {
        return r.date >= customStart && r.date <= customEnd
      }
      return true
    }

    if (!filterMonth) return true
    const [year] = filterMonth.split('-')
    const [rYear, rMonth] = r.date.split('-')
    const rMonthNum = parseInt(rMonth, 10)

    if (period === 'Anual') return rYear === year
    if (period === '1º semestre') return rYear === year && rMonthNum <= 6
    if (period === '2º semestre') return rYear === year && rMonthNum >= 7
    if (period === '1º quadrimestre') return rYear === year && rMonthNum <= 4
    if (period === '2º quadrimestre') return rYear === year && rMonthNum >= 5 && rMonthNum <= 8
    if (period === '3º quadrimestre') return rYear === year && rMonthNum >= 9
    if (period === '1º trimestre') return rYear === year && rMonthNum <= 3
    if (period === '2º trimestre') return rYear === year && rMonthNum >= 4 && rMonthNum <= 6
    if (period === '3º trimestre') return rYear === year && rMonthNum >= 7 && rMonthNum <= 9
    if (period === '4º trimestre') return rYear === year && rMonthNum >= 10
    if (period === '1º bimestre') return rYear === year && rMonthNum <= 2
    if (period === '2º bimestre') return rYear === year && rMonthNum >= 3 && rMonthNum <= 4
    if (period === '3º bimestre') return rYear === year && rMonthNum >= 5 && rMonthNum <= 6
    if (period === '4º bimestre') return rYear === year && rMonthNum >= 7 && rMonthNum <= 8
    if (period === '5º bimestre') return rYear === year && rMonthNum >= 9 && rMonthNum <= 10
    if (period === '6º bimestre') return rYear === year && rMonthNum >= 11

    return r.date === filterMonth
  })

  const record = filteredRecords.reduce(
    (acc, curr) => ({
      sinistrosVitimas: acc.sinistrosVitimas + curr.sinistrosVitimas,
      sinistrosTotal: acc.sinistrosTotal + curr.sinistrosTotal,
      autosInfracao: acc.autosInfracao + curr.autosInfracao,
      homicidios: acc.homicidios + curr.homicidios,
      violenciaDomestica: acc.violenciaDomestica + curr.violenciaDomestica,
      roubos: acc.roubos + curr.roubos,
    }),
    {
      sinistrosVitimas: 0,
      sinistrosTotal: 0,
      autosInfracao: 0,
      homicidios: 0,
      violenciaDomestica: 0,
      roubos: 0,
    },
  )

  const chartData = [
    { name: 'Sinistros c/ Vítimas', value: record.sinistrosVitimas, fill: '#67e8f9' },
    { name: 'Sinistros Total', value: record.sinistrosTotal, fill: '#93c5fd' },
  ]

  const chartConfig = {
    value: { label: 'Ocorrências' },
  }

  return (
    <div className="flex-1 space-y-8 max-w-[1200px] mx-auto min-h-[calc(100vh-80px)] animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground uppercase mb-2">
            Observatório Municipal de Segurança Pública
          </h1>
        </div>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full xl:w-auto mt-4 xl:mt-0">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-full md:w-48 h-12 rounded-xl bg-background border-border text-foreground font-bold">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Mensal">Mensal</SelectItem>
              <SelectGroup>
                <SelectLabel className="text-xs uppercase text-muted-foreground">
                  Bimestre
                </SelectLabel>
                <SelectItem value="1º bimestre">1º Bimestre</SelectItem>
                <SelectItem value="2º bimestre">2º Bimestre</SelectItem>
                <SelectItem value="3º bimestre">3º Bimestre</SelectItem>
                <SelectItem value="4º bimestre">4º Bimestre</SelectItem>
                <SelectItem value="5º bimestre">5º Bimestre</SelectItem>
                <SelectItem value="6º bimestre">6º Bimestre</SelectItem>
              </SelectGroup>
              <SelectGroup>
                <SelectLabel className="text-xs uppercase text-muted-foreground">
                  Trimestre
                </SelectLabel>
                <SelectItem value="1º trimestre">1º Trimestre</SelectItem>
                <SelectItem value="2º trimestre">2º Trimestre</SelectItem>
                <SelectItem value="3º trimestre">3º Trimestre</SelectItem>
                <SelectItem value="4º trimestre">4º Trimestre</SelectItem>
              </SelectGroup>
              <SelectGroup>
                <SelectLabel className="text-xs uppercase text-muted-foreground">
                  Quadrimestre
                </SelectLabel>
                <SelectItem value="1º quadrimestre">1º Quadrimestre</SelectItem>
                <SelectItem value="2º quadrimestre">2º Quadrimestre</SelectItem>
                <SelectItem value="3º quadrimestre">3º Quadrimestre</SelectItem>
              </SelectGroup>
              <SelectGroup>
                <SelectLabel className="text-xs uppercase text-muted-foreground">
                  Semestre
                </SelectLabel>
                <SelectItem value="1º semestre">1º Semestre</SelectItem>
                <SelectItem value="2º semestre">2º Semestre</SelectItem>
              </SelectGroup>
              <SelectGroup>
                <SelectLabel className="text-xs uppercase text-muted-foreground">Anual</SelectLabel>
                <SelectItem value="Anual">Anual</SelectItem>
              </SelectGroup>
              <SelectItem
                value="Personalizado"
                className="data-[state=checked]:bg-[#eab308] data-[state=checked]:text-[#0f172a] focus:bg-[#eab308]/80 focus:text-[#0f172a] font-bold mt-1"
              >
                Personalizado
              </SelectItem>
            </SelectContent>
          </Select>

          {period === 'Personalizado' ? (
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto mt-1 md:mt-0">
              <div className="relative flex-1 md:flex-none">
                <span className="absolute -top-2.5 left-3 bg-background px-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Data Inicial
                </span>
                <Input
                  type="month"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full md:w-36 bg-background border-border h-12 rounded-xl text-foreground font-bold"
                />
              </div>
              <div className="relative flex-1 md:flex-none">
                <span className="absolute -top-2.5 left-3 bg-background px-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Data Final
                </span>
                <Input
                  type="month"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full md:w-36 bg-background border-border h-12 rounded-xl text-foreground font-bold"
                />
              </div>
            </div>
          ) : (
            <Input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full md:w-48 bg-background border-border h-12 rounded-xl text-foreground font-bold"
            />
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-4">
            <h3 className="text-xl font-black text-center text-foreground uppercase tracking-widest">
              Estatísticas de Trânsito
              <br />
              <span className="text-sm text-muted-foreground font-semibold normal-case tracking-normal">
                (
                {period === 'Personalizado'
                  ? `${customStart.split('-').reverse().join('/')} a ${customEnd.split('-').reverse().join('/')}`
                  : period === 'Mensal'
                    ? filterMonth
                      ? filterMonth.split('-').reverse().join('/')
                      : 'Período'
                    : period === 'Anual'
                      ? filterMonth.split('-')[0]
                      : `${period} de ${filterMonth.split('-')[0]}`}
                )
              </span>
            </h3>
            <ChartContainer config={chartConfig} className="h-[320px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 30, right: 20, left: 20, bottom: 30 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 13, fontWeight: 700, fill: 'currentColor' }}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                    content={<ChartTooltipContent className="bg-popover border-border" />}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={120} minPointSize={2}>
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

          <div className="flex flex-col h-full">
            <div className="flex-1 bg-[#0f172a] rounded-t-xl flex items-center justify-center p-10 relative overflow-hidden group min-h-[200px]">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-7xl lg:text-8xl font-black text-white relative z-10 tracking-tighter">
                {record.autosInfracao.toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="bg-[#eab308] text-[#0f172a] rounded-b-xl py-4 text-center">
              <h3 className="text-2xl font-black uppercase tracking-widest">Autos de Infração</h3>
            </div>
            <div className="mt-3 text-right">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Fonte: DETRAN-PR
              </span>
            </div>
          </div>
        </div>

        <div className="pt-6">
          <div className="flex flex-col sm:flex-row shadow-lg border border-border rounded-xl overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-border">
            <div className="flex-1 bg-white p-6 flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left hover:bg-slate-50 transition-colors">
              <span className="text-5xl lg:text-6xl font-black text-primary">
                {record.homicidios}
              </span>
              <span className="text-xl font-black uppercase text-[#eab308] leading-none">
                Homicídios
              </span>
            </div>
            <div className="flex-1 bg-[#0f172a] p-6 flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left hover:bg-[#1e293b] transition-colors">
              <span className="text-5xl lg:text-6xl font-black text-white">
                {record.violenciaDomestica}
              </span>
              <span className="text-xl font-black uppercase text-white leading-none">
                Violência
                <br />
                Doméstica
              </span>
            </div>
            <div className="flex-1 bg-white p-6 flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left hover:bg-slate-50 transition-colors">
              <span className="text-5xl lg:text-6xl font-black text-primary">{record.roubos}</span>
              <span className="text-xl font-black uppercase text-[#eab308] leading-none">
                Roubos
              </span>
            </div>
          </div>
          <div className="mt-3 text-right">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Fonte: CAPE/SESP-PR
            </span>
          </div>
        </div>
      </Card>

      <ObsFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} initialDate={filterMonth} />
    </div>
  )
}
