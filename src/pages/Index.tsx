import { useMemo, useState } from 'react'
import { useAppStore } from '@/stores/main'
import { calculateDashboardStats } from '@/components/dashboard/StatsUtils'
import { DashboardOverview } from '@/components/dashboard/DashboardOverview'
import { DashboardEngagement } from '@/components/dashboard/DashboardEngagement'
import { DashboardLogistics } from '@/components/dashboard/DashboardLogistics'
import { DashboardProductivity } from '@/components/dashboard/DashboardProductivity'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { FileDown, Filter, X } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { GgimHexLogo } from '@/components/GgimHexLogo'

const INSTANCIAS = [
  'Colegiado Pleno',
  'Eventos Institucionais',
  'CMTEC-TRAN/PVT',
  'CMTEC-PVCM/CMDM',
  'CMTEC-PVCCA/RP',
  'CMTEC-PVC',
  'CMTEC-MA',
  'CMTEC-ETP',
  'CMTEC-AP/COMUD',
  'CMTEC-AIFU',
]

export default function Index() {
  const { activities } = useAppStore()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedInstances, setSelectedInstances] = useState<string[]>([])

  const filteredData = useMemo(() => {
    return activities.filter((a) => {
      let pass = true
      if (selectedInstances.length > 0 && !selectedInstances.includes(a.instance)) pass = false
      if (startDate && new Date(a.meetingStart) < new Date(startDate + 'T00:00:00')) pass = false
      if (endDate && new Date(a.meetingStart) > new Date(endDate + 'T23:59:59')) pass = false
      return pass
    })
  }, [activities, startDate, endDate, selectedInstances])

  const stats = useMemo(() => calculateDashboardStats(filteredData), [filteredData])

  const handlePrint = () => window.print()

  return (
    <div className="flex-1 space-y-8 max-w-[1600px] mx-auto min-h-[calc(100vh-80px)]">
      {/* Print Header */}
      <div className="hidden print:flex items-center gap-4 mb-8 border-b border-border pb-4">
        <div className="h-16 w-16 drop-shadow-sm flex items-center justify-center overflow-hidden">
          <GgimHexLogo className="w-full h-full object-contain" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Relatório Gerencial - GGIM Foz do Iguaçu
          </h1>
          <p className="text-sm text-foreground font-medium mt-1">
            Filtros:{' '}
            <span className="font-bold">
              {selectedInstances.length ? selectedInstances.join(', ') : 'Todas as Instâncias'}
            </span>{' '}
            | Período:{' '}
            <span className="font-bold">
              {startDate ? formatDateTime(startDate + 'T00:00:00').substring(0, 10) : 'Início'} a{' '}
              {endDate ? formatDateTime(endDate + 'T00:00:00').substring(0, 10) : 'Hoje'}
            </span>
          </p>
        </div>
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:items-end md:justify-between md:space-y-0 no-print">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-foreground mb-2">
            Painel Gerencial GGIM
          </h2>
          <p className="text-muted-foreground text-base font-medium">
            Acompanhamento consolidado de atividades, produtividade e engajamento em tempo real.
          </p>
        </div>
        <Button
          onClick={handlePrint}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg transition-all rounded-xl h-11 px-6"
        >
          <FileDown className="mr-2 h-5 w-5" />
          GERAR RELATÓRIO
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-2xl p-5 flex flex-col md:flex-row gap-5 items-end no-print shadow-sm">
        <div className="w-full md:w-1/3 space-y-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" /> Instâncias
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between text-left font-medium bg-background border-border hover:bg-muted h-11 rounded-xl text-foreground"
              >
                <span className="truncate">
                  {selectedInstances.length === 0
                    ? 'Todas as Instâncias'
                    : `${selectedInstances.length} instância(s) selecionada(s)`}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-72 max-h-80 overflow-y-auto border-border bg-popover shadow-2xl rounded-xl p-4"
              align="start"
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-3 p-1 rounded-md hover:bg-accent transition-colors">
                  <Checkbox
                    id="all-instances"
                    checked={selectedInstances.length === 0}
                    onCheckedChange={() => setSelectedInstances([])}
                  />
                  <Label
                    htmlFor="all-instances"
                    className="font-bold text-foreground cursor-pointer leading-none flex-1 py-1"
                  >
                    Todas as Instâncias
                  </Label>
                </div>
                <div className="h-px bg-border my-2" />
                {INSTANCIAS.map((i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-3 p-1 rounded-md hover:bg-accent transition-colors"
                  >
                    <Checkbox
                      id={`inst-${i}`}
                      checked={selectedInstances.includes(i)}
                      onCheckedChange={(checked) => {
                        if (checked) setSelectedInstances([...selectedInstances, i])
                        else setSelectedInstances(selectedInstances.filter((x) => x !== i))
                      }}
                    />
                    <Label
                      htmlFor={`inst-${i}`}
                      className="font-medium text-foreground cursor-pointer leading-none flex-1 py-1"
                    >
                      {i}
                    </Label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="w-full md:w-1/4 space-y-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Data Inicial
          </Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-background border-border h-11 rounded-xl text-foreground"
          />
        </div>
        <div className="w-full md:w-1/4 space-y-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Data Final
          </Label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-background border-border h-11 rounded-xl text-foreground"
          />
        </div>
        <div className="w-full md:w-auto pb-0.5">
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-10 px-4 rounded-xl font-medium"
            onClick={() => {
              setStartDate('')
              setEndDate('')
              setSelectedInstances([])
            }}
          >
            <X className="w-4 h-4 mr-2" /> Limpar Filtros
          </Button>
        </div>
      </div>

      <div className="space-y-8 pb-10">
        <DashboardOverview data={stats.overview} />
        <DashboardProductivity data={stats.productivity} />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <DashboardLogistics data={stats.logistics} />
          <DashboardEngagement data={stats.engagement} />
        </div>
      </div>
    </div>
  )
}
