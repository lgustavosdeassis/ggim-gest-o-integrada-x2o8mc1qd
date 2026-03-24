import { ActivityRecord } from '@/lib/types'
import { User } from '@/stores/auth'
import { VideoRecord } from '@/stores/video'
import { ObsRecord } from '@/stores/obs'
import { AuditLog } from '@/stores/audit'
import { mockActivities } from '@/lib/mock-data'

const DEFAULT_DB = {
  updatedAt: 1774330115950,
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
      id: '8omuofn',
      name: 'L. Gustavo S. de Assis',
      email: 'ggim.ctfoz@gmail.com',
      password: 'ggim.ctfoz',
      role: 'editor',
      avatarUrl: '',
      jobTitle: 'Editor',
    },
    {
      id: 'mtwee1b',
      name: 'Stephany',
      email: 'estagiariosggimfoz@gmail.com',
      password: 'ggim.2026',
      role: 'editor',
      avatarUrl: '',
      jobTitle: 'Editor',
    },
  ] as User[],
  videoRecords: [
    { id: 'v1', date: '2026-02', particulares: 3, instituicoes: 7, imprensa: 0, operadores: 21 },
    {
      id: 'et182rjru',
      date: '2026-01',
      particulares: 2,
      instituicoes: 6,
      imprensa: 1,
      operadores: 23,
    },
  ] as VideoRecord[],
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
  ] as ObsRecord[],
  auditLogs: [
    {
      id: 't0r3yip',
      userName: 'Gestor GGIM',
      userEmail: 'admin@ggim.foz.br',
      action: 'Excluiu 3 atividades em lote do histórico',
      timestamp: '2026-03-24T02:48:24.013Z',
    },
    {
      id: 'liz8e04',
      userName: 'Gestor GGIM',
      userEmail: 'admin@ggim.foz.br',
      action: 'Cadastrou o novo usuário: estagiariosggimfoz@gmail.com (editor)',
      timestamp: '2026-03-24T02:48:13.549Z',
    },
  ] as AuditLog[],
}

// Native Skip Cloud instance configuration
const GLOBAL_SYNC_ID = (import.meta.env.VITE_GLOBAL_SYNC_ID || '1351608930495815680').trim()
const SKIP_CLOUD_API = '/api/collections/ggim_data/records'
const LOCAL_STORAGE_DB_KEY = 'ggim_pocketbase_cache'

let isSaving = false
let memoryDb: any = null
let fetchPromise: Promise<any> | null = null
let updateMutex = Promise.resolve()

let consecutiveFailures = 0
const MAX_FAILURES = 3
const CIRCUIT_TIMEOUT = 15000
let lastFailureTime = 0

function isCircuitOpen() {
  if (consecutiveFailures >= MAX_FAILURES) {
    if (Date.now() - lastFailureTime > CIRCUIT_TIMEOUT) {
      consecutiveFailures = 0
      return false
    }
    return true
  }
  return false
}

export async function getCloudDbId(): Promise<string> {
  return GLOBAL_SYNC_ID
}

export function setCloudDbId(id: string) {
  window.dispatchEvent(new Event('db_updated'))
}

function getFallbackDb() {
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_DB_KEY)
    if (cached) {
      return JSON.parse(cached)
    }
  } catch (e) {
    console.warn('[Safe Mode] Failed to parse cached DB', e)
  }
  return memoryDb ? JSON.parse(JSON.stringify(memoryDb)) : JSON.parse(JSON.stringify(DEFAULT_DB))
}

function cleanDb(db: any) {
  if (db.users) db.users = Array.from(new Map(db.users.map((u: any) => [u.id, u])).values())
  if (db.auditLogs)
    db.auditLogs = Array.from(new Map(db.auditLogs.map((l: any) => [l.id, l])).values())
  if (db.activities)
    db.activities = Array.from(new Map(db.activities.map((a: any) => [a.id, a])).values())
  if (db.videoRecords)
    db.videoRecords = Array.from(new Map(db.videoRecords.map((v: any) => [v.id, v])).values())
  if (db.obsRecords)
    db.obsRecords = Array.from(new Map(db.obsRecords.map((o: any) => [o.id, o])).values())
  return db
}

