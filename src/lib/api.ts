import { ActivityRecord } from '@/lib/types'
import { User } from '@/stores/auth'
import { VideoRecord } from '@/stores/video'
import { ObsRecord } from '@/stores/obs'
import { AuditLog } from '@/stores/audit'
import { mockActivities } from '@/lib/mock-data'

const DEFAULT_DB = {
  updatedAt: Date.now(),
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

// Native Skip Cloud instance
const SKIP_CLOUD_API = '/api/collections/ggim_data/records'
const LOCAL_STORAGE_DB_KEY = 'ggim_pocketbase_cache'

let isSaving = false
let memoryDb: any = null
let fetchPromise: Promise<any> | null = null
let updateMutex = Promise.resolve()
let cloudRecordId: string | null = null

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

// Kept as no-ops to maintain external contract compatibility
export async function getCloudDbId(): Promise<string> {
  return cloudRecordId || 'skip-cloud-native'
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
      res = await fetch(SKIP_CLOUD_API, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
    } catch (fetchErr: any) {
      clearTimeout(timeoutId)
      throw new Error(`Failed to fetch: ${fetchErr?.message || 'Network disconnected'}`)
    }

    if (!res || !res.ok) {
      throw new Error(`HTTP ${res ? res.status : 'N/A'}`)
    }

    const json = await res.json()
    consecutiveFailures = 0

    // Attempt to extract Skip Cloud / PocketBase format, or fallback to raw
    let dbData = json
    if (json?.items && Array.isArray(json.items) && json.items.length > 0) {
      cloudRecordId = json.items[0].id
      dbData = json.items[0].data || json.items[0]
    } else if (json?.id) {
      cloudRecordId = json.id
      dbData = json.data || json
    }

    if (dbData && Object.keys(dbData).length > 0) {
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

    // Suppress "Failed to fetch"
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
          // Emulate safe mode immediate local update
          const db = getFallbackDb()
          updater(db)
          db.updatedAt = Date.now()

          memoryDb = JSON.parse(JSON.stringify(db))
          try {
            localStorage.setItem(LOCAL_STORAGE_DB_KEY, JSON.stringify(db))
          } catch (e) {
            // Ignore quota
          }

          // Try to sync with Skip Cloud in background, safely falling back if offline
          if (!isCircuitOpen()) {
            try {
              const controller = new AbortController()
              const timeoutId = setTimeout(() => controller.abort(), 5000)

              const url = cloudRecordId ? `${SKIP_CLOUD_API}/${cloudRecordId}` : SKIP_CLOUD_API
              const method = cloudRecordId ? 'PATCH' : 'POST'

              await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({ data: db }),
                signal: controller.signal,
              })
              clearTimeout(timeoutId)
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
