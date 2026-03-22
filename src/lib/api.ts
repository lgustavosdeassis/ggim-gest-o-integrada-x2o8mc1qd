import { ActivityRecord } from '@/lib/types'
import { User } from '@/stores/auth'
import { VideoRecord } from '@/stores/video'
import { ObsRecord } from '@/stores/obs'
import { AuditLog } from '@/stores/audit'
import { mockActivities } from '@/lib/mock-data'

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

// Global Centralized Database Implementation using JSONBlob to ensure real-time cross-device sync
const JSONBLOB_API = 'https://jsonblob.com/api/jsonBlob'
const SYNC_KEY = 'ggim_cloud_sync_id'

let lastFetchTime = 0
let cachedDb: any = null
let fetchPromise: Promise<any> | null = null

export async function getCloudDbId(): Promise<string> {
  let id = localStorage.getItem(SYNC_KEY)
  if (!id) id = import.meta.env.VITE_GLOBAL_SYNC_ID || null

  if (!id) {
    try {
      const res = await fetch(JSONBLOB_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(DEFAULT_DB),
      })
      const location = res.headers.get('Location')
      if (location) {
        id = location.split('/').pop() || null
        if (id) localStorage.setItem(SYNC_KEY, id)
      } else {
        console.warn(
          'No Location header returned, fallback may be used across devices without manual sync code.',
        )
      }
    } catch (e) {
      console.error('Failed to initialize cloud DB', e)
    }
  }
  return id || 'fallback_local'
}

export function setCloudDbId(id: string) {
  if (id) localStorage.setItem(SYNC_KEY, id)
  else localStorage.removeItem(SYNC_KEY)
  cachedDb = null // Invalidate cache
  window.dispatchEvent(new Event('db_updated'))
}

async function fetchCloudDb(): Promise<any> {
  const id = await getCloudDbId()
  if (id === 'fallback_local') return getLocalFallback()

  const now = Date.now()
  // Cache for 2 seconds to batch concurrent module fetches (Activities, Users, Video, etc)
  if (cachedDb && now - lastFetchTime < 2000) return cachedDb
  if (fetchPromise) return fetchPromise

  fetchPromise = fetch(`${JSONBLOB_API}/${id}`)
    .then((res) => {
      if (!res.ok) throw new Error('Cloud DB not found')
      return res.json()
    })
    .then((data) => {
      cachedDb = data
      lastFetchTime = Date.now()
      fetchPromise = null
      return data
    })
    .catch((e) => {
      console.warn('Cloud DB fetch failed, using local fallback', e)
      fetchPromise = null
      return getLocalFallback()
    })

  return fetchPromise
}

async function saveCloudDb(data: any): Promise<void> {
  const id = await getCloudDbId()
  cachedDb = data
  lastFetchTime = Date.now()

  if (id === 'fallback_local') {
    saveLocalFallback(data)
    return
  }

  try {
    await fetch(`${JSONBLOB_API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
    })
    saveLocalFallback(data)
    window.dispatchEvent(new Event('db_updated'))
  } catch (e) {
    console.error('Failed to save to cloud DB', e)
    saveLocalFallback(data)
  }
}

function getLocalFallback() {
  const data = localStorage.getItem('ggim_local_cache')
  if (data) return JSON.parse(data)
  return DEFAULT_DB
}

function saveLocalFallback(data: any) {
  localStorage.setItem('ggim_local_cache', JSON.stringify(data))
}

export const api = {
  activities: {
    list: async () => {
      const db = await fetchCloudDb()
      return db.activities || []
    },
    sync: async (data: ActivityRecord[]) => {
      const db = await fetchCloudDb()
      db.activities = data
      await saveCloudDb(db)
    },
  },
  users: {
    list: async () => {
      const db = await fetchCloudDb()
      return db.users || []
    },
    sync: async (data: User[]) => {
      const db = await fetchCloudDb()
      db.users = data
      await saveCloudDb(db)
    },
  },
  video: {
    list: async () => {
      const db = await fetchCloudDb()
      return db.videoRecords || []
    },
    sync: async (data: VideoRecord[]) => {
      const db = await fetchCloudDb()
      db.videoRecords = data
      await saveCloudDb(db)
    },
  },
  obs: {
    list: async () => {
      const db = await fetchCloudDb()
      return db.obsRecords || []
    },
    sync: async (data: ObsRecord[]) => {
      const db = await fetchCloudDb()
      db.obsRecords = data
      await saveCloudDb(db)
    },
  },
  audit: {
    list: async () => {
      const db = await fetchCloudDb()
      return db.auditLogs || []
    },
    sync: async (data: AuditLog[]) => {
      const db = await fetchCloudDb()
      db.auditLogs = data
      await saveCloudDb(db)
    },
  },
}