async function fetchStrict(retries = 2, throwOnFailure = false, attempt = 0): Promise<any> {
  if (isCircuitOpen()) {
    if (throwOnFailure) {
      throw new Error('Safe Mode Fallback: Circuit Breaker Open')
    }
    return getFallbackDb()
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)

    let res: Response | undefined
    try {
      res = await fetch(`${SKIP_CLOUD_API}/${GLOBAL_SYNC_ID}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
    } catch (fetchErr: any) {
      clearTimeout(timeoutId)
      throw new Error(`Failed to fetch: ${fetchErr?.message || 'Network disconnected'}`)
    }

    if (res?.status === 404) {
      return getFallbackDb()
    }

    if (!res || !res.ok) {
      throw new Error(`HTTP ${res ? res.status : 'N/A'}`)
    }

    const json = await res.json()
    consecutiveFailures = 0

    let dbData = json
    if (json?.data) {
      dbData = json.data
    } else if (json?.items && Array.isArray(json.items) && json.items.length > 0) {
      dbData = json.items[0].data || json.items[0]
    }

    if (dbData && Object.keys(dbData).length > 0) {
      dbData = cleanDb(dbData)
      try {
        localStorage.setItem(LOCAL_STORAGE_DB_KEY, JSON.stringify(dbData))
      } catch (e) {
        // Ignore quota issues
      }
      return dbData
    }
    return getFallbackDb()
  } catch (e: any) {
    if (retries > 0) {
      const delay = 500 * Math.pow(1.5, attempt)
      await new Promise((r) => setTimeout(r, delay))
      return fetchStrict(retries - 1, throwOnFailure, attempt + 1)
    }

    consecutiveFailures++
    lastFailureTime = Date.now()

    if (throwOnFailure) {
      throw new Error('Safe Mode Fallback: Network failure intercepted')
    }

    console.warn('[Bug Scanner Guard] Cloud sync fetch failed. Activating Safe Mode.', e.message)
    return getFallbackDb()
  }
}

async function fetchCloudDb(forceFresh = false): Promise<any> {
  if ((isSaving || !forceFresh) && memoryDb) return JSON.parse(JSON.stringify(memoryDb))
  if (!forceFresh && fetchPromise) return fetchPromise

  const p = (async () => {
    try {
      return await fetchStrict(2, false)
    } catch (e) {
      return getFallbackDb()
    }
  })()
    .then((data) => {
      if (!isSaving && data) memoryDb = data
      if (fetchPromise === p) fetchPromise = null
      return data || getFallbackDb()
    })
    .catch(() => {
      if (fetchPromise === p) fetchPromise = null
      return getFallbackDb()
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
          const db = getFallbackDb()
          updater(db)
          db.updatedAt = Date.now()
          const cleanedDb = cleanDb(db)

          memoryDb = JSON.parse(JSON.stringify(cleanedDb))
          try {
            localStorage.setItem(LOCAL_STORAGE_DB_KEY, JSON.stringify(cleanedDb))
          } catch (e) {
            console.warn('Local storage quota exceeded. Relying on cloud and memory db.', e)
          }

          window.dispatchEvent(new Event('db_updated'))

          if (!isCircuitOpen()) {
            try {
              const controller = new AbortController()
              const timeoutId = setTimeout(() => controller.abort(), 8000)

              const payload = { id: GLOBAL_SYNC_ID, data: cleanedDb }

              // Try standard PocketBase PATCH to item endpoint
              let res = await fetch(`${SKIP_CLOUD_API}/${GLOBAL_SYNC_ID}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({ data: cleanedDb }),
                signal: controller.signal,
              }).catch(() => null)

              // If 405 or 404, try PATCH to the collection root (Custom endpoint support)
              if (!res || res.status === 404 || res.status === 405) {
                res = await fetch(SKIP_CLOUD_API, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                  body: JSON.stringify(payload),
                  signal: controller.signal,
                }).catch(() => null)
              }

              // Finally, try POST to collection root if the above still yield 405 or 404
              if (!res || res.status === 404 || res.status === 405) {
                res = await fetch(SKIP_CLOUD_API, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                  body: JSON.stringify(payload),
                  signal: controller.signal,
                }).catch(() => null)
              }

              clearTimeout(timeoutId)

              if (!res || !res.ok) {
                throw new Error(`Sync error: ${res ? res.status : 'Network Error'}`)
              }
            } catch (e) {
              consecutiveFailures++
              lastFailureTime = Date.now()
            }
          }

          resolve()
        } catch (e: any) {
          console.warn('[Bug Scanner Guard] Sync update failed natively.', e)
          reject(new Error('Safe Mode Fallback: Synchronization delayed'))
        } finally {
          isSaving = false
        }
      })
      .catch(() => {
        reject(new Error('Safe Mode Fallback: Mutex rejected'))
      })
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

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === LOCAL_STORAGE_DB_KEY) {
      memoryDb = null
      window.dispatchEvent(new Event('db_updated'))
    }
  })
}
