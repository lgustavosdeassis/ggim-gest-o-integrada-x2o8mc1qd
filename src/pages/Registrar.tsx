import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-form'
import { useToast } from '@/hooks/use-toast'
import useDataStore from '@/stores/main'
import { INSTANCES, EVENT_TYPES, DOCUMENT_CATEGORIES, ActivityRecord } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { calculateHoursDifference, parseSemicolonList } from '@/lib/utils'

export default function Registrar() {
  const { addRecord } = useDataStore()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form State
  const [formData, setFormData] = useState<Partial<ActivityRecord>>({
    instance: '',
    eventType: '',
    modality: 'Presencial',
    location: '',
    meetingStart: '',
    meetingEnd: '',
    hasAction: false,
    actionStart: '',
    actionEnd: '',
    participantsPF: '',
    participantsPJ: '',
    deliberations: '',
    documentCategories: [],
    documentDetails: '',
    files: [],
  })

  const handleChange = (field: keyof ActivityRecord, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleDocCatToggle = (cat: string) => {
    setFormData((prev) => {
      const cats = prev.documentCategories || []
      if (cats.includes(cat)) return { ...prev, documentCategories: cats.filter((c) => c !== cat) }
      return { ...prev, documentCategories: [...cats, cat] }
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((f) => f.name)
      setFormData((prev) => ({ ...prev, files: [...(prev.files || []), ...newFiles] }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Basic validation
    if (
      !formData.instance ||
      !formData.eventType ||
      !formData.meetingStart ||
      !formData.meetingEnd
    ) {
      toast({
        title: 'Erro de Validação',
        description: 'Preencha os campos obrigatórios.',
        variant: 'destructive',
      })
      setIsSubmitting(false)
      return
    }

    setTimeout(() => {
      const record: ActivityRecord = {
        ...formData,
        id: `reg-${Date.now()}`,
        createdAt: new Date().toISOString(),
      } as ActivityRecord

      addRecord(record)
      toast({ title: 'Sucesso!', description: 'Atividade registrada com sucesso no sistema GGIM.' })
      navigate('/historico')
    }, 600)
  }

  const meetingHours = calculateHoursDifference(
    formData.meetingStart || '',
    formData.meetingEnd || '',
  )
  const actionHours = formData.hasAction
    ? calculateHoursDifference(formData.actionStart || '', formData.actionEnd || '')
    : 0
  const pfCount = parseSemicolonList(formData.participantsPF || '').length
  const pjCount = parseSemicolonList(formData.participantsPJ || '').length

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Registrar Nova Atividade</h1>
        <p className="text-muted-foreground mt-1">
          Preencha os dados abaixo para compor os relatórios gerenciais.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1 */}
        <Card className="shadow-subtle">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="text-lg">1. Identificação</CardTitle>
            <CardDescription>Classificação primária do evento.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6 pt-6">
            <div className="space-y-2">
              <Label>
                Instância <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.instance} onValueChange={(v) => handleChange('instance', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a instância" />
                </SelectTrigger>
                <SelectContent>
                  {INSTANCES.map((i) => (
                    <SelectItem key={i} value={i}>
                      {i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>
                Tipo de Evento <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.eventType}
                onValueChange={(v) => handleChange('eventType', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((i) => (
                    <SelectItem key={i} value={i}>
                      {i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Modalidade</Label>
              <Select value={formData.modality} onValueChange={(v) => handleChange('modality', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Presencial">Presencial</SelectItem>
                  <SelectItem value="Remota">Remota</SelectItem>
                  <SelectItem value="Híbrida">Híbrida</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Local / Plataforma</Label>
              <Input
                placeholder="Ex: Paço Municipal"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Step 2 */}
        <Card className="shadow-subtle">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="text-lg">2. Cronologia</CardTitle>
            <CardDescription>
              Defina os horários para cálculo automático de dedicação.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid md:grid-cols-3 gap-6 items-end">
              <div className="space-y-2">
                <Label>
                  Início da Reunião <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="datetime-local"
                  value={formData.meetingStart}
                  onChange={(e) => handleChange('meetingStart', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Fim da Reunião <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="datetime-local"
                  value={formData.meetingEnd}
                  onChange={(e) => handleChange('meetingEnd', e.target.value)}
                />
              </div>
              <div className="bg-muted p-3 rounded-md flex justify-between items-center h-[42px]">
                <span className="text-sm font-medium">Duração:</span>
                <span className="font-mono">{meetingHours.toFixed(1)}h</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 border-t pt-6">
              <Switch
                id="hasAction"
                checked={formData.hasAction}
                onCheckedChange={(v) => handleChange('hasAction', v)}
              />
              <Label htmlFor="hasAction" className="font-semibold cursor-pointer">
                Houve Ação Vinculada em sequência?
              </Label>
            </div>

            {formData.hasAction && (
              <div className="grid md:grid-cols-3 gap-6 items-end p-4 bg-secondary/5 rounded-lg border border-secondary/20 animate-fade-in-up">
                <div className="space-y-2">
                  <Label>Início da Ação</Label>
                  <Input
                    type="datetime-local"
                    value={formData.actionStart}
                    onChange={(e) => handleChange('actionStart', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fim da Ação</Label>
                  <Input
                    type="datetime-local"
                    value={formData.actionEnd}
                    onChange={(e) => handleChange('actionEnd', e.target.value)}
                  />
                </div>
                <div className="bg-secondary/20 text-secondary-foreground p-3 rounded-md flex justify-between items-center h-[42px]">
                  <span className="text-sm font-medium">Ação:</span>
                  <span className="font-mono">{actionHours.toFixed(1)}h</span>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Carga Horária Total</p>
                <p className="text-2xl font-bold text-primary">
                  {(meetingHours + actionHours).toFixed(1)}h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 3 */}
        <Card className="shadow-subtle">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="text-lg">3. Participantes</CardTitle>
            <CardDescription>Separe os nomes por ponto e vírgula (;)</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6 pt-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Pessoas Físicas (Nomes)</Label>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {pfCount} detectados
                </span>
              </div>
              <Textarea
                placeholder="João Silva; Maria Souza;"
                className="min-h-[120px]"
                value={formData.participantsPF}
                onChange={(e) => handleChange('participantsPF', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Pessoas Jurídicas (Instituições)</Label>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {pjCount} detectados
                </span>
              </div>
              <Textarea
                placeholder="Polícia Militar; Guarda Municipal;"
                className="min-h-[120px]"
                value={formData.participantsPJ}
                onChange={(e) => handleChange('participantsPJ', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Step 4 */}
        <Card className="shadow-subtle">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="text-lg">4. Documentação e Evidências</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label>Principais Deliberações (separe por ;)</Label>
              <Textarea
                placeholder="Aprovado projeto X; Encaminhado para comissão Y;"
                value={formData.deliberations}
                onChange={(e) => handleChange('deliberations', e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Label>Categorização dos Documentos</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {DOCUMENT_CATEGORIES.map((cat) => (
                  <div key={cat} className="flex items-center space-x-2">
                    <Checkbox
                      id={`cat-${cat}`}
                      checked={(formData.documentCategories || []).includes(cat)}
                      onCheckedChange={() => handleDocCatToggle(cat)}
                    />
                    <label
                      htmlFor={`cat-${cat}`}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {cat}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Upload de Arquivos</Label>
                <Input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="cursor-pointer file:cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">
                  PDF, DOCX, JPG, PNG, MP3 permitidos.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Arquivos Anexados ({formData.files?.length || 0})</Label>
                <div className="bg-muted min-h-[40px] rounded-md p-2 text-sm max-h-[100px] overflow-y-auto">
                  {formData.files?.length ? (
                    formData.files.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 mb-1 last:mb-0">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
                        <span className="truncate">{f}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-muted-foreground italic">Nenhum arquivo</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/historico')}>
            Cancelar
          </Button>
          <Button type="submit" size="lg" disabled={isSubmitting} className="min-w-[150px]">
            {isSubmitting ? 'Salvando...' : 'Salvar Registro'}
          </Button>
        </div>
      </form>
    </div>
  )
}
