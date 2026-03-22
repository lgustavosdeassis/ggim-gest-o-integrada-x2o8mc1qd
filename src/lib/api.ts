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
    { id: 'v1', date: '2026-02', particulares: 3, instituicoes: 7, imprensa: 0, operadores: 21 },
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

const JSONBLOB_API = 'https://jsonblob.com/api/jsonBlob'
const SYNC_KEY = 'ggim_cloud_sync_id'
const PRIMARY_DB_ID = import.meta.env.VITE_GLOBAL_SYNC_ID || '1351608930495815680'

let isSaving = false
let memoryDb: any = null
let fetchPromise: Promise<any> | null = null
let updateMutex = Promise.resolve()

export async function getCloudDbId(): Promise<string> {
  let id = localStorage.getItem(SYNC_KEY)
  if (!id) {
    id = PRIMARY_DB_ID
    localStorage.setItem(SYNC_KEY, id)
  }
  return id
}

export function setCloudDbId(id: string) {
  localStorage.setItem(SYNC_KEY, id || PRIMARY_DB_ID)
  memoryDb = null
  window.dispatchEvent(new Event('db_updated'))
}

async function fetchStrict(id: string, retries = 2, throwOnFailure = false): Promise<any> {
  try {
    const res = await fetch(`${JSONBLOB_API}/${id}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) {
      if (res.status === 404)
        return JSON.parse(JSON.stringify({ ...DEFAULT_DB, updatedAt: Date.now() }))
      throw new Error(`HTTP Error: ${res.status}`)
    }
    const text = await res.text()
    return text
      ? JSON.parse(text)
      : JSON.parse(JSON.stringify({ ...DEFAULT_DB, updatedAt: Date.now() }))
  } catch (e) {
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, 800))
      return fetchStrict(id, retries - 1, throwOnFailure)
    }

    if (throwOnFailure) {
      throw e
    }

    console.warn('Network issue intercepted by fetchStrict, returning resilient fallback state', e)
    return memoryDb
      ? JSON.parse(JSON.stringify(memoryDb))
      : JSON.parse(JSON.stringify({ ...DEFAULT_DB, updatedAt: Date.now() }))
  }
}

async function fetchCloudDb(forceFresh = false): Promise<any> {
  if ((isSaving || !forceFresh) && memoryDb) return JSON.parse(JSON.stringify(memoryDb))
  if (!forceFresh && fetchPromise) return fetchPromise

  const p = (async () => {
    try {
      const id = await getCloudDbId()
      return await fetchStrict(id, 2, false)
    } catch (e) {
      console.warn('Network issue during background fetch setup, using resilient fallback state', e)
      return memoryDb
        ? JSON.parse(JSON.stringify(memoryDb))
        : JSON.parse(JSON.stringify({ ...DEFAULT_DB, updatedAt: Date.now() }))
    }
  })().then((data) => {
    if (!isSaving && data) memoryDb = data
    if (fetchPromise === p) fetchPromise = null
    return data || JSON.parse(JSON.stringify({ ...DEFAULT_DB, updatedAt: Date.now() }))
  })

  if (!forceFresh || !fetchPromise) fetchPromise = p
  return p
}

export async function atomicUpdate(updater: (db: any) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    updateMutex = updateMutex
      .then(async () => {
        isSaving = true
        try {
          const id = await getCloudDbId()
          // Strictly fetch latest to prevent overwriting cloud state with a stale memory state
          const db = await fetchStrict(id, 3, true)

          updater(db)
          db.updatedAt = Date.now()

          const doPut = async (r = 2): Promise<Response> => {
            try {
              const res = await fetch(`${JSONBLOB_API}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify(db),
              })
              if (!res.ok && res.status !== 404) throw new Error(`HTTP ${res.status}`)
              return res
            } catch (e) {
              if (r > 0) {
                await new Promise((res) => setTimeout(res, 800))
                return doPut(r - 1)
              }
              throw e
            }
          }

          const res = await doPut()
          if (res.status === 404) {
            const createRes = await fetch(JSONBLOB_API, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
              body: JSON.stringify(db),
            })
            if (createRes.ok) {
              const newId = createRes.headers.get('Location')?.split('/').pop() || id
              localStorage.setItem(SYNC_KEY, newId)
            } else {
              throw new Error('DB Recreation Failed')
            }
          }

          memoryDb = JSON.parse(JSON.stringify(db))
          resolve()
        } catch (e) {
          console.error('Atomic update failed to synchronize', e)
          reject(e)
        } finally {
          isSaving = false
        }
      })
      .catch(reject)
  })
}

export const api = {
  activities: {
    list: async (force = false) => (await fetchCloudDb(force)).activities || [],
    syncUpdate: async (upd: (d: ActivityRecord[]) => ActivityRecord[]) =>
      atomicUpdate((db) => {
        db.activities = upd(db.activities || [])
      }),
  },
  users: {
    list: async (force = false) => (await fetchCloudDb(force)).users || [],
    syncUpdate: async (upd: (d: User[]) => User[]) =>
      atomicUpdate((db) => {
        db.users = upd(db.users || [])
      }),
  },
  video: {
    list: async (force = false) => (await fetchCloudDb(force)).videoRecords || [],
    syncUpdate: async (upd: (d: VideoRecord[]) => VideoRecord[]) =>
      atomicUpdate((db) => {
        db.videoRecords = upd(db.videoRecords || [])
      }),
  },
  obs: {
    list: async (force = false) => (await fetchCloudDb(force)).obsRecords || [],
    syncUpdate: async (upd: (d: ObsRecord[]) => ObsRecord[]) =>
      atomicUpdate((db) => {
        db.obsRecords = upd(db.obsRecords || [])
      }),
  },
  audit: {
    list: async (force = false) => (await fetchCloudDb(force)).auditLogs || [],
    syncUpdate: async (upd: (d: AuditLog[]) => AuditLog[]) =>
      atomicUpdate((db) => {
        db.auditLogs = upd(db.auditLogs || [])
      }),
  },
}
