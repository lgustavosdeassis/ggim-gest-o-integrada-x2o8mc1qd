import useDataStore from '@/stores/main'
import { INSTANCES } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { FileDown, Filter } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function DashboardFilters() {
  const { filters, setFilters } = useDataStore()

  const toggleInstance = (inst: string) => {
    const isSelected = filters.instances.includes(inst)
    setFilters({
      ...filters,
      instances: isSelected
        ? filters.instances.filter((i) => i !== inst)
        : [...filters.instances, inst],
    })
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 items-end md:items-center justify-between bg-card p-4 rounded-xl shadow-sm border mb-6 print-hidden">
      <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
        <div className="grid gap-1.5">
          <Label htmlFor="start" className="text-xs">
            Data Inicial
          </Label>
          <Input
            id="start"
            type="date"
            className="w-auto h-9"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="end" className="text-xs">
            Data Final
          </Label>
          <Input
            id="end"
            type="date"
            className="w-auto h-9"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          />
        </div>

        <div className="grid gap-1.5">
          <Label className="text-xs">Instâncias</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-9 w-[220px] justify-start text-left font-normal"
              >
                <Filter className="mr-2 h-4 w-4" />
                {filters.instances.length === 0
                  ? 'Todas as instâncias'
                  : `${filters.instances.length} selecionadas`}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-2" align="start">
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {INSTANCES.map((inst) => (
                  <div key={inst} className="flex items-center space-x-2">
                    <Checkbox
                      id={`filter-${inst}`}
                      checked={filters.instances.includes(inst)}
                      onCheckedChange={() => toggleInstance(inst)}
                    />
                    <label
                      htmlFor={`filter-${inst}`}
                      className="text-sm cursor-pointer leading-none"
                    >
                      {inst}
                    </label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {filters.instances.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilters({ ...filters, instances: [] })}
            className="h-9 mt-5"
          >
            Limpar
          </Button>
        )}
      </div>

      <Button onClick={handlePrint} className="w-full md:w-auto mt-2 md:mt-0 gap-2">
        <FileDown className="h-4 w-4" />
        GERAR RELATÓRIO
      </Button>
    </div>
  )
}
