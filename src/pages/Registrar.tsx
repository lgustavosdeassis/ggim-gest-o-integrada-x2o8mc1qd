import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAppStore } from '@/stores/main'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent } from '@/components/ui/card'
import { Trash } from 'lucide-react'
import { calculateHoursDifference } from '@/lib/utils'

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
const EVENTOS_TIPO = [
  'Reunião Ordinária',
  'Reunião Extraordinária',
  'Reunião Institucional',
  'Treinamento',
  'Curso',
  'Congresso',
  'Colóquio',
  'Fórum',
  'Webinário',
  'Palestra',
  'Apresentação',
  'Networking',
  'Convenção',
  'Conferência',
  'Confraternização',
  'Projeto',
  'Programa',
  'Feira',
  'Exposição',
  'Mesa redonda',
  'Painel',
  'Workshop',
  'Oficina',
  'Roadshow',
  'Campanha',
  'Blitz',
  'Operação',
  'Visita técnica',
]
const DOC_CATEGORIES = [
  'Ofício',
  'Ata',
  'Relatório',
  'Transcrição',
  'E-mail',
  'SID',
  'Fotos',
  'Áudio',
  'Outros',
]

const formSchema = z.object({
  instance: z.string().min(1, 'Selecione uma instância'),
  eventType: z.string().min(1, 'Selecione o tipo'),
  modality: z.string().min(1, 'Selecione a modalidade'),
  location: z.string().min(1, 'Local é obrigatório'),
  meetingStart: z.string().min(1, 'Obrigatório'),
  meetingEnd: z.string().min(1, 'Obrigatório'),
  actions: z
    .array(
      z.object({
        id: z.string().optional(),
        start: z.string().min(1, 'Início é obrigatório'),
        end: z.string().min(1, 'Término é obrigatório'),
      }),
    )
    .default([]),
  participantsPF: z.string().optional(),
  participantsPJ: z.string().optional(),
  deliberations: z.string().optional(),
  description: z.string().optional(),
  documents: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1, 'Obrigatório'),
        categories: z.array(z.string()).default([]),
      }),
    )
    .optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function Registrar() {
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')
  const navigate = useNavigate()
  const { toast } = useToast()
  const { activities, addActivity, updateActivity } = useAppStore()
  const [mockFile, setMockFile] = useState<File | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      instance: '',
      eventType: '',
      modality: '',
      location: '',
      meetingStart: '',
      meetingEnd: '',
      actions: [],
      participantsPF: '',
      participantsPJ: '',
      deliberations: '',
      documents: [],
    },
  })

  const {
    fields: docsFields,
    append: appendDoc,
    remove: removeDoc,
  } = useFieldArray({ control: form.control, name: 'documents' })

  const {
    fields: actionsFields,
    append: appendAction,
    remove: removeAction,
  } = useFieldArray({ control: form.control, name: 'actions' })

  useEffect(() => {
    if (editId) {
      const activity = activities.find((a) => a.id === editId)
      if (activity) {
        let initialActions = activity.actions || []
        if (
          initialActions.length === 0 &&
          activity.hasAction &&
          activity.actionStart &&
          activity.actionEnd
        ) {
          initialActions = [
            { id: Math.random().toString(), start: activity.actionStart, end: activity.actionEnd },
          ]
        }
        form.reset({ ...activity, actions: initialActions })
      }
    }
  }, [editId, activities, form])

  const onSubmit = (data: FormValues) => {
    const payload = {
      ...data,
      hasAction: data.actions && data.actions.length > 0,
      actions: (data.actions || []).map((act) => ({
        ...act,
        id: act.id || Math.random().toString(36).substr(2, 9),
      })),
      documents: (data.documents || []).map((doc) => ({
        ...doc,
        id: doc.id || Math.random().toString(36).substr(2, 9),
      })),
    } as any

    if (editId) {
      updateActivity(editId, payload)
      toast({ title: 'Atividade atualizada.' })
    } else {
      addActivity(payload)
      toast({ title: 'Atividade registrada.' })
    }
    navigate('/historico')
  }

  const wMeetingStart = form.watch('meetingStart')
  const wMeetingEnd = form.watch('meetingEnd')
  const wActions = form.watch('actions') || []
  const tMeeting = calculateHoursDifference(wMeetingStart, wMeetingEnd)
  const tAction = wActions.reduce((acc, a) => acc + calculateHoursDifference(a.start, a.end), 0)

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {editId ? 'Editar Atividade' : 'Registrar Atividade'}
        </h1>
        <p className="text-muted-foreground">Preencha as informações detalhadas da atividade.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="instance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instância</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {INSTANCIAS.map((i) => (
                          <SelectItem key={i} value={i}>
                            {i}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="eventType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Evento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EVENTOS_TIPO.map((i) => (
                          <SelectItem key={i} value={i}>
                            {i}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="modality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modalidade</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Presencial">Presencial</SelectItem>
                        <SelectItem value="Remota">Remota</SelectItem>
                        <SelectItem value="Híbrida">Híbrida</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local</FormLabel>
                    <FormControl>
                      <Input placeholder="Onde ocorreu?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 grid grid-cols-1 gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Tempos e Duração</h3>
                <div className="text-sm font-semibold bg-primary/10 text-primary px-3 py-1 rounded-md uppercase tracking-wider">
                  Total Dedicado: {(tMeeting + tAction).toFixed(1)}h
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="meetingStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Início da Reunião</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="meetingEnd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Término da Reunião</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mt-4 border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-medium text-slate-700">Ações Vinculadas</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendAction({ start: '', end: '' })}
                  >
                    + Adicionar Ação
                  </Button>
                </div>

                {actionsFields.map((field, index) => {
                  const start = form.watch(`actions.${index}.start`)
                  const end = form.watch(`actions.${index}.end`)
                  const duration = calculateHoursDifference(start, end)
                  return (
                    <div
                      key={field.id}
                      className="p-4 border rounded-lg bg-slate-50 space-y-4 mb-4 relative"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                        onClick={() => removeAction(index)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mr-8">
                        <FormField
                          control={form.control}
                          name={`actions.${index}.start`}
                          render={({ field: startField }) => (
                            <FormItem>
                              <FormLabel>Início da Ação Vinculada</FormLabel>
                              <FormControl>
                                <Input type="datetime-local" {...startField} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`actions.${index}.end`}
                          render={({ field: endField }) => (
                            <FormItem>
                              <FormLabel>Término da Ação Vinculada</FormLabel>
                              <FormControl>
                                <Input type="datetime-local" {...endField} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      {duration > 0 && (
                        <p className="text-xs text-muted-foreground text-right mr-8 font-medium">
                          Duração da Ação: {duration.toFixed(1)}h
                        </p>
                      )}
                    </div>
                  )
                })}
                {actionsFields.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4 bg-slate-50 rounded-lg border border-dashed">
                    Nenhuma ação vinculada registrada.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-lg font-semibold">Engajamento</h3>
              <FormField
                control={form.control}
                name="participantsPF"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pessoas Físicas (separadas por ponto e vírgula)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ex: João Silva; Maria Oliveira" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="participantsPJ"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pessoas Jurídicas (separadas por ponto e vírgula)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ex: Prefeitura; Polícia Militar" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Documentos e Deliberações</h3>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    className="w-[200px]"
                    onChange={(e) => setMockFile(e.target.files?.[0] || null)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (mockFile) {
                        appendDoc({ name: mockFile.name, categories: [] })
                        setMockFile(null)
                      } else appendDoc({ name: 'Novo Documento', categories: [] })
                    }}
                  >
                    Add Doc
                  </Button>
                </div>
              </div>

              {docsFields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg bg-slate-50 space-y-4">
                  <div className="flex items-start gap-4">
                    <FormField
                      control={form.control}
                      name={`documents.${index}.name`}
                      render={({ field: nameField }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Arquivo</FormLabel>
                          <FormControl>
                            <Input {...nameField} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      className="mt-8 text-red-500"
                      onClick={() => removeDoc(index)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                  <FormField
                    control={form.control}
                    name={`documents.${index}.categories`}
                    render={({ field: catField }) => (
                      <FormItem>
                        <FormLabel>Categorias</FormLabel>
                        <div className="flex flex-wrap gap-4">
                          {DOC_CATEGORIES.map((cat) => (
                            <label key={cat} className="flex items-center gap-2 text-sm">
                              <Checkbox
                                checked={catField.value?.includes(cat)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    catField.onChange([...(catField.value || []), cat])
                                  } else {
                                    catField.onChange(
                                      (catField.value || []).filter((v: string) => v !== cat),
                                    )
                                  }
                                }}
                              />{' '}
                              {cat}
                            </label>
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              ))}

              <FormField
                control={form.control}
                name="deliberations"
                render={({ field }) => (
                  <FormItem className="pt-4 border-t">
                    <FormLabel>Deliberações (separadas por ponto e vírgula)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ex: Aprovada pauta 1; Marcada nova data" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => navigate('/historico')}>
              Cancelar
            </Button>
            <Button type="submit">{editId ? 'Salvar Alterações' : 'Salvar Atividade'}</Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
