import { ActivityRecord } from '@/lib/types'
import { User } from '@/stores/auth'
import { VideoRecord } from '@/stores/video'
import { ObsRecord } from '@/stores/obs'
import { AuditLog } from '@/stores/audit'
import { mockActivities } from '@/lib/mock-data'

const DEFAULT_DB = {
  updatedAt: 0,
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
const PRIMARY_DB_ID = import.meta.env.VITE_GLOBAL_SYNC_ID || '1351608930495815680'

let lastFetchTime = 0
let cachedDb: any = null
let fetchPromise: Promise<any> | null = null

export async function getCloudDbId(): Promise<string> {
  let id = localStorage.getItem(SYNC_KEY)
  if (!id) {
    id = PRIMARY_DB_ID
    localStorage.setItem(SYNC_KEY, id)
  }
  return id
}

export function setCloudDbId(id: string) {
  if (id) localStorage.setItem(SYNC_KEY, id)
  else localStorage.setItem(SYNC_KEY, PRIMARY_DB_ID)
  cachedDb = null // Invalidate cache
  window.dispatchEvent(new Event('db_updated'))
}

async function fetchCloudDb(forceFresh = false): Promise<any> {
  const id = await getCloudDbId()
  const now = Date.now()

  // Cache for 2 seconds to batch concurrent module fetches (Activities, Users, Video, etc)
  if (!forceFresh && cachedDb && now - lastFetchTime < 2000) return cachedDb
  if (!forceFresh && fetchPromise) return fetchPromise

  const fetchUrl = `${JSONBLOB_API}/${id}?_t=${now}`

  const newPromise = fetch(fetchUrl, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
  })
    .then(async (res) => {
      if (!res.ok) {
        if (res.status === 404) {
          // Attempt to PUT to create it at the EXACT hardcoded ID to ensure cross-device consistency
          const putRes = await fetch(`${JSONBLOB_API}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ ...DEFAULT_DB, updatedAt: Date.now() }),
          })

          if (!putRes.ok) {
            // Fallback to POST if PUT doesn't allow creation
            const createRes = await fetch(JSONBLOB_API, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
              body: JSON.stringify({ ...DEFAULT_DB, updatedAt: Date.now() }),
            })
            const location = createRes.headers.get('Location')
            if (location) {
              const newId = location.split('/').pop() || id
              localStorage.setItem(SYNC_KEY, newId)
            }
          }
          return { ...DEFAULT_DB, updatedAt: Date.now() }
        }
        throw new Error('Cloud DB not found')
      }
      return res.json()
    })
    .then((data) => {
      cachedDb = data
      lastFetchTime = Date.now()
      if (fetchPromise === newPromise) fetchPromise = null
      return data
    })
    .catch((e) => {
      console.warn('Cloud DB fetch failed, using local fallback', e)
      if (fetchPromise === newPromise) fetchPromise = null
      return getLocalFallback()
    })

  if (!forceFresh || !fetchPromise) {
    fetchPromise = newPromise
  }

  return newPromise
}

async function saveCloudDb(data: any): Promise<void> {
  const id = await getCloudDbId()
  data.updatedAt = Date.now() // Tag with timestamp for consistency checks
  cachedDb = data
  lastFetchTime = Date.now()

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
    list: async (forceFresh = false) => {
      const db = await fetchCloudDb(forceFresh)
      return db.activities || []
    },
    sync: async (data: ActivityRecord[]) => {
      const db = await fetchCloudDb()
      db.activities = data
      await saveCloudDb(db)
    },
  },
  users: {
    list: async (forceFresh = false) => {
      const db = await fetchCloudDb(forceFresh)
      return db.users || []
    },
    sync: async (data: User[]) => {
      const db = await fetchCloudDb()
      db.users = data
      await saveCloudDb(db)
    },
  },
  video: {
    list: async (forceFresh = false) => {
      const db = await fetchCloudDb(forceFresh)
      return db.videoRecords || []
    },
    sync: async (data: VideoRecord[]) => {
      const db = await fetchCloudDb()
      db.videoRecords = data
      await saveCloudDb(db)
    },
  },
  obs: {
    list: async (forceFresh = false) => {
      const db = await fetchCloudDb(forceFresh)
      return db.obsRecords || []
    },
    sync: async (data: ObsRecord[]) => {
      const db = await fetchCloudDb()
      db.obsRecords = data
      await saveCloudDb(db)
    },
  },
  audit: {
    list: async (forceFresh = false) => {
      const db = await fetchCloudDb(forceFresh)
      return db.auditLogs || []
    },
    sync: async (data: AuditLog[]) => {
      const db = await fetchCloudDb()
      db.auditLogs = data
      await saveCloudDb(db)
    },
  },
}
