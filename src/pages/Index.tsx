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
import { FileDown, Filter, X } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import logoGgim from '@/assets/logo-ggim-texto-preto-sem-fundo-4ad89.jpeg'
import { formatDateTime } from '@/lib/utils'

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
    <div className="flex-1 space-y-8 p-6 sm:p-8 pt-6 bg-background min-h-screen">
      {/* Print Header */}
      <div className="hidden print:flex items-center gap-4 mb-8 border-b border-gray-300 pb-4">
        <img src={logoGgim} alt="Logo GGIM" className="h-16 object-contain" />
        <div>
          <h1 className="text-2xl font-bold text-black">
            Relatório Gerencial - GGIM Foz do Iguaçu
          </h1>
          <p className="text-sm text-gray-800 font-medium mt-1">
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
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Painel Gerencial GGIM
          </h2>
          <p className="text-muted-foreground mt-1">
            Acompanhamento consolidado de atividades e engajamento.
          </p>
        </div>
        <Button
          onClick={handlePrint}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all"
        >
          <FileDown className="mr-2 h-4 w-4" />
          GERAR RELATÓRIO
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-card border rounded-lg p-4 flex flex-col md:flex-row gap-4 items-end no-print shadow-sm">
        <div className="w-full md:w-1/3 space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <Filter className="w-3 h-3" /> Instâncias
          </Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between text-left font-normal bg-background"
              >
                <span className="truncate">
                  {selectedInstances.length === 0
                    ? 'Todas as Instâncias'
                    : `${selectedInstances.length} selecionada(s)`}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 max-h-64 overflow-y-auto" align="start">
              {INSTANCIAS.map((i) => (
                <DropdownMenuCheckboxItem
                  key={i}
                  checked={selectedInstances.includes(i)}
                  onCheckedChange={(checked) => {
                    if (checked) setSelectedInstances([...selectedInstances, i])
                    else setSelectedInstances(selectedInstances.filter((x) => x !== i))
                  }}
                >
                  {i}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="w-full md:w-1/4 space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground">Data Inicial</Label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="w-full md:w-1/4 space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground">Data Final</Label>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <div className="w-full md:w-auto">
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => {
              setStartDate('')
              setEndDate('')
              setSelectedInstances([])
            }}
          >
            <X className="w-4 h-4 mr-1" /> Limpar
          </Button>
        </div>
      </div>

      <div className="space-y-10">
        <DashboardOverview data={stats.overview} />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
          <DashboardLogistics data={stats.logistics} />
          <DashboardProductivity data={stats.productivity} />
        </div>
        <DashboardEngagement data={stats.engagement} />
      </div>
    </div>
  )
}
