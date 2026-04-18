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
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date) return
    setIsSubmitting(true)
    try {
      await addRecord({
        date,
        particulares: Number(part) || 0,
        instituicoes: Number(inst) || 0,
        imprensa: Number(imp) || 0,
        operadores: Number(op) || 0,
      })
      setIsModified(false)
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
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
            disabled={isSubmitting}
            className="w-full h-12 font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-current"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Salvando...
              </>
            ) : (
              'Salvar Registro'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
