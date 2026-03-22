import * as z from 'zod'

export const formSchema = z.object({
  instance: z.string().min(1, 'Obrigatório'),
  eventType: z.string().min(1, 'Obrigatório'),
  modality: z.string().min(1, 'Obrigatório'),
  location: z.string().min(1, 'Obrigatório'),
  meetingStart: z.string().min(1, 'Obrigatório'),
  meetingEnd: z.string().min(1, 'Obrigatório'),
  hasAdditionalDays: z.boolean().default(false),
  additionalDays: z
    .array(
      z.object({
        id: z.string().optional(),
        start: z.string().min(1, 'Obrigatório'),
        end: z.string().min(1, 'Obrigatório'),
      }),
    )
    .default([]),
  hasAction: z.boolean().default(false),
  actions: z
    .array(
      z.object({
        id: z.string().optional(),
        periods: z
          .array(
            z.object({
              id: z.string().optional(),
              start: z.string().min(1, 'Obrigatório'),
              end: z.string().min(1, 'Obrigatório'),
            }),
          )
          .default([]),
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
        url: z.string().optional(),
      }),
    )
    .optional(),
})

export type FormValues = z.infer<typeof formSchema>

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
]

export const EVENTOS_TIPO = [
  'Reunião Ordinária',
  'Reunião Extraordinária',
  'Reunião Institucional',
  'Seminário',
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

export const DOC_TYPES = [
  'Ata',
  'Ofício',
  'Relatório',
  'Transcrição',
  'E-mail',
  'SID',
  'Formulário',
  'Imagens',
  'Áudio',
  'Lista de Presença',
  'Outros',
]
