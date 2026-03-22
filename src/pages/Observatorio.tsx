import { useState } from 'react'
import { ShieldAlert, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { useObsStore } from '@/stores/obs'
import { ObsFormDialog } from '@/components/obs/ObsFormDialog'

export default function Observatorio() {
  const { records } = useObsStore()
  const [filterMonth, setFilterMonth] = useState('2026-02')
  const [isFormOpen, setIsFormOpen] = useState(false)

  const record = records.find((r) => r.date === filterMonth) || {
    sinistrosVitimas: 0,
    sinistrosTotal: 0,
    autosInfracao: 0,
    homicidios: 0,
    violenciaDomestica: 0,
    roubos: 0,
  }

  const chartData = [
    { name: 'Sinistros c/ Vítimas', value: record.sinistrosVitimas, fill: '#67e8f9' }, // light cyan
    { name: 'Sinistros Total', value: record.sinistrosTotal, fill: '#93c5fd' }, // light blue
  ]

  const chartConfig = {
    value: { label: 'Ocorrências' },
  }

  return (
    <div className="flex-1 space-y-8 max-w-[1200px] mx-auto min-h-[calc(100vh-80px)] animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground uppercase mb-2">
            Observatório Municipal de Segurança Pública
          </h1>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="w-full md:w-48 bg-background border-border h-12 rounded-xl text-foreground font-bold"
          />
          <Button
            onClick={() => setIsFormOpen(true)}
            className="h-12 px-6 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md whitespace-nowrap"
          >
            <Plus className="w-5 h-5 mr-2" /> Lançar Dados
          </Button>
        </div>
      </div>

      <Card className="border-border shadow-sm bg-card rounded-2xl overflow-hidden p-6 md:p-10 space-y-10">
        <p className="text-muted-foreground leading-relaxed text-base font-bold max-w-4xl">
          Monitoramento estratégico dos principais indicadores criminais e de trânsito referentes ao
          mês de {filterMonth ? filterMonth.split('-').reverse().join('/') : 'selecionado'},
          subsidiando as ações do GGIM.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-4">
            <h3 className="text-xl font-black text-center text-foreground uppercase tracking-widest">
              Estatísticas de Trânsito
            </h3>
            <ChartContainer config={chartConfig} className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 30, right: 20, left: 20, bottom: 20 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 13, fontWeight: 700, fill: 'currentColor' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                    content={<ChartTooltipContent className="bg-popover border-border" />}
                  />
                  <Bar dataKey="value" radius={[0, 0, 0, 0]} maxBarSize={120}>
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
            <div className="flex-1 bg-[#0f172a] rounded-t-xl flex items-center justify-center p-10 relative overflow-hidden group">
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
