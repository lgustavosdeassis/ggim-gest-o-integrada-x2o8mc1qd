import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useVideoStore } from '@/stores/video'

export function VideoFormDialog({
  open,
  onOpenChange,
  initialDate,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  initialDate: string
}) {
  const { addRecord } = useVideoStore()
  const [date, setDate] = useState(initialDate || '')
  const [part, setPart] = useState(0)
  const [inst, setInst] = useState(0)
  const [imp, setImp] = useState(0)
  const [op, setOp] = useState(0)

  useEffect(() => {
    if (open && initialDate) {
      setDate(initialDate)
    }
  }, [open, initialDate])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!date) return
    addRecord({ date, particulares: part, instituicoes: inst, imprensa: imp, operadores: op })
    onOpenChange(false)
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
            <Input
              type="month"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="h-11 rounded-xl"
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
                onChange={(e) => setPart(Number(e.target.value))}
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
                onChange={(e) => setInst(Number(e.target.value))}
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
                onChange={(e) => setImp(Number(e.target.value))}
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
                onChange={(e) => setOp(Number(e.target.value))}
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
