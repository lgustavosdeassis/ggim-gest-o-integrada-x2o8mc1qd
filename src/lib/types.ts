export interface Document {
  id: string
  name: string
  categories: string[]
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
  participantsPF: string
  participantsPJ: string
  documents: Document[]
  deliberations: string
  description?: string
  createdAt: string
}
