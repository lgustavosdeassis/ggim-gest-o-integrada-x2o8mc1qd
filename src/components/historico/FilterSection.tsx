import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarUI } from '@/components/ui/calendar'
import { Search, Calendar as CalendarIcon, X, Filter } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export interface FilterSectionProps {
  searchTerm: string
  setSearchTerm: (v: string) => void
  startDate: Date | undefined
  setStartDate: (d: Date | undefined) => void
  endDate: Date | undefined
  setEndDate: (d: Date | undefined) => void
}

export function FilterSection({
  searchTerm,
  setSearchTerm,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}: FilterSectionProps) {
  return (
    <div className="bg-slate-50 p-5 rounded-2xl border-2 border-[#0f172a] shadow-sm flex flex-col md:flex-row gap-4 items-end transition-all">
      <div className="w-full md:w-2/5">
        <label className="text-[11px] font-black text-[#0f172a] uppercase tracking-widest mb-2 flex items-center gap-2">
          <Filter className="w-3.5 h-3.5" />
          Identificação / Busca
        </label>
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#0f172a]/50" />
          <Input
            type="search"
            placeholder="Pesquisar instância, tipologia, local ou nome do evento..."
            className="pl-10 border-[#0f172a]/20 bg-white h-11 text-[#0f172a] focus-visible:ring-[#eab308] focus-visible:border-[#eab308]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="w-full md:w-2/5 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="text-[11px] font-black text-[#0f172a] uppercase tracking-widest mb-2 block">
            Data Inicial
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-semibold border-[#0f172a]/20 bg-white h-11 focus-visible:ring-[#eab308]',
                  !startDate && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-[#0f172a]/60" />
                {startDate ? format(startDate, 'dd/MM/yyyy') : <span>Selecionar</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-[#0f172a]/20" align="start">
              <CalendarUI mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex-1">
          <label className="text-[11px] font-black text-[#0f172a] uppercase tracking-widest mb-2 block">
            Data Final
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-semibold border-[#0f172a]/20 bg-white h-11 focus-visible:ring-[#eab308]',
                  !endDate && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-[#0f172a]/60" />
                {endDate ? format(endDate, 'dd/MM/yyyy') : <span>Selecionar</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-[#0f172a]/20" align="start">
              <CalendarUI
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                disabled={(date) => (startDate ? date < startDate : false)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex gap-2 w-full md:w-auto">
        <Button
          onClick={() => {
            setSearchTerm('')
            setStartDate(undefined)
            setEndDate(undefined)
          }}
          className="h-11 px-6 bg-[#eab308] hover:bg-[#ca8a04] text-[#0f172a] font-black w-full shadow-sm"
        >
          <X className="h-4 w-4 mr-2" /> Limpar Filtros
        </Button>
      </div>
    </div>
  )
}
