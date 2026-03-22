export interface Document {
  id: string
  name: string
  type: string
  url?: string
}

export interface ActivityPeriod {
  id: string
  start: string
  end: string
}

export interface ActivityAction {
  id: string
  start?: string
  end?: string
  periods?: ActivityPeriod[]
}

export interface ActivityRecord {
  id: string
  eventName?: string
  instance: string
  eventType: string
  modality: string
  location: string
  meetingStart: string
  meetingEnd: string
  hasAdditionalDays?: boolean
  additionalDays?: ActivityPeriod[]
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
