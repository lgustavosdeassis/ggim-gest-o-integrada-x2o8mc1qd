import type { DatabaseProvider } from '../types'

// Mock Supabase provider since direct SDK isn't present, designed to fail gracefully
// to showcase provider priority detection falling back to Skip or Local
export const supabaseProvider: DatabaseProvider = {
  name: 'Supabase',
  async connect() {
    return false // Simulating disconnected state
  },
  async getList() {
    return { page: 1, perPage: 0, totalItems: 0, totalPages: 0, items: [] }
  },
  async getFullList() {
    return []
  },
  async getOne() {
    throw new Error('Not connected to Supabase')
  },
  async create() {
    throw new Error('Not connected to Supabase')
  },
  async update() {
    throw new Error('Not connected to Supabase')
  },
  async delete() {
    throw new Error('Not connected to Supabase')
  },
  async subscribe() {
    return () => {}
  },
  getFileUrl() {
    return ''
  },
}
