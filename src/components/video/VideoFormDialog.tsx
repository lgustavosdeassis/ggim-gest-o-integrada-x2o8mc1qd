import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useVideoStore } from '@/stores/video'
import { MonthPicker } from '@/components/ui/month-picker'

export function VideoFormDialog({
  open,
  onOpenChange,
  initialDate,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  initialDate: string
}) {
  const { addRecord, records } = useVideoStore()
  const [date, setDate] = useState(initialDate || '')
  const [isModified, setIsModified] = useState(false)

  const [part, setPart] = useState<number | string>(0)
  const [inst, setInst] = useState<number | string>(0)
  const [imp, setImp] = useState<number | string>(0)
  const [op, setOp] = useState<number | string>(0)

  useEffect(() => {
    if (open && initialDate) {
      setDate(initialDate)
      setIsModified(false)
    }
  }, [open, initialDate])

  useEffect(() => {
    if (open && date && !isModified) {
      const existing = records.find((r) => r.date === date)
      if (existing) {
        setPart(existing.particulares)
        setInst(existing.instituicoes)
        setImp(existing.imprensa)
        setOp(existing.operadores)
      } else {
        setPart(0)
        setInst(0)
        setImp(0)
        setOp(0)
      }
    }
  }, [date, records, open, isModified])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!date) return
    addRecord({
      date,
      particulares: Number(part) || 0,
      instituicoes: Number(inst) || 0,
      imprensa: Number(imp) || 0,
      operadores: Number(op) || 0,
    })
    onOpenChange(false)
  }

  const handleNumChange = (val: string, setter: (v: number | string) => void) => {
    setter(val === '' ? '' : Number(val))
    setIsModified(true)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl bg-card border-border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-foreground">
            Lançar Dados - Videomonitoramento
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-5 pt-2">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Mês de Referência
            </Label>
            <MonthPicker
              value={date}
              onChange={(newDate) => {
                setDate(newDate)
                setIsModified(false)
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Particulares
              </Label>
              <Input
                type="number"
                value={part}
                onChange={(e) => handleNumChange(e.target.value, setPart)}
                min={0}
                required
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Instituições
              </Label>
              <Input
                type="number"
                value={inst}
                onChange={(e) => handleNumChange(e.target.value, setInst)}
                min={0}
                required
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Imprensa
              </Label>
              <Input
                type="number"
                value={imp}
                onChange={(e) => handleNumChange(e.target.value, setImp)}
                min={0}
                required
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Operadores
              </Label>
              <Input
                type="number"
                value={op}
                onChange={(e) => handleNumChange(e.target.value, setOp)}
                min={0}
                required
                className="h-11 rounded-xl"
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full h-12 font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Salvar Registro
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
