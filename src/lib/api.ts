import { ActivityRecord } from '@/lib/types'
import { User } from '@/stores/auth'
import { VideoRecord } from '@/stores/video'
import { ObsRecord } from '@/stores/obs'
import { AuditLog } from '@/stores/audit'
import { mockActivities } from '@/lib/mock-data'

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.ggim.foz.br/v1'

// Mock Backend Implementation
// This ensures that the system works across the same session or browser seamlessly,
// acting as a simulated "Centralized Database" when a real server is unavailable.
// Real API calls are always attempted first.
const MOCK_DB_KEY = 'ggim_central_db_mock'

const DEFAULT_DB = {
  activities: mockActivities,
  users: [
    {
      id: '1',
      email: 'admin@ggim.foz.br',
      password: 'admin',
      role: 'owner',
      name: 'Gestor GGIM',
      jobTitle: 'Proprietário',
    },
    {
      id: '2',
      email: 'editor@ggim.foz.br',
      password: 'editor',
      role: 'editor',
      name: 'Editor GGIM',
      jobTitle: 'Editor',
    },
    {
      id: '3',
      email: 'viewer@ggim.foz.br',
      password: 'viewer',
      role: 'viewer',
      name: 'Visualizador GGIM',
      jobTitle: 'Visualizador',
    },
  ],
  videoRecords: [
    {
      id: 'v1',
      date: '2026-02',
      particulares: 3,
      instituicoes: 7,
      imprensa: 0,
      operadores: 21,
    },
  ],
  obsRecords: [
    {
      id: 'o1',
      date: '2026-02',
      sinistrosVitimas: 58,
      sinistrosTotal: 324,
      autosInfracao: 16716,
      homicidios: 4,
      violenciaDomestica: 244,
      roubos: 89,
    },
  ],
  auditLogs: [] as AuditLog[],
}

function getMockDb() {
  const data = localStorage.getItem(MOCK_DB_KEY)
  if (data) return JSON.parse(data)
  localStorage.setItem(MOCK_DB_KEY, JSON.stringify(DEFAULT_DB))
  return DEFAULT_DB
}

function saveMockDb(db: any) {
  localStorage.setItem(MOCK_DB_KEY, JSON.stringify(db))
  // Emit event to trigger global synchronization across the prototype
  window.dispatchEvent(new Event('db_updated'))
}

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms))

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })
    if (!res.ok) throw new Error('Network response was not ok')
    return await res.json()
  } catch (error) {
    // FALLBACK TO MOCK API
    // Prevents empty states and simulates a real centralized backend
    await delay()
    const db = getMockDb()
    const isGet = !options || options.method === 'GET'

    if (endpoint.includes('/activities')) {
      if (!isGet && options?.body) {
        db.activities = JSON.parse(options.body as string)
        saveMockDb(db)
      }
      return db.activities as T
    }
    if (endpoint.includes('/users')) {
      if (!isGet && options?.body) {
        db.users = JSON.parse(options.body as string)
        saveMockDb(db)
      }
      return db.users as T
    }
    if (endpoint.includes('/video')) {
      if (!isGet && options?.body) {
        db.videoRecords = JSON.parse(options.body as string)
        saveMockDb(db)
      }
      return db.videoRecords as T
    }
    if (endpoint.includes('/obs')) {
      if (!isGet && options?.body) {
        db.obsRecords = JSON.parse(options.body as string)
        saveMockDb(db)
      }
      return db.obsRecords as T
    }
    if (endpoint.includes('/audit')) {
      if (!isGet && options?.body) {
        db.auditLogs = JSON.parse(options.body as string)
        saveMockDb(db)
      }
      return db.auditLogs as T
    }

    throw new Error('Endpoint not mocked')
  }
}

export const api = {
  activities: {
    list: () => request<ActivityRecord[]>('/activities'),
    sync: (data: ActivityRecord[]) =>
      request<void>('/activities', { method: 'POST', body: JSON.stringify(data) }),
  },
  users: {
    list: () => request<User[]>('/users'),
    sync: (data: User[]) => request<void>('/users', { method: 'POST', body: JSON.stringify(data) }),
  },
  video: {
    list: () => request<VideoRecord[]>('/video'),
    sync: (data: VideoRecord[]) =>
      request<void>('/video', { method: 'POST', body: JSON.stringify(data) }),
  },
  obs: {
    list: () => request<ObsRecord[]>('/obs'),
    sync: (data: ObsRecord[]) =>
      request<void>('/obs', { method: 'POST', body: JSON.stringify(data) }),
  },
  audit: {
    list: () => request<AuditLog[]>('/audit'),
    sync: (data: AuditLog[]) =>
      request<void>('/audit', { method: 'POST', body: JSON.stringify(data) }),
  },
}
