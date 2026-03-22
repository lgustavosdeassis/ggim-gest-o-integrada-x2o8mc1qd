import { useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAppStore } from '@/stores/main'
import { useAuthStore } from '@/stores/auth'
import { useAuditStore } from '@/stores/audit'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { formSchema, FormValues } from '@/components/registrar/schema'
import { IdentificacaoCard } from '@/components/registrar/IdentificacaoCard'
import { DuracaoCard } from '@/components/registrar/DuracaoCard'
import { EngajamentoCard } from '@/components/registrar/EngajamentoCard'
import { ProdutividadeCard } from '@/components/registrar/ProdutividadeCard'

const formatForDatetimeLocal = (isoStr?: string) => {
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

  const { activities, addActivity, updateActivity } = useAppStore()
  const { user } = useAuthStore()
  const isViewer = user?.role === 'viewer'
  const addLog = useAuditStore((state) => state.addLog)

  const defaultActivity = useMemo(() => {
    return editId ? activities.find((a) => a.id === editId) : null
  }, [editId, activities])

  const initialValues = useMemo(() => {
    if (defaultActivity) {
      let initialActions = defaultActivity.actions || []
      let initialHasAction = defaultActivity.hasAction || false
      if (
        initialActions.length === 0 &&
        defaultActivity.hasAction &&
        defaultActivity.actionStart &&
        defaultActivity.actionEnd
      ) {
        initialActions = [
          {
            id: Math.random().toString(),
            periods: [
              {
                id: Math.random().toString(),
                start: defaultActivity.actionStart,
                end: defaultActivity.actionEnd,
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
          IMAGENS: 'Imagens',
          FOTO: 'Imagens',
          FOTOS: 'Imagens',
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
        ...defaultActivity,
        eventName: defaultActivity.eventName || '',
        meetingStart: formatForDatetimeLocal(defaultActivity.meetingStart),
        meetingEnd: formatForDatetimeLocal(defaultActivity.meetingEnd),
        hasAdditionalDays: defaultActivity.hasAdditionalDays || false,
        additionalDays: (defaultActivity.additionalDays || []).map((ad) => ({
          ...ad,
          start: formatForDatetimeLocal(ad.start),
          end: formatForDatetimeLocal(ad.end),
        })),
        hasAction: initialHasAction,
        actions: initialActions.map((a) => ({
          ...a,
          periods:
            a.periods && a.periods.length > 0
              ? a.periods.map((p) => ({
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

  const onSubmit = (data: FormValues) => {
    if (isViewer) return
    const payload = {
      ...data,
      additionalDays: data.hasAdditionalDays
        ? (data.additionalDays || []).map((ad) => ({
            ...ad,
            id: ad.id || Math.random().toString(36).substr(2, 9),
          }))
        : [],
      actions: data.hasAction
        ? (data.actions || []).map((act) => ({
            ...act,
            id: act.id || Math.random().toString(36).substr(2, 9),
            periods: (act.periods || []).map((p) => ({
              ...p,
              id: p.id || Math.random().toString(36).substr(2, 9),
            })),
          }))
        : [],
      documents: (data.documents || []).map((doc) => ({
        ...doc,
        id: doc.id || Math.random().toString(36).substr(2, 9),
      })),
    } as any
    if (editId) {
      updateActivity(editId, payload)
      addLog({
        userName: user?.name || 'Sistema',
        userEmail: user?.email || '',
        action: `Editou os dados do evento: ${payload.eventName ? payload.eventName + ' - ' : ''}${payload.eventType} (${payload.instance})`,
      })
      toast({ title: 'Atividade atualizada com sucesso.' })
    } else {
      addActivity(payload)
      addLog({
        userName: user?.name || 'Sistema',
        userEmail: user?.email || '',
        action: `Registrou uma nova atividade: ${payload.eventName ? payload.eventName + ' - ' : ''}${payload.eventType} (${payload.instance})`,
      })
      toast({ title: 'Atividade registrada com sucesso.' })
    }
    navigate('/historico')
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <IdentificacaoCard />
          <DuracaoCard />
          <EngajamentoCard />
          <ProdutividadeCard />
          <div className="flex flex-col sm:flex-row justify-end gap-5 sticky bottom-6 bg-white/95 backdrop-blur-xl p-5 border-2 border-[#0f172a]/10 rounded-3xl shadow-xl z-10 mt-10 w-full sm:w-fit sm:ml-auto">
            <Button
              variant={isViewer ? 'default' : 'ghost'}
              type="button"
              onClick={() => navigate('/historico')}
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
                className="w-full sm:w-64 h-12 font-black text-base bg-[#eab308] text-[#0f172a] hover:bg-[#ca8a04] shadow-md transition-all rounded-xl"
              >
                {editId ? 'ATUALIZAR REGISTRO' : 'SALVAR NOVO REGISTRO'}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
