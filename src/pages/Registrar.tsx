import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAppStore } from '@/stores/main'
import { useAuthStore } from '@/stores/auth'
import { useAuditStore } from '@/stores/audit'
import { Button } from '@/components/ui/button'
import { ToastAction } from '@/components/ui/toast'
import { db } from '@/lib/db/database-service'
import { Loader2 } from 'lucide-react'
import { Form } from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { formSchema, FormValues } from '@/components/registrar/schema'
import { IdentificacaoCard } from '@/components/registrar/IdentificacaoCard'
import { DuracaoCard } from '@/components/registrar/DuracaoCard'
import { EngajamentoCard } from '@/components/registrar/EngajamentoCard'
import { ProdutividadeCard } from '@/components/registrar/ProdutividadeCard'

const formatForDatetimeLocal = (isoStr?: string | null) => {
  if (!isoStr) return ''
  if (isoStr.includes('Z') || isoStr.length > 16) {
    const d = new Date(isoStr)
    if (isNaN(d.getTime())) return isoStr
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }
  return isoStr
}

export default function Registrar() {
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')
  const navigate = useNavigate()
  const { toast } = useToast()

  const { activities } = useAppStore()
  const { user } = useAuthStore()

  const canEdit = user?.role === 'admin' || user?.role === 'owner' || user?.role === 'editor'
  const isViewer = !canEdit

  const addLog = useAuditStore((state) => state.addLog)

  const [isSubmitting, setIsSubmitting] = useState(false)

  const defaultActivity = useMemo(() => {
    return editId ? activities.find((a) => a.id === editId) : null
  }, [editId, activities])

  const initialValues = useMemo(() => {
    if (defaultActivity) {
      const d = defaultActivity as any
      let initialActions = d.actions || []
      let initialHasAction = d.hasAction ?? d.has_action_boolean ?? false

      const actStart = d.actionStart || d.action_start
      const actEnd = d.actionEnd || d.action_end

      if (initialActions.length === 0 && initialHasAction && actStart && actEnd) {
        initialActions = [
          {
            id: Math.random().toString(),
            periods: [
              {
                id: Math.random().toString(),
                start: actStart,
                end: actEnd,
              },
            ],
          },
        ]
        initialHasAction = true
      }
      const migratedDocs = (defaultActivity.documents || []).map((d) => {
        let t = d.type || (d as any).categories?.[0] || 'Outros'
        const map: Record<string, string> = {
          ATO: 'Ata',
          ATA: 'Ata',
          OFÍCIO: 'Ofício',
          RELATÓRIO: 'Relatório',
          TRANSCRIÇÃO: 'Transcrição',
          'E-MAIL': 'E-mail',
          EMAIL: 'E-mail',
          SID: 'SID',
          FORMULÁRIO: 'Formulário',
          IMAGENS: 'Foto',
          FOTO: 'Foto',
          FOTOS: 'Foto',
          ÁUDIO: 'Áudio',
          OUTROS: 'Outros',
          'LISTA DE PRESENÇA': 'Lista de Presença',
        }
        return {
          ...d,
          type: map[t.toUpperCase()] || t,
        }
      })
      return {
        ...d,
        eventName: d.eventName || d.event_name || '',
        instance: d.instance || '',
        eventType: d.eventType || d.event_type || '',
        modality: d.modality || '',
        location: d.location || '',
        actionStart: formatForDatetimeLocal(actStart) || '',
        actionEnd: formatForDatetimeLocal(actEnd) || '',
        participantsPF: d.participantsPF || d.participants_pf || '',
        participantsPJ: d.participantsPJ || d.participants_pj || '',
        deliberations: d.deliberations || '',
        meetingStart: formatForDatetimeLocal(d.meetingStart || d.meeting_start),
        meetingEnd: formatForDatetimeLocal(d.meetingEnd || d.meeting_end),
        hasAdditionalDays: d.hasAdditionalDays ?? d.has_additional_days ?? false,
        additionalDays: (d.additionalDays || d.additional_days || []).map((ad: any) => ({
          ...ad,
          start: formatForDatetimeLocal(ad.start),
          end: formatForDatetimeLocal(ad.end),
        })),
        hasAction: initialHasAction,
        actions: initialActions.map((a: any) => ({
          ...a,
          start: formatForDatetimeLocal(a.start) || '',
          end: formatForDatetimeLocal(a.end) || '',
          periods:
            a.periods && a.periods.length > 0
              ? a.periods.map((p: any) => ({
                  ...p,
                  start: formatForDatetimeLocal(p.start),
                  end: formatForDatetimeLocal(p.end),
                }))
              : [
                  {
                    id: Math.random().toString(),
                    start: formatForDatetimeLocal(a.start),
                    end: formatForDatetimeLocal(a.end),
                  },
                ],
        })),
        documents: migratedDocs,
      } as FormValues
    }
    return {
      eventName: '',
      instance: '',
      eventType: '',
      modality: '',
      location: '',
      meetingStart: '',
      meetingEnd: '',
      hasAdditionalDays: false,
      additionalDays: [],
      hasAction: false,
      actionStart: '',
      actionEnd: '',
      actions: [],
      participantsPF: '',
      participantsPJ: '',
      deliberations: '',
      documents: [],
    }
  }, [defaultActivity])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  })

  useEffect(() => {
    if (defaultActivity) form.reset(initialValues)
  }, [initialValues, form, defaultActivity])

  const onSubmit = async (data: FormValues) => {
    if (isViewer) return
    setIsSubmitting(true)

    try {
      const payload: any = {
        event_name: data.eventName || '',
        instance: data.instance || '',
        event_type: data.eventType || '',
        modality: data.modality || '',
        location: data.location || '',
        meeting_start: data.meetingStart ? new Date(data.meetingStart).toISOString() : null,
        meeting_end: data.meetingEnd ? new Date(data.meetingEnd).toISOString() : null,
        has_additional_days: data.hasAdditionalDays,
        additional_days: data.hasAdditionalDays
          ? (data.additionalDays || []).map((ad) => ({
              ...ad,
              id: ad.id || Math.random().toString(36).substring(2, 9),
            }))
          : [],
        has_action_boolean: data.hasAction,
        action_start: data.actionStart ? new Date(data.actionStart).toISOString() : null,
        action_end: data.actionEnd ? new Date(data.actionEnd).toISOString() : null,
        actions: data.hasAction
          ? (data.actions || []).map((act) => ({
              ...act,
              id: act.id || Math.random().toString(36).substring(2, 9),
              periods: (act.periods || []).map((p) => ({
                ...p,
                id: p.id || Math.random().toString(36).substring(2, 9),
              })),
            }))
          : [],
        participants_pf: data.participantsPF || '',
        participants_pj: data.participantsPJ || '',
        deliberations: data.deliberations || '',
        documents: (data.documents || []).map((doc) => ({
          ...doc,
          id: doc.id || Math.random().toString(36).substring(2, 9),
        })),
      }

      if (editId) {
        await db.collection('activities').update(editId, payload)
        addLog({
          userName: user?.name || 'Sistema',
          userEmail: user?.email || '',
          action: `Editou os dados do evento: ${payload.event_name ? payload.event_name + ' - ' : ''}${payload.event_type} (${payload.instance})`,
        })
      } else {
        payload.created_at = new Date().toISOString()
        await db.collection('activities').create(payload)
        addLog({
          userName: user?.name || 'Sistema',
          userEmail: user?.email || '',
          action: `Registrou uma nova atividade: ${payload.event_name ? payload.event_name + ' - ' : ''}${payload.event_type} (${payload.instance})`,
        })
      }

      toast({
        title: 'Sucesso',
        description: 'Atividade registrada com sucesso!',
        className: 'bg-green-500 text-white border-none',
      })

      setTimeout(() => {
        navigate('/historico')
      }, 2000)
    } catch (err: any) {
      console.error(err)
      const isPermission = err?.status === 403

      toast({
        title: isPermission ? 'Erro de Permissão' : 'Erro ao salvar',
        description: isPermission
          ? 'Você não tem permissão para realizar esta ação.'
          : 'Ocorreu um erro inesperado ao tentar salvar a atividade. Verifique sua conexão e tente novamente.',
        variant: 'destructive',
        action: !isPermission ? (
          <ToastAction
            altText="Tentar Novamente"
            onClick={() => form.handleSubmit(onSubmit, onError)()}
          >
            Tentar Novamente
          </ToastAction>
        ) : undefined,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const onError = (errors: any) => {
    console.error('Erros de validação do formulário:', errors)
    toast({
      title: 'Atenção: Campos Incompletos',
      description:
        'Por favor, preencha corretamente os campos obrigatórios destacados em vermelho antes de salvar.',
      variant: 'destructive',
    })
  }

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-[#0f172a] mb-2">
          {editId
            ? isViewer
              ? 'Visualizar Atividade'
              : 'Editar Atividade'
            : 'Registrar Atividade'}
        </h1>
        <p className="text-[#0f172a]/60 text-base font-medium">
          {isViewer
            ? 'Visualizando os detalhes da atividade no modo leitura.'
            : 'Preencha os campos abaixo de forma detalhada para alimentar o Dashboard Gerencial.'}
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-8">
          <IdentificacaoCard />
          <DuracaoCard />
          <EngajamentoCard />
          <ProdutividadeCard />
          <div className="flex flex-col sm:flex-row justify-end gap-5 sticky bottom-6 bg-white/95 backdrop-blur-xl p-5 border-2 border-[#0f172a]/10 rounded-3xl shadow-xl z-10 mt-10 w-full sm:w-fit sm:ml-auto">
            <Button
              variant={isViewer ? 'default' : 'ghost'}
              type="button"
              onClick={() => navigate('/historico')}
              disabled={isSubmitting}
              className={`w-full h-12 rounded-xl font-bold transition-all ${
                isViewer
                  ? 'sm:w-64 bg-[#0f172a] text-white hover:bg-[#1e293b]'
                  : 'sm:w-32 text-[#0f172a]/60 hover:text-[#0f172a] hover:bg-slate-100'
              }`}
            >
              {isViewer ? 'Voltar para Histórico' : 'Cancelar'}
            </Button>
            {!isViewer && (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-64 h-12 font-black text-base bg-[#eab308] text-[#0f172a] hover:bg-[#ca8a04] shadow-md transition-all rounded-xl disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    SALVANDO...
                  </>
                ) : editId ? (
                  'ATUALIZAR REGISTRO'
                ) : (
                  'Registrar Atividade'
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
