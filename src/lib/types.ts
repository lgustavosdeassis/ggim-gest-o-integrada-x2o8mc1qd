export interface Document {
  id: string
  name: string
  type: string
  url?: string
}

export interface ActivityAction {
  id: string
  start: string
  end: string
}

export interface ActivityRecord {
  id: string
  instance: string
  eventType: string
  modality: string
  location: string
  meetingStart: string
  meetingEnd: string
  hasAction: boolean
  actionStart?: string
  actionEnd?: string
  actions?: ActivityAction[]
  participantsPF: string
  participantsPJ: string
  documents: Document[]
  deliberations: string
  description?: string
  createdAt: string
}
