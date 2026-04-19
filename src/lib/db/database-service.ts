import { databaseConfig } from './database-config'
import { localProvider } from './providers/local'
import { useSyncStore } from '@/stores/sync'
import type { QueryOptions, DatabaseProvider } from './types'

class DatabaseService {
  private providers = databaseConfig.providers
  private activeProvider: DatabaseProvider = localProvider
  private isOnline = false
  private checkInterval: any = null

  async init() {
    await this.checkConnection()
    if (!this.checkInterval) {
      this.checkInterval = setInterval(() => this.checkConnection(), databaseConfig.checkIntervalMs)
    }
  }

  private async checkConnection() {
    const { setStatus } = useSyncStore.getState()
    let connectedProvider = localProvider

    for (const p of this.providers) {
      if (p.name === 'Cache Local') continue
      const ok = await p.connect()
      if (ok) {
        connectedProvider = p
        break
      }
    }

    if (connectedProvider.name !== this.activeProvider.name) {
      const wasOffline = this.activeProvider.name === 'Cache Local'
      this.activeProvider = connectedProvider

      if (connectedProvider.name === 'Cache Local') {
        this.isOnline = false
        setStatus('error', 'Erro de conexão. Tentando reconectar...')
      } else {
        this.isOnline = true
        setStatus('connected', `Conectado via ${connectedProvider.name}`)

        if (wasOffline) {
          await this.syncOfflineData()
        }
        setTimeout(() => setStatus('idle', ''), 3000)
      }
    }
  }

  private async syncOfflineData() {
    const { setStatus } = useSyncStore.getState()
    setStatus('syncing', 'Sincronizando dados...')
    try {
      await localProvider.processOfflineQueue(this.activeProvider)
      setStatus('connected', 'Sincronização concluída.')
    } catch (e) {
      setStatus('error', 'Erro ao sincronizar dados.')
    }
    setTimeout(() => setStatus('idle', ''), 3000)
  }

  collection(name: string) {
    const provider = this.activeProvider
    const local = localProvider
    const isOnline = this.isOnline

    return {
      getList: async (page = 1, perPage = 50, options?: QueryOptions) => {
        try {
          return await provider.getList(name, page, perPage, options)
        } catch (e: any) {
          if (isOnline) throw this.handleError(e)
          return local.getList(name, page, perPage, options)
        }
      },
      getFullList: async (options?: QueryOptions) => {
        try {
          return await provider.getFullList(name, options)
        } catch (e: any) {
          if (isOnline) throw this.handleError(e)
          return local.getFullList(name, options)
        }
      },
      getOne: async (id: string, options?: QueryOptions) => {
        try {
          return await provider.getOne(name, id, options)
        } catch (e: any) {
          if (isOnline) throw this.handleError(e)
          return local.getOne(name, id)
        }
      },
      create: async (data: any) => {
        try {
          const res = await provider.create(name, data)
          if (isOnline) local.saveToCache(name, res)
          return res
        } catch (e: any) {
          if (!isOnline || e.status === 0) {
            return local.queueAction('create', name, undefined, data)
          }
          throw this.handleError(e)
        }
      },
      update: async (id: string, data: any) => {
        try {
          const res = await provider.update(name, id, data)
          if (isOnline) local.saveToCache(name, res)
          return res
        } catch (e: any) {
          if (!isOnline || e.status === 0) {
            return local.queueAction('update', name, id, data)
          }
          throw this.handleError(e)
        }
      },
      delete: async (id: string) => {
        try {
          await provider.delete(name, id)
          if (isOnline) local.removeFromCache(name, id)
        } catch (e: any) {
          if (!isOnline || e.status === 0) {
            return local.queueAction('delete', name, id)
          }
          throw this.handleError(e)
        }
      },
      subscribe: async (callback: (e: any) => void) => {
        return provider.subscribe(name, callback)
      },
    }
  }

  getFileUrl(record: any, filename: string) {
    return this.activeProvider.getFileUrl(record, filename)
  }

  private handleError(e: any) {
    if (e?.status === 403) {
      e.message = 'Permissão negada (403).'
    }
    return e
  }
}

export const db = new DatabaseService()
