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

let isSaving = false
let saveQueue: any[] = []

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
  cachedDb = null
  window.dispatchEvent(new Event('db_updated'))
}

function getLocalFallback() {
  const data = localStorage.getItem('ggim_local_cache')
  if (data) return JSON.parse(data)
  return DEFAULT_DB
}

function saveLocalFallback(data: any) {
  localStorage.setItem('ggim_local_cache', JSON.stringify(data))
}

async function processSaveQueue() {
  if (isSaving || saveQueue.length === 0) return
  isSaving = true
  const id = await getCloudDbId()

  while (saveQueue.length > 0) {
    const data = saveQueue.pop() // Take the most recent snapshot
    saveQueue = [] // Clear intermediate snapshots

    try {
      const res = await fetch(`${JSONBLOB_API}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        if (res.status === 404) {
          const createRes = await fetch(JSONBLOB_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(data),
          })
          const location = createRes.headers.get('Location')
          if (location) {
            const newId = location.split('/').pop() || id
            localStorage.setItem(SYNC_KEY, newId)
          }
        } else {
          throw new Error(`HTTP Error: ${res.status}`)
        }
      }
      saveLocalFallback(data)
    } catch (e) {
      console.error('Failed to save to cloud DB', e)
      saveLocalFallback(data)
    }
  }
  isSaving = false
}

async function saveCloudDb(data: any): Promise<void> {
  data.updatedAt = Date.now()
  cachedDb = JSON.parse(JSON.stringify(data))
  saveLocalFallback(cachedDb)

  saveQueue.push(cachedDb)
  processSaveQueue()

  window.dispatchEvent(new Event('db_updated'))
}

async function fetchCloudDb(forceFresh = false): Promise<any> {
  const id = await getCloudDbId()
  const now = Date.now()

  // If we have pending saves, return the local cache immediately to prevent overwriting local state
  if (isSaving || saveQueue.length > 0) {
    return JSON.parse(JSON.stringify(cachedDb || getLocalFallback()))
  }

  // Throttle network requests to batch concurrent loads
  if (!forceFresh && cachedDb && now - lastFetchTime < 2000) {
    return JSON.parse(JSON.stringify(cachedDb))
  }

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
          return { ...DEFAULT_DB, updatedAt: Date.now() }
        }
        throw new Error('Cloud DB not found')
      }
      return res.json()
    })
    .then((data) => {
      if (!isSaving && saveQueue.length === 0) {
        cachedDb = data
        lastFetchTime = Date.now()
        saveLocalFallback(data)
      }
      if (fetchPromise === newPromise) fetchPromise = null
      return JSON.parse(JSON.stringify(data))
    })
    .catch((e) => {
      console.warn('Cloud DB fetch failed, using local fallback', e)
      if (fetchPromise === newPromise) fetchPromise = null
      return cachedDb || getLocalFallback()
    })

  if (!forceFresh || !fetchPromise) {
    fetchPromise = newPromise
  }

  return newPromise
}

let updateMutex = Promise.resolve()

// Guaranteed atomic sequential update to avoid data loss due to race conditions
export async function atomicUpdate(updater: (db: any) => void) {
  updateMutex = updateMutex.then(async () => {
    try {
      const db = await fetchCloudDb(true)
      updater(db)
      await saveCloudDb(db)
    } catch (e) {
      console.error('Atomic update failed', e)
    }
  })
  return updateMutex
}

export const api = {
  activities: {
    list: async (forceFresh = false) => (await fetchCloudDb(forceFresh)).activities || [],
    syncUpdate: async (updater: (data: ActivityRecord[]) => ActivityRecord[]) => {
      await atomicUpdate((db) => {
        db.activities = updater(db.activities || [])
      })
    },
  },
  users: {
    list: async (forceFresh = false) => (await fetchCloudDb(forceFresh)).users || [],
    syncUpdate: async (updater: (data: User[]) => User[]) => {
      await atomicUpdate((db) => {
        db.users = updater(db.users || [])
      })
    },
  },
  video: {
    list: async (forceFresh = false) => (await fetchCloudDb(forceFresh)).videoRecords || [],
    syncUpdate: async (updater: (data: VideoRecord[]) => VideoRecord[]) => {
      await atomicUpdate((db) => {
        db.videoRecords = updater(db.videoRecords || [])
      })
    },
  },
  obs: {
    list: async (forceFresh = false) => (await fetchCloudDb(forceFresh)).obsRecords || [],
    syncUpdate: async (updater: (data: ObsRecord[]) => ObsRecord[]) => {
      await atomicUpdate((db) => {
        db.obsRecords = updater(db.obsRecords || [])
      })
    },
  },
  audit: {
    list: async (forceFresh = false) => (await fetchCloudDb(forceFresh)).auditLogs || [],
    syncUpdate: async (updater: (data: AuditLog[]) => AuditLog[]) => {
      await atomicUpdate((db) => {
        db.auditLogs = updater(db.auditLogs || [])
      })
    },
  },
}
