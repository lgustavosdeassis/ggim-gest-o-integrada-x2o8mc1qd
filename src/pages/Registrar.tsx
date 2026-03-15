import { useEffect } from 'react'
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
import { Label } from '@/components/ui/label'
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

const DOC_TYPES = ['ATA', 'OFÍCIO', 'RELATÓRIO', 'TRANSCRIÇÃO', 'EMAIL', 'SID', 'FOTO', 'OUTROS']

const formSchema = z.object({
  instance: z.string().min(1, 'Obrigatório'),
  eventType: z.string().min(1, 'Obrigatório'),
  modality: z.string().min(1, 'Obrigatório'),
  location: z.string().min(1, 'Obrigatório'),
  meetingStart: z.string().min(1, 'Obrigatório'),
  meetingEnd: z.string().min(1, 'Obrigatório'),
  hasAction: z.boolean().default(false),
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
        type: z.string().min(1, 'Selecione um tipo'),
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
      hasAction: false,
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
        let initialHasAction = activity.hasAction || false
        if (
          initialActions.length === 0 &&
          activity.hasAction &&
          activity.actionStart &&
          activity.actionEnd
        ) {
          initialActions = [
            { id: Math.random().toString(), start: activity.actionStart, end: activity.actionEnd },
          ]
          initialHasAction = true
        }

        const migratedDocs = (activity.documents || []).map((d) => ({
          ...d,
          type: d.type || (d as any).categories?.[0]?.toUpperCase() || 'OUTROS',
        }))

        form.reset({
          ...activity,
          hasAction: initialHasAction,
          actions: initialActions,
          documents: migratedDocs,
        })
      }
    }
  }, [editId, activities, form])

  const onSubmit = (data: FormValues) => {
    const payload = {
      ...data,
      actions: data.hasAction
        ? (data.actions || []).map((act) => ({
            ...act,
            id: act.id || Math.random().toString(36).substr(2, 9),
          }))
        : [],
      documents: (data.documents || []).map((doc) => ({
        ...doc,
        id: doc.id || Math.random().toString(36).substr(2, 9),
      })),
    } as any
    if (editId) {
      updateActivity(editId, payload)
      toast({ title: 'Atividade atualizada com sucesso.' })
    } else {
      addActivity(payload)
      toast({ title: 'Atividade registrada com sucesso.' })
    }
    navigate('/historico')
  }

  const wMeetingStart = form.watch('meetingStart')
  const wMeetingEnd = form.watch('meetingEnd')
  const wActions = form.watch('actions') || []
  const wHasAction = form.watch('hasAction')

  const tMeeting = calculateHoursDifference(wMeetingStart, wMeetingEnd)
  const tAction = wHasAction
    ? wActions.reduce((acc, a) => acc + calculateHoursDifference(a.start, a.end), 0)
    : 0

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          {editId ? 'Editar Atividade' : 'Registrar Atividade'}
        </h1>
        <p className="text-muted-foreground">
          Preencha as informações detalhadas da atividade com cálculos automáticos.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="border-primary/20 shadow-md">
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
                          <SelectValue placeholder="Selecione a instância" />
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
                          <SelectValue placeholder="Selecione o tipo" />
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
                          <SelectValue placeholder="Selecione a modalidade" />
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
                      <Input placeholder="Onde ocorreu o evento?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="border-primary/20 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-primary">Logística e Duração</h3>
                <div className="text-sm font-bold bg-primary text-primary-foreground px-4 py-1.5 rounded-md shadow-sm uppercase tracking-wide">
                  TOTAL DE HORAS DEDICADAS: {(tMeeting + tAction).toFixed(1)}h
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-secondary/30 p-5 rounded-xl mb-6 bg-secondary/5">
                <div className="col-span-1 md:col-span-2 flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-sm text-secondary">Tempo de Reunião</h4>
                  <span className="text-xs font-bold bg-secondary/20 text-secondary px-2 py-1 rounded">
                    Duração: {tMeeting.toFixed(1)}h
                  </span>
                </div>
                <FormField
                  control={form.control}
                  name="meetingStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Início da Reunião</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} className="bg-background" />
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
                        <Input type="datetime-local" {...field} className="bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="hasAction"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-4 space-y-0 rounded-xl border border-primary/20 p-5 bg-card shadow-sm mb-4">
                    <FormControl>
                      <Checkbox
                        className="mt-1 h-5 w-5"
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked)
                          if (checked && actionsFields.length === 0) {
                            appendAction({ start: '', end: '' })
                          }
                        }}
                      />
                    </FormControl>
                    <div className="space-y-1.5 leading-none">
                      <FormLabel className="text-base font-semibold cursor-pointer">
                        Houve Ação Vinculada/Gerada?
                      </FormLabel>
                      <p className="text-sm text-muted-foreground leading-snug">
                        Marque esta opção caso o evento tenha gerado uma ação prática complementar
                        (ex: operações, fiscalizações) que demandou tempo adicional da equipe.
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              {wHasAction && (
                <div className="border-t border-border pt-6 mt-2 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex items-center justify-between mb-5">
                    <h4 className="font-semibold text-sm text-primary">Ações Vinculadas Geradas</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-primary text-primary hover:bg-primary/10"
                      onClick={() => appendAction({ start: '', end: '' })}
                    >
                      + Adicionar Nova Ação
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {actionsFields.map((field, index) => {
                      const duration = calculateHoursDifference(
                        form.watch(`actions.${index}.start`),
                        form.watch(`actions.${index}.end`),
                      )
                      return (
                        <div
                          key={field.id}
                          className="p-5 border border-primary/20 rounded-xl bg-card relative shadow-sm"
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-3 top-3 text-destructive hover:bg-destructive/10 h-8 w-8"
                            onClick={() => removeAction(index)}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                          <div className="col-span-1 md:col-span-2 flex justify-between items-center mr-12 mb-4">
                            <h5 className="font-bold text-sm">Ação #{index + 1}</h5>
                            <span className="text-xs font-bold bg-primary/20 text-primary px-2 py-1 rounded">
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
                                    <Input
                                      type="datetime-local"
                                      {...startField}
                                      className="bg-background"
                                    />
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
                                    <Input
                                      type="datetime-local"
                                      {...endField}
                                      className="bg-background"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      )
                    })}
                    {actionsFields.length === 0 && (
                      <div className="text-center p-6 border border-dashed rounded-xl text-muted-foreground text-sm">
                        Nenhuma ação adicionada. Clique no botão acima para adicionar.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-primary/20 shadow-md">
            <CardContent className="pt-6 space-y-6">
              <h3 className="text-lg font-semibold text-primary">Engajamento</h3>
              <FormField
                control={form.control}
                name="participantsPF"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-end">
                      <FormLabel>
                        Nomes dos Participantes - PF (separados por ponto e vírgula)
                      </FormLabel>
                      <span className="text-xs font-bold bg-secondary/20 text-secondary px-3 py-1 rounded-full">
                        Total Pessoas: {parseSemicolonList(field.value || '').length}
                      </span>
                    </div>
                    <FormControl>
                      <Textarea
                        className="min-h-[100px] resize-y"
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
                      <span className="text-xs font-bold bg-secondary/20 text-secondary px-3 py-1 rounded-full">
                        Total Instituições: {parseSemicolonList(field.value || '').length}
                      </span>
                    </div>
                    <FormControl>
                      <Textarea
                        className="min-h-[80px] resize-y"
                        placeholder="Ex: Prefeitura Municipal; Corpo de Bombeiros; Polícia Civil"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="border-primary/20 shadow-md">
            <CardContent className="pt-6 space-y-6">
              <h3 className="text-lg font-semibold text-primary">Produtividade e Documentos</h3>
              <FormField
                control={form.control}
                name="deliberations"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-end">
                      <FormLabel>
                        Descritivo das Deliberações (separadas por ponto e vírgula)
                      </FormLabel>
                      <span className="text-xs font-bold bg-secondary/20 text-secondary px-3 py-1 rounded-full">
                        Total Deliberações: {parseSemicolonList(field.value || '').length}
                      </span>
                    </div>
                    <FormControl>
                      <Textarea
                        className="min-h-[100px] resize-y"
                        placeholder="Ex: Aprovada pauta principal; Definida data da próxima reunião; Encaminhado ofício ao setor responsável"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="border-t border-border pt-6 space-y-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-secondary/5 p-5 rounded-xl border border-dashed border-secondary/40 gap-4">
                  <div>
                    <h4 className="font-semibold text-base">Arquivos Comprobatórios Anexos</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Adicione PDFs, DOCX, TXT, Imagens (JPG, PNG) ou Áudios (MP3, WAV). Especifique
                      o tipo para cada.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="text-sm font-bold bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-sm whitespace-nowrap">
                      Total Geral de Documentos: {docsFields.length}
                    </div>
                    <Input
                      type="file"
                      className="hidden"
                      id="file-upload"
                      multiple
                      accept=".pdf,.docx,.txt,.jpg,.png,.jpeg,.mp3,.wav"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || [])
                        files.forEach((file) => {
                          appendDoc({ name: file.name, type: '' })
                        })
                        e.target.value = ''
                      }}
                    />
                    <Label
                      htmlFor="file-upload"
                      className="cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/90 h-10 px-5 py-2 shadow-sm"
                    >
                      <FileUp className="w-4 h-4" /> Anexar Documentos
                    </Label>
                  </div>
                </div>

                <div className="space-y-4">
                  {docsFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="p-5 border border-border rounded-xl bg-card space-y-4 shadow-sm relative grid grid-cols-1 md:grid-cols-[1fr_200px_auto] gap-4 items-start"
                    >
                      <FormField
                        control={form.control}
                        name={`documents.${index}.name`}
                        render={({ field: nameField }) => (
                          <FormItem className="flex-1">
                            <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Nome do Arquivo Identificado
                            </FormLabel>
                            <FormControl>
                              <Input {...nameField} readOnly className="bg-muted/30 font-medium" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`documents.${index}.type`}
                        render={({ field: typeField }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Tipo de Documento
                            </FormLabel>
                            <Select onValueChange={typeField.onChange} value={typeField.value}>
                              <FormControl>
                                <SelectTrigger className="bg-background border-primary/40 focus:ring-primary/50">
                                  <SelectValue placeholder="Selecione o tipo..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {DOC_TYPES.map((t) => (
                                  <SelectItem key={t} value={t}>
                                    {t}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        className="mt-6 text-destructive hover:bg-destructive/10 h-10 w-10 p-0 shrink-0"
                        onClick={() => removeDoc(index)}
                      >
                        <Trash className="w-5 h-5" />
                      </Button>
                    </div>
                  ))}
                  {docsFields.length === 0 && (
                    <div className="text-center p-8 border border-dashed rounded-xl text-muted-foreground text-sm">
                      Nenhum arquivo anexado nesta atividade.
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4 sticky bottom-6 bg-card/95 backdrop-blur-md p-5 border border-primary/10 rounded-2xl shadow-xl z-10">
            <Button
              variant="outline"
              type="button"
              onClick={() => navigate('/historico')}
              className="w-32"
            >
              Cancelar
            </Button>
            <Button type="submit" className="w-56 font-bold text-base shadow-md">
              {editId ? 'Salvar Alterações' : 'Salvar Registro'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
