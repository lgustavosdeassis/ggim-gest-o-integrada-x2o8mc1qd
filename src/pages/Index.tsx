import { useState, useMemo } from 'react'
import { useAppStore } from '@/stores/main'
import { DashboardOverview } from '@/components/dashboard/DashboardOverview'
import { DashboardLogistics } from '@/components/dashboard/DashboardLogistics'
import { DashboardEngagement } from '@/components/dashboard/DashboardEngagement'
import { DashboardProductivity } from '@/components/dashboard/DashboardProductivity'
import { calculateDashboardStats } from '@/components/dashboard/StatsUtils'
import { Button } from '@/components/ui/button'
import { Printer, ChevronDown } from 'lucide-react'
import ggimLogo from '@/assets/logo-ggim-texto-preto-sem-fundo-a89c1.jpeg'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

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
  const activities = useAppStore((state) => state.activities)

  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')
  const [selectedInstances, setSelectedInstances] = useState<Set<string>>(new Set(INSTANCIAS))

  const toggleInstance = (instance: string) => {
    const next = new Set(selectedInstances)
    if (next.has(instance)) {
      next.delete(instance)
    } else {
      next.add(instance)
    }
    setSelectedInstances(next)
  }

  const toggleAllInstances = () => {
    if (selectedInstances.size === INSTANCIAS.length) {
      setSelectedInstances(new Set())
    } else {
      setSelectedInstances(new Set(INSTANCIAS))
    }
  }

  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      let valid = true
      if (!selectedInstances.has(act.instance)) valid = false
      if (dateStart && new Date(act.meetingStart) < new Date(dateStart)) valid = false
      if (dateEnd && new Date(act.meetingEnd) > new Date(dateEnd)) valid = false
      return valid
    })
  }, [activities, selectedInstances, dateStart, dateEnd])

  const stats = useMemo(() => calculateDashboardStats(filteredActivities), [filteredActivities])

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="hidden print:flex flex-col items-center justify-center mb-8 border-b pb-4">
        <img src={ggimLogo} alt="Logo GGIM" className="h-16 w-auto mb-4" />
        <h1 className="text-2xl font-bold">Relatório Gerencial - GGIM Foz do Iguaçu</h1>
        <p className="text-sm text-muted-foreground text-center mt-2 max-w-2xl">
          Período:{' '}
          {dateStart ? new Date(dateStart).toLocaleDateString('pt-BR') : 'Início do histórico'} até{' '}
          {dateEnd ? new Date(dateEnd).toLocaleDateString('pt-BR') : 'Data atual'}
          <br />
          Instâncias Selecionadas:{' '}
          {selectedInstances.size === INSTANCIAS.length
            ? 'Todas'
            : Array.from(selectedInstances).join(', ')}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard (BI)</h1>
          <p className="text-muted-foreground">Visão analítica das atividades do GGIM</p>
        </div>
        <Button onClick={handlePrint} className="gap-2">
          <Printer className="h-4 w-4" />
          GERAR RELATÓRIO
        </Button>
      </div>

      <Card className="print:hidden">
        <CardContent className="p-4 grid gap-4 grid-cols-1 md:grid-cols-3">
          <div className="flex flex-col gap-2">
            <Label>Instâncias (Múltipla Seleção)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between font-normal bg-background"
                  role="combobox"
                >
                  <span className="truncate">
                    {selectedInstances.size === INSTANCIAS.length
                      ? 'Todas as Instâncias'
                      : `${selectedInstances.size} selecionadas`}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <div className="p-2">
                  <div className="flex items-center space-x-2 px-2 py-2">
                    <Checkbox
                      id="select-all"
                      checked={selectedInstances.size === INSTANCIAS.length}
                      onCheckedChange={toggleAllInstances}
                    />
                    <label
                      htmlFor="select-all"
                      className="text-sm font-semibold leading-none cursor-pointer w-full"
                    >
                      Selecionar Todas
                    </label>
                  </div>
                  <Separator className="my-1" />
                  <ScrollArea className="h-48">
                    <div className="flex flex-col gap-1 p-1">
                      {INSTANCIAS.map((instance) => (
                        <div
                          key={instance}
                          className="flex items-center space-x-2 rounded hover:bg-accent px-2 py-1.5"
                        >
                          <Checkbox
                            id={instance}
                            checked={selectedInstances.has(instance)}
                            onCheckedChange={() => toggleInstance(instance)}
                          />
                          <label
                            htmlFor={instance}
                            className="text-sm leading-none cursor-pointer flex-1"
                          >
                            {instance}
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Data Inicial</Label>
            <Input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Data Final</Label>
            <Input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <DashboardOverview stats={stats} />
      <DashboardLogistics stats={stats} />
      <DashboardEngagement stats={stats} />
      <DashboardProductivity stats={stats} />
    </div>
  )
}
