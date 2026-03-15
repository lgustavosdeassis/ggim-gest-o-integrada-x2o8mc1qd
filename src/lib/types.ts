export type Modality = 'Presencial' | 'Remota' | 'Híbrida'

export interface ActivityRecord {
  id: string
  instance: string
  eventType: string
  modality: Modality
  location: string
  meetingStart: string // ISO string
  meetingEnd: string // ISO string
  hasAction: boolean
  actionStart?: string
  actionEnd?: string
  participantsPF: string // semicolon separated
  participantsPJ: string // semicolon separated
  deliberations: string // semicolon separated
  documentCategories: string[]
  documentDetails: string
  files: string[]
  createdAt: string
}

export interface DashboardFilters {
  startDate: string
  endDate: string
  instances: string[]
}

export const INSTANCES = [
  'Colegiado Pleno',
  'Eventos Institucionais',
  'CMTEC Segurança Integrada',
  'CMTEC Prevenção à Violência',
  'CMTEC Inteligência e Dados',
  'CMTEC Fiscalização',
  'CMTEC Trânsito e Mobilidade',
  'CMTEC Defesa Civil',
  'CMTEC Meio Ambiente',
  'CMTEC Fronteiras',
]

export const EVENT_TYPES = [
  'Reunião Ordinária',
  'Reunião Extraordinária',
  'Operação Integrada',
  'Capacitação',
  'Fórum',
  'Seminário',
  'Audiência Pública',
  'Grupo de Trabalho',
  'Visita Técnica',
  'Outros',
]

export const DOCUMENT_CATEGORIES = [
  'Ofício',
  'Ata',
  'Relatório',
  'SID (Solicitação de Intervenção)',
  'Termo de Compromisso',
  'Nota Técnica',
  'Edital',
  'Outros',
]
