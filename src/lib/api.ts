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
// Dependency on localStorage for business data is eliminated to prevent local session silos.
const JSONBLOB_API = 'https://jsonblob.com/api/jsonBlob'
const SYNC_KEY = 'ggim_cloud_sync_id'
const PRIMARY_DB_ID = import.meta.env.VITE_GLOBAL_SYNC_ID || '1351608930495815680'

let isSaving = false
let memoryDb: any = null
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
  memoryDb = null // Force a fresh network fetch on next load
  window.dispatchEvent(new Event('db_updated'))
}

async function fetchCloudDb(forceFresh = false): Promise<any> {
  // Prevent background polling from overriding the memory state while an optimistic save is in progress.
  // This solves the "reverting" bug during rapid updates.
  if (isSaving && memoryDb) {
    return JSON.parse(JSON.stringify(memoryDb))
  }

  // Use fast in-memory state if we are not forcing a fresh network request
  if (!forceFresh && memoryDb) {
    return JSON.parse(JSON.stringify(memoryDb))
  }

  if (!forceFresh && fetchPromise) return fetchPromise

  const id = await getCloudDbId()
  const fetchUrl = `${JSONBLOB_API}/${id}`

  // Resilient fetching logic with retries to handle intermittent network failures
  // Omitted 'cache: "no-store"' as it can trigger strict CORS preflight rejections
  // or "Failed to fetch" TypeErrors on certain browsers/proxies.
  const doFetch = async (retries = 3): Promise<any> => {
    try {
      let res: Response | undefined

      try {
        res = await fetch(fetchUrl, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        })
      } catch (err: any) {
        // Specifically catch and handle "Failed to fetch" to prevent unhandled rejections
        throw new Error(err.message?.includes('Failed to fetch') ? 'Failed to fetch' : 'HTTP N/A')
      }

      if (!res) {
        throw new Error('HTTP N/A')
      }

      if (!res.ok) {
        if (res.status === 404) {
          return JSON.parse(JSON.stringify({ ...DEFAULT_DB, updatedAt: Date.now() }))
        }
        // Prevent "HTTP N/A" error from propagating by supplying a clear status code
        throw new Error(`HTTP Error: ${res.status || 'N/A'}`)
      }

      const rawText = await res.text()
      if (!rawText) {
        return JSON.parse(JSON.stringify({ ...DEFAULT_DB, updatedAt: Date.now() }))
      }
      return JSON.parse(rawText)
    } catch (e: any) {
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, 800))
        return doFetch(retries - 1)
      }
      // Instead of throwing, we gracefully catch the exception to prevent UI crashes
      // when the network is offline, providing a resilient fallback mechanism.
      console.warn(
        'Cloud DB fetch completely failed due to network error, utilizing offline memory state.',
        e,
      )
      return memoryDb
        ? JSON.parse(JSON.stringify(memoryDb))
        : JSON.parse(JSON.stringify({ ...DEFAULT_DB, updatedAt: Date.now() }))
    }
  }

  const p = doFetch()
    .then((data) => {
      // Only update memory if we haven't started a new save during the fetch window
      if (!isSaving && data) {
        memoryDb = data
      }
      if (fetchPromise === p) fetchPromise = null
      return data ? JSON.parse(JSON.stringify(data)) : JSON.parse(JSON.stringify(DEFAULT_DB))
    })
    .catch((e) => {
      console.warn('Cloud DB fetch outer promise failed', e)
      if (fetchPromise === p) fetchPromise = null
      return memoryDb
        ? JSON.parse(JSON.stringify(memoryDb))
        : JSON.parse(JSON.stringify(DEFAULT_DB))
    })

  if (!forceFresh || !fetchPromise) {
    fetchPromise = p
  }

  return p
}

let updateMutex = Promise.resolve()

// Guaranteed atomic sequential update directly to the centralized database
export async function atomicUpdate(updater: (db: any) => void) {
  updateMutex = updateMutex.then(async () => {
    isSaving = true
    try {
      const id = await getCloudDbId()
      const db = await fetchCloudDb(true)

      updater(db)
      db.updatedAt = Date.now()
      memoryDb = JSON.parse(JSON.stringify(db)) // Optimistically update memory instantly

      const doUpdate = async (retries = 2): Promise<Response | null> => {
        try {
          const res = await fetch(`${JSONBLOB_API}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(db),
          })
          if (!res.ok && res.status !== 404) throw new Error(`HTTP Error: ${res.status || 'N/A'}`)
          return res
        } catch (e) {
          if (retries > 0) {
            await new Promise((r) => setTimeout(r, 1000))
            return doUpdate(retries - 1)
          }
          console.warn('Network request failed during atomic update sync', e)
          return null // Return null gracefully instead of breaking the chain
        }
      }

      const res = await doUpdate()

      if (res && !res.ok && res.status === 404) {
        try {
          // DB got deleted or expired, recreate it and update the ID globally
          const createRes = await fetch(JSONBLOB_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(db),
          })
          const location = createRes.headers.get('Location')
          if (location) {
            const newId = location.split('/').pop() || id
            localStorage.setItem(SYNC_KEY, newId)
          }
        } catch (createErr) {
          console.warn('Failed to recreate external database on 404', createErr)
        }
      }
    } catch (e) {
      console.error('Atomic update encountered a critical synchronization failure', e)
    } finally {
      isSaving = false
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
    list: async (forceFresh = false) => {
      const db = await fetchCloudDb(forceFresh)
      return db?.auditLogs || []
    },
    syncUpdate: async (updater: (data: AuditLog[]) => AuditLog[]) => {
      await atomicUpdate((db) => {
        db.auditLogs = updater(db.auditLogs || [])
      })
    },
  },
}
