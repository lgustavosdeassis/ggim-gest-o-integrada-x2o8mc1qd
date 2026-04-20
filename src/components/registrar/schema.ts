import * as z from 'zod'

export const INSTANCIAS = [
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
] as const

export const EVENTOS_TIPO = [
  'Reunião Ordinária',
  'Reunião Extraordinária',
  'Apresentação',
  'Palestra',
  'Seminário',
  'Workshop',
  'Capacitação',
  'Visita Técnica',
  'Outros',
] as const

export const MODALIDADES = ['Presencial', 'Remota', 'Híbrida'] as const

export const DOC_TYPES = [
  'Link',
  'Ata',
  'Ofício',
  'Relatório',
  'Transcrição',
  'E-mail',
  'SID',
  'Formulário',
  'Imagens',
  'Áudio',
  'Vídeo',
  'Lista de Presença',
  'Outros',
] as const

export const formSchema = z.object({
  eventName: z.string().min(1, 'Obrigatório'),
  instance: z.string().min(1, 'Instância é obrigatória.'),
  eventType: z.string().min(1, 'Tipo de evento é obrigatório.'),
  modality: z.string().min(1, 'Modalidade é obrigatória.'),
  location: z.string().min(1, 'Local é obrigatório.'),
  meetingStart: z.string().min(1, 'Início do evento é obrigatório.'),
  meetingEnd: z.string().min(1, 'Término do evento é obrigatório.'),
  hasAdditionalDays: z.boolean().default(false),
  additionalDays: z
    .array(
      z.object({
        id: z.string().optional(),
        start: z.string().min(1, 'Início é obrigatório.'),
        end: z.string().min(1, 'Término é obrigatório.'),
      }),
    )
    .min(1, 'Obrigatório'),
  hasAction: z.boolean().default(false),
  actionStart: z.string().min(1, 'Obrigatório'),
  actionEnd: z.string().min(1, 'Obrigatório'),
  actions: z
    .array(
      z.object({
        id: z.string().optional(),
        start: z.any().optional(),
        end: z.any().optional(),
        periods: z
          .array(
            z.object({
              id: z.string().optional(),
              start: z.string().min(1, 'Início é obrigatório.'),
              end: z.string().min(1, 'Término é obrigatório.'),
            }),
          )
          .optional(),
      }),
    )
    .min(1, 'Obrigatório'),
  participantsPF: z.string().min(1, 'Obrigatório'),
  participantsPJ: z.string().min(1, 'Obrigatório'),
  deliberations: z.string().min(1, 'Obrigatório'),
  description: z.string().min(1, 'Obrigatório'),
  documents: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1, 'Nome do arquivo é obrigatório.'),
        type: z.string().min(1, 'Categoria é obrigatória.'),
        url: z.string().nullish(),
      }),
    )
    .min(1, 'Obrigatório'),
})

export type FormValues = z.infer<typeof formSchema>
