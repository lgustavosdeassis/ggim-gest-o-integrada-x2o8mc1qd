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
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent } from '@/components/ui/card'
import { Trash } from 'lucide-react'

const INSTANCIAS = [
  'Colegiado Pleno',
  'Eventos Institucionais',
  'CMTEC AIFU',
  'CMTEC PVC',
  'CMTEC PVCCA/RP',
  'CMTEC PVCM/CMDM',
  'CMTEC TRAN/PVT',
  'CMTEC MA',
  'CMTEC AP/COMUD',
  'CMTEC ETP',
]

const EVENTOS_TIPO = [
  'Reunião Ordinária',
  'Reunião Extraordinária',
  'Reunião Institucional',
  'Visita Técnica',
  'Capacitação',
  'Seminário',
  'Treinamento',
  'Curso',
  'Congressos',
  'Colóquio',
  'Fórum',
  'Webinário',
  'Palestras',
  'Apresentação',
  'Networking',
  'Convenção',
  'Conferência',
  'Confraternização',
  'Projeto',
  'Programa',
  'Feira',
  'Exposição',
  'Mesa Redonda',
  'Painel',
  'Workshop',
  'Oficina',
  'Roadshop',
  'Campanha',
  'Blitz',
  'Operação',
]

const DOC_CATEGORIAS = ['Ofício', 'Ata', 'Relatório', 'Email', 'SID', 'Transcrição', 'Outros']

const formSchema = z.object({
  instance: z.string().min(1, 'Selecione uma instância'),
  type: z.string().min(1, 'Selecione o tipo'),
  modality: z.string().min(1, 'Selecione a modalidade'),
  startDate: z.string().min(1, 'Data é obrigatória'),
  location: z.string().min(1, 'Local é obrigatório'),
  participantsPF: z.coerce.number().min(0),
  participantsPJ: z.coerce.number().min(0),
  description: z.string().optional(),
  documents: z
    .array(
      z.object({
        id: z.string().optional(),
        category: z.string().min(1, 'Categoria é obrigatória'),
        name: z.string().min(1, 'Nome é obrigatório'),
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
      type: '',
      modality: '',
      startDate: '',
      location: '',
      participantsPF: 0,
      participantsPJ: 0,
      description: '',
      documents: [],
    },
  })

  const {
    fields: docsFields,
    append: appendDoc,
    remove: removeDoc,
  } = useFieldArray({
    control: form.control,
    name: 'documents',
  })

  useEffect(() => {
    if (editId) {
      const activity = activities.find((a) => a.id === editId)
      if (activity) {
        form.reset({
          instance: activity.instance,
          type: activity.type,
          modality: activity.modality,
          startDate: activity.startDate
            ? new Date(activity.startDate).toISOString().slice(0, 16)
            : '',
          location: activity.location,
          participantsPF: activity.participantsPF,
          participantsPJ: activity.participantsPJ,
          description: activity.description || '',
          documents: activity.documents || [],
        })
      }
    }
  }, [editId, activities, form])

  const onSubmit = (data: FormValues) => {
    const payload = {
      ...data,
      documents: (data.documents || []).map((doc) => ({
        ...doc,
        id: doc.id || Math.random().toString(36).substr(2, 9),
      })),
      startDate: new Date(data.startDate).toISOString(),
    }

    if (editId) {
      updateActivity(editId, payload)
      toast({ title: 'Sucesso', description: 'Atividade atualizada com sucesso.' })
    } else {
      addActivity(payload)
      toast({ title: 'Sucesso', description: 'Atividade registrada com sucesso.' })
    }
    navigate('/historico')
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {editId ? 'Editar Atividade' : 'Registrar Atividade'}
        </h1>
        <p className="text-muted-foreground">
          {editId
            ? 'Altere as informações do registro existente.'
            : 'Preencha o formulário para adicionar uma nova atividade.'}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  name="type"
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
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data e Hora</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
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
                        <Input placeholder="Onde ocorreu o evento?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="participantsPF"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pessoas Físicas (PF)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
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
                        <FormLabel>Pessoas Jurídicas (PJ)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Documentos Gerados
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendDoc({ category: '', name: '' })}
                  >
                    Adicionar Documento
                  </Button>
                </div>

                {docsFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-start gap-4 p-4 border rounded-lg bg-slate-50/50"
                  >
                    <FormField
                      control={form.control}
                      name={`documents.${index}.category`}
                      render={({ field: catField }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Categoria</FormLabel>
                          <Select onValueChange={catField.onChange} value={catField.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {DOC_CATEGORIAS.map((i) => (
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
                      name={`documents.${index}.name`}
                      render={({ field: nameField }) => (
                        <FormItem className="flex-[2]">
                          <FormLabel>Nome do Arquivo</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Ata de Reunião 123" {...nameField} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      className="mt-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => removeDoc(index)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Detalhes adicionais..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => navigate('/historico')}>
                  Cancelar
                </Button>
                <Button type="submit">{editId ? 'Salvar Alterações' : 'Salvar Atividade'}</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
