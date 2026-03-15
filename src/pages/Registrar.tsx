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
import { Trash, FileUp } from 'lucide-react'
import { calculateHoursDifference, parseSemicolonList } from '@/lib/utils'

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
  instance: z.string().min(1, 'Obrigatório'),
  eventType: z.string().min(1, 'Obrigatório'),
  modality: z.string().min(1, 'Obrigatório'),
  location: z.string().min(1, 'Obrigatório'),
  meetingStart: z.string().min(1, 'Obrigatório'),
  meetingEnd: z.string().min(1, 'Obrigatório'),
  actions: z
    .array(
      z.object({
        id: z.string().optional(),
        start: z.string().min(1, 'Obrigatório'),
        end: z.string().min(1, 'Obrigatório'),
      }),
    )
    .default([]),
  participantsPF: z.string().optional(),
  participantsPJ: z.string().optional(),
  deliberations: z.string().optional(),
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
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {editId ? 'Editar Atividade' : 'Registrar Atividade'}
        </h1>
        <p className="text-muted-foreground">
          Preencha as informações detalhadas da atividade com cálculos automáticos.
        </p>
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
                    <FormLabel>Local do Evento</FormLabel>
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
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Logística e Duração</h3>
                <div className="text-sm font-bold bg-primary/20 text-primary px-3 py-1 rounded-md uppercase">
                  TOTAL DE HORAS DEDICADAS: {(tMeeting + tAction).toFixed(1)}h
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-lg mb-4">
                <div className="col-span-1 md:col-span-2 flex justify-between">
                  <h4 className="font-medium text-sm">Tempo de Reunião</h4>
                  <span className="text-xs text-muted-foreground font-medium">
                    Duração: {tMeeting.toFixed(1)}h
                  </span>
                </div>
                <FormField
                  control={form.control}
                  name="meetingStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Início</FormLabel>
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
                      <FormLabel>Término</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-sm">Ações Vinculadas Geradas</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendAction({ start: '', end: '' })}
                  >
                    + Nova Ação
                  </Button>
                </div>
                {actionsFields.map((field, index) => {
                  const duration = calculateHoursDifference(
                    form.watch(`actions.${index}.start`),
                    form.watch(`actions.${index}.end`),
                  )
                  return (
                    <div key={field.id} className="p-4 border rounded-lg bg-muted/20 relative mb-4">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 text-red-500 h-8 w-8"
                        onClick={() => removeAction(index)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                      <div className="col-span-1 md:col-span-2 flex justify-between mr-10 mb-2">
                        <h5 className="font-medium text-xs">Ação {index + 1}</h5>
                        <span className="text-xs text-muted-foreground font-medium">
                          Duração: {duration.toFixed(1)}h
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mr-8">
                        <FormField
                          control={form.control}
                          name={`actions.${index}.start`}
                          render={({ field: startField }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Início da Ação</FormLabel>
                              <FormControl>
                                <Input type="datetime-local" {...startField} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`actions.${index}.end`}
                          render={({ field: endField }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Término da Ação</FormLabel>
                              <FormControl>
                                <Input type="datetime-local" {...endField} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-6">
              <h3 className="text-lg font-semibold">Engajamento</h3>
              <FormField
                control={form.control}
                name="participantsPF"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-end">
                      <FormLabel>
                        Nomes dos Participantes - PF (separados por ponto e vírgula)
                      </FormLabel>
                      <span className="text-xs font-semibold bg-secondary px-2 py-0.5 rounded text-secondary-foreground">
                        Total: {parseSemicolonList(field.value || '').length}
                      </span>
                    </div>
                    <FormControl>
                      <Textarea
                        className="min-h-[100px]"
                        placeholder="Ex: João Silva; Maria Oliveira"
                        {...field}
                      />
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
                    <div className="flex justify-between items-end">
                      <FormLabel>
                        Nomes das Instituições - PJ (separadas por ponto e vírgula)
                      </FormLabel>
                      <span className="text-xs font-semibold bg-secondary px-2 py-0.5 rounded text-secondary-foreground">
                        Total: {parseSemicolonList(field.value || '').length}
                      </span>
                    </div>
                    <FormControl>
                      <Textarea
                        className="min-h-[80px]"
                        placeholder="Ex: Prefeitura Municipal; Corpo de Bombeiros"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-6">
              <h3 className="text-lg font-semibold">Produtividade e Documentos</h3>
              <FormField
                control={form.control}
                name="deliberations"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-end">
                      <FormLabel>
                        Descritivo das Deliberações (separadas por ponto e vírgula)
                      </FormLabel>
                      <span className="text-xs font-semibold bg-secondary px-2 py-0.5 rounded text-secondary-foreground">
                        Total: {parseSemicolonList(field.value || '').length}
                      </span>
                    </div>
                    <FormControl>
                      <Textarea
                        className="min-h-[100px]"
                        placeholder="Ex: Aprovada pauta principal; Definida data da próxima reunião"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="border-t pt-6 space-y-4">
                <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg border border-dashed">
                  <div>
                    <h4 className="font-medium">Arquivos Anexos</h4>
                    <p className="text-xs text-muted-foreground">
                      Adicione PDFs, DOCX, TXT, Imagens ou Áudios.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-semibold bg-chart-5/20 text-chart-5 px-3 py-1 rounded-md">
                      Total Geral de Documentos: {docsFields.length}
                    </div>
                    <Input
                      type="file"
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.docx,.txt,.jpg,.png,.jpeg,.mp3,.wav"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          appendDoc({ name: file.name, categories: [] })
                          e.target.value = ''
                        }
                      }}
                    />
                    <Label
                      htmlFor="file-upload"
                      className="cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2"
                    >
                      <FileUp className="w-4 h-4" /> Anexar Arquivo
                    </Label>
                  </div>
                </div>

                {docsFields.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-lg bg-card space-y-4">
                    <div className="flex items-start gap-4">
                      <FormField
                        control={form.control}
                        name={`documents.${index}.name`}
                        render={({ field: nameField }) => (
                          <FormItem className="flex-1">
                            <FormLabel className="text-xs">Nome do Arquivo</FormLabel>
                            <FormControl>
                              <Input {...nameField} readOnly className="bg-muted/50" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        className="mt-6 text-destructive hover:bg-destructive/10 h-10 w-10 p-0"
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
                          <FormLabel className="text-xs">Categorização dos Documentos</FormLabel>
                          <div className="flex flex-wrap gap-3 pt-1">
                            {DOC_CATEGORIES.map((cat) => (
                              <label
                                key={cat}
                                className="flex items-center gap-2 text-sm border px-3 py-1.5 rounded-full cursor-pointer hover:bg-muted/50 transition-colors"
                              >
                                <Checkbox
                                  checked={catField.value?.includes(cat)}
                                  onCheckedChange={(checked) =>
                                    checked
                                      ? catField.onChange([...(catField.value || []), cat])
                                      : catField.onChange(
                                          (catField.value || []).filter((v: string) => v !== cat),
                                        )
                                  }
                                />
                                {cat}
                              </label>
                            ))}
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 sticky bottom-4 bg-background/80 backdrop-blur-sm p-4 border rounded-xl shadow-lg">
            <Button
              variant="outline"
              type="button"
              onClick={() => navigate('/historico')}
              className="w-32"
            >
              Cancelar
            </Button>
            <Button type="submit" className="w-48 font-bold">
              {editId ? 'Salvar Alterações' : 'Salvar Registro'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
