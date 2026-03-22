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
const PRIMARY_DB_ID = import.meta.env.VITE_GLOBAL_SYNC_ID || '1351608930495815680'

let isSaving = false
let memoryDb: any = null
let fetchPromise: Promise<any> | null = null
let updateMutex = Promise.resolve()

// Centralized Session Identity strictly isolated from local/session storage to enforce resilience and compliance
let activeSyncId: string | null = null

export async function getCloudDbId(): Promise<string> {
  if (!activeSyncId) {
    activeSyncId = PRIMARY_DB_ID
  }
  return activeSyncId
}

export function setCloudDbId(id: string) {
  activeSyncId = id || PRIMARY_DB_ID
  memoryDb = null
  window.dispatchEvent(new Event('db_updated'))
}

// Resilient Fetch with built-in retries, exponential backoff, and advanced exception handling
async function fetchStrict(
  id: string,
  retries = 3,
  throwOnFailure = false,
  attempt = 0,
): Promise<any> {
  try {
    let res: Response | undefined

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 12000)

    try {
      res = await fetch(`${JSONBLOB_API}/${id}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
    } catch (fetchErr: any) {
      clearTimeout(timeoutId)
      // Catch core network exceptions ensuring UI won't hard crash
      const errorMsg =
        fetchErr?.name === 'AbortError'
          ? 'Server Timeout'
          : fetchErr?.message || 'Network disconnected'
      throw new Error(`TypeError: Failed to fetch (${errorMsg})`)
    }

    if (!res || !res.ok) {
      const status = res ? res.status : 'N/A'
      if (status === 404)
        return JSON.parse(JSON.stringify({ ...DEFAULT_DB, updatedAt: Date.now() }))
      throw new Error(`HTTP ${status === 'N/A' ? 'N/A' : `Error: ${status}`}`)
    }

    const text = await res.text()
    return text
      ? JSON.parse(text)
      : JSON.parse(JSON.stringify({ ...DEFAULT_DB, updatedAt: Date.now() }))
  } catch (e: any) {
    // Intelligent Backoff: At least 3 automatic retry attempts with exponential backoff strategy
    if (retries > 0) {
      const delay = 1000 * Math.pow(2, attempt)
      await new Promise((r) => setTimeout(r, delay))
      return fetchStrict(id, retries - 1, throwOnFailure, attempt + 1)
    }

    if (throwOnFailure) {
      throw e
    }

    console.warn(
      `Network issue intercepted by fetchStrict [${e?.message || 'Unknown'}], returning resilient fallback state`,
      e,
    )
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
      return await fetchStrict(id, 3, false)
    } catch (e) {
      console.warn('Network issue during background fetch setup, using resilient fallback state', e)
      return memoryDb
        ? JSON.parse(JSON.stringify(memoryDb))
        : JSON.parse(JSON.stringify({ ...DEFAULT_DB, updatedAt: Date.now() }))
    }
  })()
    .then((data) => {
      if (!isSaving && data) memoryDb = data
      if (fetchPromise === p) fetchPromise = null
      return data || JSON.parse(JSON.stringify({ ...DEFAULT_DB, updatedAt: Date.now() }))
    })
    .catch((e) => {
      console.error('Unhandled failure in fetchCloudDb', e)
      if (fetchPromise === p) fetchPromise = null
      return memoryDb
        ? JSON.parse(JSON.stringify(memoryDb))
        : JSON.parse(JSON.stringify({ ...DEFAULT_DB, updatedAt: Date.now() }))
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
          // Strictly fetch latest state, ensuring write conflicts won't arise from stale memory DB
          const db = await fetchStrict(id, 3, true)

          updater(db)
          db.updatedAt = Date.now()

          const doPut = async (r = 3): Promise<Response> => {
            try {
              let putRes: Response | undefined
              try {
                putRes = await fetch(`${JSONBLOB_API}/${id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                  body: JSON.stringify(db),
                })
              } catch (e) {
                throw new Error('Network error during PUT')
              }
              if (!putRes || (!putRes.ok && putRes.status !== 404)) {
                throw new Error(`HTTP ${putRes ? putRes.status : 'N/A'}`)
              }
              return putRes
            } catch (e) {
              if (r > 0) {
                await new Promise((res) => setTimeout(res, 1000 + (3 - r) * 500))
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
              activeSyncId = newId
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
