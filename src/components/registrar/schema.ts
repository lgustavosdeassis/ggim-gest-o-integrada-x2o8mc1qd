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
  eventName: z.string().nullish(),
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
    .optional(),
  hasAction: z.boolean().default(false),
  actionStart: z.string().nullish(),
  actionEnd: z.string().nullish(),
  actions: z
    .array(
      z.object({
        id: z.string().optional(),
        start: z.string().nullish(),
        end: z.string().nullish(),
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
    .optional(),
  participantsPF: z.string().nullish(),
  participantsPJ: z.string().nullish(),
  deliberations: z.string().nullish(),
  documents: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1, 'Nome do arquivo é obrigatório.'),
        type: z.string().min(1, 'Categoria é obrigatória.'),
        url: z.string().nullish(),
      }),
    )
    .optional(),
})

export type FormValues = z.infer<typeof formSchema>
