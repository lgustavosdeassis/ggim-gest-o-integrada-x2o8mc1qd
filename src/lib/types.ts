export interface Profile {
  id: string
  email: string
  name: string | null
  role: string
  is_admin: boolean
  status: string
  created_at: string
  avatar_url?: string | null
}

export interface User {
  id: string
  email: string
  profile?: Profile
}
