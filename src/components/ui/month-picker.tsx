import * as React from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'
import { format, parse, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'

interface MonthPickerProps {
  value: string
  onChange: (value: string) => void
}

export function MonthPicker({ value, onChange }: MonthPickerProps) {
  const [displayDate, setDisplayDate] = React.useState<Date>(
    value ? parse(value, 'yyyy-MM', new Date()) : new Date(),
  )
  const [yearInput, setYearInput] = React.useState(displayDate.getFullYear().toString())
  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    if (value) {
      const parsed = parse(value, 'yyyy-MM', new Date())
      if (isValid(parsed)) {
        setDisplayDate(parsed)
        setYearInput(parsed.getFullYear().toString())
      }
    }
  }, [value])

  const months = [
    'jan',
    'fev',
    'mar',
    'abr',
    'mai',
    'jun',
    'jul',
    'ago',
    'set',
    'out',
    'nov',
    'dez',
  ]

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(displayDate.getFullYear(), monthIndex, 1)
    onChange(format(newDate, 'yyyy-MM'))
    setIsOpen(false)
  }

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setYearInput(e.target.value)
    const year = parseInt(e.target.value)
    if (!isNaN(year) && year >= 1000 && year <= 9999) {
      setDisplayDate(new Date(year, displayDate.getMonth(), 1))
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-between text-left font-normal h-11 rounded-xl bg-background border-border',
            !value && 'text-muted-foreground',
          )}
        >
          {value ? (
            format(parse(value, 'yyyy-MM', new Date()), "MMMM 'de' yyyy", { locale: ptBR })
          ) : (
            <span>Selecione um mês</span>
          )}
          <CalendarIcon className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[280px] p-3 bg-popover border-border shadow-md rounded-lg"
        align="start"
      >
        <div className="flex flex-col space-y-3">
          <div className="flex items-center bg-muted p-1.5 rounded-md">
            <input
              type="number"
              className="flex-1 bg-transparent text-foreground border-none text-center font-bold text-sm outline-none focus:ring-0 h-6 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ml-6"
              value={yearInput}
              onChange={handleYearChange}
            />
            <Select
              value={yearInput}
              onValueChange={(val) => {
                setYearInput(val)
                setDisplayDate(new Date(parseInt(val), displayDate.getMonth(), 1))
              }}
            >
              <SelectTrigger className="w-8 h-8 border-none bg-transparent shadow-none p-0 focus:ring-0 [&>span]:hidden flex justify-center items-center hover:bg-background/50 rounded-md text-foreground"></SelectTrigger>
              <SelectContent className="min-w-[100px] max-h-48" align="end">
                {Array.from({ length: 21 }).map((_, i) => {
                  const y = new Date().getFullYear() - 10 + i
                  return (
                    <SelectItem
                      key={y}
                      value={y.toString()}
                      className="cursor-pointer justify-center font-medium py-2"
                    >
                      {y}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {months.map((month, index) => {
              const isSelected =
                value &&
                parse(value, 'yyyy-MM', new Date()).getMonth() === index &&
                parse(value, 'yyyy-MM', new Date()).getFullYear() === displayDate.getFullYear()
              return (
                <Button
                  key={month}
                  variant={isSelected ? 'default' : 'ghost'}
                  className={cn(
                    'h-10 text-sm capitalize font-medium',
                    isSelected
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
                      : 'hover:bg-accent hover:text-accent-foreground',
                  )}
                  onClick={() => handleMonthSelect(index)}
                >
                  {month}
                </Button>
              )
            })}
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-border mt-1">
            <Button
              variant="ghost"
              className="text-sm font-medium text-primary px-3 h-8"
              onClick={() => {
                onChange('')
                setIsOpen(false)
              }}
            >
              Limpar
            </Button>
            <Button
              variant="ghost"
              className="text-sm font-medium text-primary px-3 h-8"
              onClick={() => {
                const now = new Date()
                setDisplayDate(now)
                setYearInput(now.getFullYear().toString())
                onChange(format(now, 'yyyy-MM'))
                setIsOpen(false)
              }}
            >
              Este mês
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
