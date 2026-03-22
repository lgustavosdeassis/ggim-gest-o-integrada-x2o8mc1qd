import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useObsStore } from '@/stores/obs'
import { MonthPicker } from '@/components/ui/month-picker'

export function ObsFormDialog({
  open,
  onOpenChange,
  initialDate,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  initialDate: string
}) {
  const { addRecord } = useObsStore()
  const [date, setDate] = useState(initialDate || '')
  const [vitimas, setVitimas] = useState(0)
  const [total, setTotal] = useState(0)
  const [autos, setAutos] = useState(0)
  const [hom, setHom] = useState(0)
  const [vio, setViol] = useState(0)
  const [roubos, setRoubos] = useState(0)

  useEffect(() => {
    if (open && initialDate) {
      setDate(initialDate)
    }
  }, [open, initialDate])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!date) return
    addRecord({
      date,
      sinistrosVitimas: vitimas,
      sinistrosTotal: total,
      autosInfracao: autos,
      homicidios: hom,
      violenciaDomestica: vio,
      roubos,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl bg-card border-border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-foreground">
            Lançar Dados - Observatório
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-5 pt-2">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Mês de Referência
            </Label>
            <MonthPicker value={date} onChange={setDate} />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Sinistros c/ Vítimas
              </Label>
              <Input
                type="number"
                value={vitimas}
                onChange={(e) => setVitimas(Number(e.target.value))}
                required
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Sinistros Total
              </Label>
              <Input
                type="number"
                value={total}
                onChange={(e) => setTotal(Number(e.target.value))}
                required
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Autos de Infração
              </Label>
              <Input
                type="number"
                value={autos}
                onChange={(e) => setAutos(Number(e.target.value))}
                required
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Homicídios
              </Label>
              <Input
                type="number"
                value={hom}
                onChange={(e) => setHom(Number(e.target.value))}
                required
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Violência Doméstica
              </Label>
              <Input
                type="number"
                value={vio}
                onChange={(e) => setViol(Number(e.target.value))}
                required
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Roubos
              </Label>
              <Input
                type="number"
                value={roubos}
                onChange={(e) => setRoubos(Number(e.target.value))}
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
