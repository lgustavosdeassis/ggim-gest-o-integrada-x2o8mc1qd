export interface Profile {
  id: string
  email: string
  name: string | null
  role: string
  is_admin: boolean
  status: string
  created_at: string
  avatar_url?: string | null
  job_title?: string | null
  can_generate_reports?: boolean
  can_delete_reports?: boolean
  allowed_tabs?: string[] | null
}

export interface User {
  id: string
  email: string
  profile?: Profile
}

export interface Document {
  id?: string
  name: string
  type: string
  url?: string | null
}

export interface ActivityRecord {
  id: string
  eventName?: string | null
  instance: string
  eventType: string
  modality: string
  location: string
  meetingStart: string
  meetingEnd: string
  hasAdditionalDays: boolean
  additionalDays?: { id?: string; start: string; end: string }[]
  hasAction: boolean
  actionStart?: string | null
  actionEnd?: string | null
  actions?: {
    id?: string
    start?: string | null
    end?: string | null
    periods?: { id?: string; start: string; end: string }[]
  }[]
  participantsPF: string
  participantsPJ: string
  deliberations: string
  documents?: Document[]
  createdAt?: string
}
