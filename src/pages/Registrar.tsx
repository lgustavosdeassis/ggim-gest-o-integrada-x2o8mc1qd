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
import { Trash, FileUp, ListPlus, Users, FileText, CheckCircle2 } from 'lucide-react'
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
        type: z.string().min(1, 'Tipo de documento obrigatório para garantir o Dashboard.'),
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
    <div className="flex flex-col gap-8 max-w-5xl mx-auto py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-foreground mb-2">
          {editId ? 'Editar Atividade' : 'Registrar Atividade'}
        </h1>
        <p className="text-muted-foreground text-base">
          Preencha os campos abaixo de forma detalhada para alimentar o Dashboard Gerencial.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Identificação Card */}
          <Card className="border-border shadow-sm bg-card rounded-2xl overflow-hidden">
            <div className="bg-muted/50 px-6 py-4 border-b border-border flex items-center gap-3">
              <ListPlus className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-bold text-foreground">Identificação do Evento</h3>
            </div>
            <CardContent className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="instance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground font-bold uppercase tracking-widest text-xs">
                      Instância / Comitê
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-border h-12 rounded-xl text-foreground">
                          <SelectValue placeholder="Selecione a instância" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover border-border text-popover-foreground rounded-xl shadow-lg">
                        {INSTANCIAS.map((i) => (
                          <SelectItem
                            key={i}
                            value={i}
                            className="focus:bg-accent focus:text-accent-foreground cursor-pointer py-2.5"
                          >
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
                    <FormLabel className="text-muted-foreground font-bold uppercase tracking-widest text-xs">
                      Tipo do Evento
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-border h-12 rounded-xl text-foreground">
                          <SelectValue placeholder="Selecione a tipologia" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover border-border text-popover-foreground rounded-xl shadow-lg">
                        {EVENTOS_TIPO.map((i) => (
                          <SelectItem
                            key={i}
                            value={i}
                            className="focus:bg-accent focus:text-accent-foreground cursor-pointer py-2.5"
                          >
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
                    <FormLabel className="text-muted-foreground font-bold uppercase tracking-widest text-xs">
                      Modalidade
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-border h-12 rounded-xl text-foreground">
                          <SelectValue placeholder="Como ocorreu?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover border-border text-popover-foreground rounded-xl shadow-lg">
                        <SelectItem value="Presencial" className="py-2.5">
                          Presencial
                        </SelectItem>
                        <SelectItem value="Remota" className="py-2.5">
                          Remota
                        </SelectItem>
                        <SelectItem value="Híbrida" className="py-2.5">
                          Híbrida
                        </SelectItem>
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
                    <FormLabel className="text-muted-foreground font-bold uppercase tracking-widest text-xs">
                      Local
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Paço Municipal / Zoom"
                        {...field}
                        className="bg-background border-border h-12 rounded-xl text-foreground placeholder:text-muted-foreground/50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Duração Card */}
          <Card className="border-border shadow-sm bg-card rounded-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 pt-5 pr-6 hidden sm:block">
              <div className="text-xs font-black bg-primary text-primary-foreground px-4 py-2 rounded-xl shadow-sm uppercase tracking-widest border border-primary/20">
                Total de Horas:{' '}
                <span className="text-lg ml-1">{(tMeeting + tAction).toFixed(1)}h</span>
              </div>
            </div>
            <div className="bg-muted/50 px-6 py-4 border-b border-border flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-chart-2" />
              <h3 className="text-lg font-bold text-foreground">Logística e Dedicação de Horas</h3>
            </div>

            <CardContent className="p-6 md:p-8">
              <div className="sm:hidden mb-6 text-center text-xs font-black bg-primary text-primary-foreground px-4 py-3 rounded-xl shadow-sm uppercase tracking-widest border border-primary/20">
                Total Dedicado:{' '}
                <span className="text-base ml-1">{(tMeeting + tAction).toFixed(1)}h</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-border p-6 rounded-2xl mb-8 bg-muted/30 relative">
                <div className="absolute -top-3 left-6 bg-chart-2 text-primary-foreground text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                  Reunião Principal ({tMeeting.toFixed(1)}h)
                </div>
                <FormField
                  control={form.control}
                  name="meetingStart"
                  render={({ field }) => (
                    <FormItem className="mt-2">
                      <FormLabel className="text-muted-foreground font-bold text-xs uppercase tracking-widest">
                        Início da Reunião
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          className="bg-card border-border h-12 rounded-xl text-foreground shadow-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="meetingEnd"
                  render={({ field }) => (
                    <FormItem className="mt-2">
                      <FormLabel className="text-muted-foreground font-bold text-xs uppercase tracking-widest">
                        Término da Reunião
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          className="bg-card border-border h-12 rounded-xl text-foreground shadow-sm"
                        />
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
                  <FormItem className="flex flex-row items-start space-x-4 space-y-0 rounded-2xl border border-primary/30 p-5 bg-primary/5 shadow-sm mb-4 cursor-pointer group hover:bg-primary/10 transition-colors">
                    <FormControl>
                      <Checkbox
                        className="mt-1 h-5 w-5 border-2 rounded text-primary border-primary bg-background data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked)
                          if (checked && actionsFields.length === 0) {
                            appendAction({ start: '', end: '' })
                          }
                        }}
                      />
                    </FormControl>
                    <div className="space-y-2 leading-none cursor-pointer flex-1">
                      <FormLabel className="text-base font-bold text-primary cursor-pointer">
                        Esta reunião gerou ou desdobrou em uma Ação Vinculada?
                      </FormLabel>
                      <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                        Exemplo: Desdobramentos operacionais, fiscalizações conjuntas ou tempo
                        adicional dedicado pós-reunião.
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              {wHasAction && (
                <div className="border-t border-border pt-8 mt-6 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="font-bold text-base text-foreground">
                      Cronograma das Ações Vinculadas
                    </h4>
                    <Button
                      type="button"
                      className="bg-secondary text-secondary-foreground hover:bg-secondary/80 font-bold rounded-xl h-10 px-4 shadow-sm"
                      onClick={() => appendAction({ start: '', end: '' })}
                    >
                      + Nova Ação Extra
                    </Button>
                  </div>

                  <div className="space-y-5">
                    {actionsFields.map((field, index) => {
                      const duration = calculateHoursDifference(
                        form.watch(`actions.${index}.start`),
                        form.watch(`actions.${index}.end`),
                      )
                      return (
                        <div
                          key={field.id}
                          className="p-6 border border-border rounded-2xl bg-muted/30 relative group"
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-4 top-4 text-destructive hover:bg-destructive hover:text-white rounded-xl h-9 w-9 opacity-50 group-hover:opacity-100 transition-all"
                            onClick={() => removeAction(index)}
                            title="Remover Ação"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                          <div className="flex items-center gap-3 mb-5 pr-12">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground font-black text-xs">
                              {index + 1}
                            </span>
                            <span className="text-xs font-black bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-widest border border-primary/20">
                              Duração: {duration.toFixed(1)}h
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mr-0 md:mr-8">
                            <FormField
                              control={form.control}
                              name={`actions.${index}.start`}
                              render={({ field: startField }) => (
                                <FormItem>
                                  <FormLabel className="text-muted-foreground font-bold text-xs uppercase tracking-widest">
                                    Início da Ação Extra
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="datetime-local"
                                      {...startField}
                                      className="bg-card border-border h-11 rounded-xl text-foreground shadow-sm"
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
                                  <FormLabel className="text-muted-foreground font-bold text-xs uppercase tracking-widest">
                                    Término da Ação Extra
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="datetime-local"
                                      {...endField}
                                      className="bg-card border-border h-11 rounded-xl text-foreground shadow-sm"
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
                      <div className="text-center p-8 border-2 border-dashed border-border rounded-2xl text-muted-foreground font-medium text-sm bg-muted/50">
                        Nenhuma ação temporal informada. Clique no botão acima para computar horas
                        extras.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Engajamento Card */}
          <Card className="border-border shadow-sm bg-card rounded-2xl overflow-hidden">
            <div className="bg-muted/50 px-6 py-4 border-b border-border flex items-center gap-3">
              <Users className="h-5 w-5 text-chart-3" />
              <h3 className="text-lg font-bold text-foreground">Engajamento / Presenças</h3>
            </div>
            <CardContent className="p-6 md:p-8 space-y-8">
              <FormField
                control={form.control}
                name="participantsPF"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 mb-1">
                      <FormLabel className="text-muted-foreground font-bold text-xs uppercase tracking-widest">
                        Pessoas Físicas (separadas por ponto e vírgula)
                      </FormLabel>
                      <span className="text-[10px] font-black bg-chart-3/10 text-chart-3 px-3 py-1 rounded-full uppercase tracking-widest border border-chart-3/30 w-fit">
                        Total Pessoas: {parseSemicolonList(field.value || '').length}
                      </span>
                    </div>
                    <FormControl>
                      <Textarea
                        className="min-h-[120px] resize-y bg-background border-border shadow-sm rounded-xl text-foreground p-4 placeholder:text-muted-foreground/60 text-base"
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
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 mb-1">
                      <FormLabel className="text-muted-foreground font-bold text-xs uppercase tracking-widest">
                        Instituições PJ (separadas por ponto e vírgula)
                      </FormLabel>
                      <span className="text-[10px] font-black bg-chart-4/10 text-chart-4 px-3 py-1 rounded-full uppercase tracking-widest border border-chart-4/30 w-fit">
                        Total Instituições: {parseSemicolonList(field.value || '').length}
                      </span>
                    </div>
                    <FormControl>
                      <Textarea
                        className="min-h-[100px] resize-y bg-background border-border shadow-sm rounded-xl text-foreground p-4 placeholder:text-muted-foreground/60 text-base"
                        placeholder="Ex: Prefeitura Municipal; Polícia Federal; Bombeiros"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Produtividade e Docs Card */}
          <Card className="border-border shadow-sm bg-card rounded-2xl overflow-hidden">
            <div className="bg-muted/50 px-6 py-4 border-b border-border flex items-center gap-3">
              <FileText className="h-5 w-5 text-chart-5" />
              <h3 className="text-lg font-bold text-foreground">Produtividade e Documentação</h3>
            </div>
            <CardContent className="p-6 md:p-8 space-y-8">
              <FormField
                control={form.control}
                name="deliberations"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 mb-1">
                      <FormLabel className="text-muted-foreground font-bold text-xs uppercase tracking-widest">
                        Registro de Deliberações (separadas por ponto e vírgula)
                      </FormLabel>
                      <span className="text-[10px] font-black bg-chart-5/10 text-chart-5 px-3 py-1 rounded-full uppercase tracking-widest border border-chart-5/30 w-fit">
                        Total Deliberações: {parseSemicolonList(field.value || '').length}
                      </span>
                    </div>
                    <FormControl>
                      <Textarea
                        className="min-h-[120px] resize-y bg-background border-border shadow-sm rounded-xl text-foreground p-4 placeholder:text-muted-foreground/60 text-base leading-relaxed"
                        placeholder="Ex: Aprovada diretriz de ação x; Pauta de segurança discutida;"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="border-t border-border pt-8 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-muted/40 p-6 rounded-2xl border-2 border-dashed border-border gap-6">
                  <div>
                    <h4 className="font-bold text-lg text-foreground">Gestão de Anexos</h4>
                    <p className="text-sm text-muted-foreground mt-2 max-w-lg leading-relaxed font-medium">
                      Obrigatório classificar o{' '}
                      <span className="text-foreground font-bold">Tipo de Documento</span> para cada
                      arquivo (ATA, OFÍCIO, RELATÓRIO, etc), o que alimenta diretamente o Dashboard.
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-4 w-full md:w-auto">
                    <div className="text-sm font-black bg-primary/10 text-primary px-5 py-2.5 rounded-xl border border-primary/20 whitespace-nowrap w-full md:w-auto text-center">
                      DOCUMENTOS TOTAIS: {docsFields.length}
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
                      className="cursor-pointer inline-flex w-full md:w-auto items-center justify-center gap-3 whitespace-nowrap rounded-xl text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/90 h-12 px-6 shadow-md"
                    >
                      <FileUp className="w-5 h-5" /> Inserir Arquivos
                    </Label>
                  </div>
                </div>

                <div className="space-y-4">
                  {docsFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="p-5 border border-border rounded-2xl bg-muted/30 shadow-sm relative grid grid-cols-1 lg:grid-cols-[1fr_240px_auto] gap-5 items-start group hover:border-primary/30 transition-colors"
                    >
                      <FormField
                        control={form.control}
                        name={`documents.${index}.name`}
                        render={({ field: nameField }) => (
                          <FormItem className="flex-1 mt-1">
                            <FormLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                              Arquivo Recebido
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...nameField}
                                readOnly
                                className="bg-transparent border-0 border-b border-border/50 rounded-none px-1 h-10 font-bold text-foreground focus-visible:ring-0 focus-visible:border-primary truncate"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`documents.${index}.type`}
                        render={({ field: typeField }) => (
                          <FormItem className="mt-1">
                            <FormLabel className="text-[10px] font-black text-primary uppercase tracking-widest">
                              Categoria Obrigatória *
                            </FormLabel>
                            <Select onValueChange={typeField.onChange} value={typeField.value}>
                              <FormControl>
                                <SelectTrigger className="bg-card border-border shadow-sm focus:ring-primary/50 h-11 rounded-xl font-bold text-foreground">
                                  <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-popover border-border text-popover-foreground rounded-xl shadow-lg">
                                {DOC_TYPES.map((t) => (
                                  <SelectItem
                                    key={t}
                                    value={t}
                                    className="font-bold cursor-pointer py-2 focus:bg-accent focus:text-accent-foreground"
                                  >
                                    {t}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-[10px] font-bold" />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        className="lg:mt-7 text-destructive hover:bg-destructive hover:text-white rounded-xl h-11 w-11 p-0 shrink-0 border border-transparent hover:border-destructive/30 transition-all opacity-70 group-hover:opacity-100"
                        onClick={() => removeDoc(index)}
                        title="Remover anexo"
                      >
                        <Trash className="w-5 h-5" />
                      </Button>
                    </div>
                  ))}
                  {docsFields.length === 0 && (
                    <div className="text-center p-8 border border-dashed border-border rounded-2xl text-muted-foreground font-medium text-sm">
                      Lista de documentos vazia.
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-5 sticky bottom-6 bg-card/90 backdrop-blur-xl p-5 border border-border rounded-3xl shadow-xl z-10 mt-10 w-fit ml-auto">
            <Button
              variant="ghost"
              type="button"
              onClick={() => navigate('/historico')}
              className="w-32 h-12 rounded-xl text-muted-foreground hover:text-foreground font-bold hover:bg-muted"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="w-64 h-12 font-black text-base bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transition-all rounded-xl"
            >
              {editId ? 'ATUALIZAR REGISTRO' : 'SALVAR NOVO REGISTRO'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
