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
  'CMTEC AIFU',
  'CMTEC PVC',
  'CMTEC PVCCA/RP',
  'CMTEC PVCM/CMDM',
  'CMTEC TRAN/PVT',
  'CMTEC MA',
  'CMTEC AP/COMUD',
  'CMTEC ETP',
]

export const EVENT_TYPES = [
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

export const DOCUMENT_CATEGORIES = [
  'Ofício',
  'Ata',
  'Relatório',
  'Email',
  'SID',
  'Transcrição',
  'Outros',
]
