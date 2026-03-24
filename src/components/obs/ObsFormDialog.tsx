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
  const { addRecord, records } = useObsStore()
  const [date, setDate] = useState(initialDate || '')
  const [isModified, setIsModified] = useState(false)

  const [vitimas, setVitimas] = useState<number | string>(0)
  const [total, setTotal] = useState<number | string>(0)
  const [autos, setAutos] = useState<number | string>(0)
  const [hom, setHom] = useState<number | string>(0)
  const [vio, setViol] = useState<number | string>(0)
  const [roubos, setRoubos] = useState<number | string>(0)

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
        setVitimas(existing.sinistrosVitimas)
        setTotal(existing.sinistrosTotal)
        setAutos(existing.autosInfracao)
        setHom(existing.homicidios)
        setViol(existing.violenciaDomestica)
        setRoubos(existing.roubos)
      } else {
        setVitimas(0)
        setTotal(0)
        setAutos(0)
        setHom(0)
        setViol(0)
        setRoubos(0)
      }
    }
  }, [date, records, open, isModified])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!date) return
    addRecord({
      date,
      sinistrosVitimas: Number(vitimas) || 0,
      sinistrosTotal: Number(total) || 0,
      autosInfracao: Number(autos) || 0,
      homicidios: Number(hom) || 0,
      violenciaDomestica: Number(vio) || 0,
      roubos: Number(roubos) || 0,
    })
    setIsModified(false)
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
            Lançar Dados - Observatório
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
                Sinistros c/ Vítimas
              </Label>
              <Input
                type="number"
                value={vitimas}
                onChange={(e) => handleNumChange(e.target.value, setVitimas)}
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
                onChange={(e) => handleNumChange(e.target.value, setTotal)}
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
                onChange={(e) => handleNumChange(e.target.value, setAutos)}
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
                onChange={(e) => handleNumChange(e.target.value, setHom)}
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
                onChange={(e) => handleNumChange(e.target.value, setViol)}
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
                onChange={(e) => handleNumChange(e.target.value, setRoubos)}
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
