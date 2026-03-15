export interface Document {
  id: string
  category: string
  name: string
  url?: string
}

export interface Activity {
  id: string
  startDate: string
  endDate?: string
  instance: string
  type: string
  modality: string
  location: string
  participantsPF: number
  participantsPJ: number
  documents: Document[]
  description?: string
  createdAt: string
}
