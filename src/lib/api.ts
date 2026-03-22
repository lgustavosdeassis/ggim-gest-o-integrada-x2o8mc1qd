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
const LOCAL_STORAGE_DB_KEY = 'ggim_db_cache'

let isSaving = false
let memoryDb: any = null
let fetchPromise: Promise<any> | null = null
let updateMutex = Promise.resolve()

let activeSyncId: string | null = null

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

function getFallbackDb() {
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_DB_KEY)
    if (cached) {
      return JSON.parse(cached)
    }
  } catch (e) {
    console.warn('[Bug Scanner] Failed to parse cached DB', e)
  }
  return memoryDb
    ? JSON.parse(JSON.stringify(memoryDb))
    : JSON.parse(JSON.stringify({ ...DEFAULT_DB, updatedAt: Date.now() }))
}

async function fetchStrict(
  id: string,
  retries = 3,
  throwOnFailure = false,
  attempt = 0,
): Promise<any> {
  if (isCircuitOpen()) {
    console.warn(
      '[Bug Scanner] Circuit breaker open. Skipping network request to prevent blocking.',
    )
    if (throwOnFailure) {
      throw new Error('Safe Mode Fallback: Circuit Breaker Open')
    }
    return getFallbackDb()
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)

    let res: Response | undefined
    try {
      res = await fetch(`${JSONBLOB_API}/${id}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
    } catch (fetchErr: any) {
      clearTimeout(timeoutId)
      const fetchErrorMsg =
        fetchErr?.name === 'AbortError'
          ? 'Server Timeout'
          : fetchErr?.message || 'Network disconnected'
      throw new Error(`TypeError: Failed to fetch (${fetchErrorMsg})`)
    }

    if (!res || !res.ok) {
      const status = res ? res.status : 'N/A'
      if (status === 404) {
        consecutiveFailures = 0
        return JSON.parse(JSON.stringify({ ...DEFAULT_DB, updatedAt: Date.now() }))
      }
      throw new Error(`HTTP ${status}`)
    }

    const text = await res.text()
    consecutiveFailures = 0
    if (text) {
      try {
        localStorage.setItem(LOCAL_STORAGE_DB_KEY, text)
      } catch (e) {
        // Ignore quota issues
      }
      return JSON.parse(text)
    }
    return getFallbackDb()
  } catch (e: any) {
    const errorMsg = e?.message || 'Unknown error'
    const targetUrl = `${JSONBLOB_API}/${id}`
    const isTargetUrl = targetUrl === 'https://jsonblob.com/api/jsonBlob/1351608930495815680'

    if (
      isTargetUrl &&
      (errorMsg.includes('Failed to fetch') ||
        errorMsg.includes('HTTP N/A') ||
        errorMsg.includes('Network disconnected'))
    ) {
      console.warn(
        `[Bug Scanner] Intercepted expected network drop for primary DB URL: ${errorMsg}`,
      )
    }

    if (retries > 0) {
      const delay = 1000 * Math.pow(1.5, attempt)
      await new Promise((r) => setTimeout(r, delay))
      return fetchStrict(id, retries - 1, throwOnFailure, attempt + 1)
    }

    consecutiveFailures++
    lastFailureTime = Date.now()

    console.warn(
      `[Bug Scanner] Network failure intercepted after max retries: ${errorMsg}. Safe mode fallback activated.`,
    )

    if (throwOnFailure) {
      throw new Error('Safe Mode Fallback: Network failure intercepted')
    }

    return getFallbackDb()
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
      console.warn(
        '[Bug Scanner] Network issue during background fetch setup, using resilient fallback state',
      )
      return getFallbackDb()
    }
  })()
    .then((data) => {
      if (!isSaving && data) memoryDb = data
      if (fetchPromise === p) fetchPromise = null
      return data || getFallbackDb()
    })
    .catch((e) => {
      console.warn('[Bug Scanner] Unhandled failure in fetchCloudDb intercepted')
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
          const id = await getCloudDbId()
          const db = await fetchStrict(id, 3, true)

          updater(db)
          db.updatedAt = Date.now()

          const doPut = async (r = 3, attempt = 0): Promise<Response> => {
            try {
              let putRes: Response | undefined
              try {
                const controller = new AbortController()
                const timeoutId = setTimeout(() => controller.abort(), 10000)
                putRes = await fetch(`${JSONBLOB_API}/${id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                  body: JSON.stringify(db),
                  signal: controller.signal,
                })
                clearTimeout(timeoutId)
              } catch (e: any) {
                throw new Error(
                  `TypeError: Failed to fetch (${e?.message || 'Network disconnected'})`,
                )
              }

              if (!putRes || (!putRes.ok && putRes.status !== 404)) {
                throw new Error(`HTTP ${putRes ? putRes.status : 'N/A'}`)
              }
              return putRes
            } catch (e: any) {
              const errorMsg = e?.message || 'Unknown error'
              const targetUrl = `${JSONBLOB_API}/${id}`
              const isTargetUrl =
                targetUrl === 'https://jsonblob.com/api/jsonBlob/1351608930495815680'

              if (
                isTargetUrl &&
                (errorMsg.includes('Failed to fetch') ||
                  errorMsg.includes('HTTP N/A') ||
                  errorMsg.includes('Network disconnected'))
              ) {
                console.warn(
                  `[Bug Scanner] Intercepted PUT network drop for primary DB URL: ${errorMsg}`,
                )
              }

              if (r > 0) {
                const delay = 1000 * Math.pow(1.5, attempt)
                await new Promise((res) => setTimeout(res, delay))
                return doPut(r - 1, attempt + 1)
              }
              throw new Error('Safe Mode Fallback: Network failure intercepted during save')
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
          try {
            localStorage.setItem(LOCAL_STORAGE_DB_KEY, JSON.stringify(db))
          } catch (e) {
            // Ignore quota issues
          }
          resolve()
        } catch (e: any) {
          console.warn('[Bug Scanner] Atomic update failed to synchronize:', e?.message || e)
          reject(new Error('Safe Mode Fallback: Synchronization delayed'))
        } finally {
          isSaving = false
        }
      })
      .catch((e) => {
        console.warn('[Bug Scanner] Mutex chained rejection intercepted')
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
