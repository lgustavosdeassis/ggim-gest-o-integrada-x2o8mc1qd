import type { DatabaseProvider } from '../types'

let isProcessing = false

export const localProvider = {
  name: 'Cache Local',
  async connect() {
    return true
  },
  async getList(collection: string, page = 1, perPage = 50, options: any = {}) {
    const items = this.getItems(collection)
    const start = (page - 1) * perPage
    const paginated = items.slice(start, start + perPage)
    return {
      page,
      perPage,
      totalItems: items.length,
      totalPages: Math.ceil(items.length / perPage),
      items: paginated,
    }
  },
  async getFullList(collection: string, options: any = {}) {
    return this.getItems(collection)
  },
  async getOne(collection: string, id: string) {
    const items = this.getItems(collection)
    const item = items.find((i: any) => i.id === id)
    if (!item) throw { status: 404, message: 'Registro não encontrado localmente' }
    return item
  },
  async create(collection: string, data: any) {
    const items = this.getItems(collection)
    const newItem = this.parseData(data)
    newItem.id = newItem.id || Math.random().toString(36).substring(2, 11)
    newItem.created = new Date().toISOString()
    newItem.updated = newItem.created
    items.unshift(newItem)
    this.setItems(collection, items)
    return newItem
  },
  async update(collection: string, id: string, data: any) {
    const items = this.getItems(collection)
    const idx = items.findIndex((i: any) => i.id === id)
    if (idx === -1) throw { status: 404, message: 'Registro não encontrado localmente' }
    const parsed = this.parseData(data)
    items[idx] = { ...items[idx], ...parsed, updated: new Date().toISOString() }
    this.setItems(collection, items)
    return items[idx]
  },
  async delete(collection: string, id: string) {
    const items = this.getItems(collection)
    this.setItems(
      collection,
      items.filter((i: any) => i.id !== id),
    )
  },
  async subscribe(collection: string, callback: any) {
    return () => {}
  },
  getFileUrl(record: any, filename: string) {
    return ''
  },
  // Extra specific methods for Local Cache
  getItems(col: string): any[] {
    try {
      return JSON.parse(localStorage.getItem(`db_${col}`) || '[]')
    } catch {
      return []
    }
  },
  setItems(col: string, items: any[]) {
    localStorage.setItem(`db_${col}`, JSON.stringify(items))
  },
  saveToCache(col: string, item: any) {
    const items = this.getItems(col)
    const idx = items.findIndex((i: any) => i.id === item.id)
    if (idx >= 0) items[idx] = item
    else items.unshift(item)
    this.setItems(col, items)
  },
  removeFromCache(col: string, id: string) {
    this.setItems(
      col,
      this.getItems(col).filter((i: any) => i.id !== id),
    )
  },
  parseData(data: any) {
    if (data instanceof FormData) {
      const obj: any = {}
      data.forEach((val, key) => {
        if (!(val instanceof File)) obj[key] = val
      })
      return obj
    }
    return { ...data }
  },
  queueAction(action: string, collection: string, id?: string, data?: any) {
    const queue = JSON.parse(localStorage.getItem('db_queue') || '[]')
    const parsedData = data ? this.parseData(data) : undefined
    queue.push({ action, collection, id, data: parsedData, timestamp: Date.now() })
    localStorage.setItem('db_queue', JSON.stringify(queue))

    if (action === 'create') return this.create(collection, parsedData)
    if (action === 'update' && id) return this.update(collection, id, parsedData)
    if (action === 'delete' && id) return this.delete(collection, id)
  },
  async processOfflineQueue(activeProvider: DatabaseProvider) {
    if (isProcessing) return
    isProcessing = true
    try {
      const queue = JSON.parse(localStorage.getItem('db_queue') || '[]')
      if (!queue.length) return

      for (const task of queue) {
        try {
          if (task.action === 'create') {
            await activeProvider.create(task.collection, task.data)
          } else if (task.action === 'update' && task.id) {
            // Basic conflict resolution: check timestamp
            try {
              const remote = await activeProvider.getOne(task.collection, task.id)
              if (remote && new Date(remote.updated).getTime() > task.timestamp) {
                continue // Remote is newer
              }
            } catch {
              // Not found remotely, proceed to update (might fail if truly deleted)
            }
            await activeProvider.update(task.collection, task.id, task.data)
          } else if (task.action === 'delete' && task.id) {
            await activeProvider.delete(task.collection, task.id)
          }
        } catch (e) {
          console.warn('Failed to sync offline task', task, e)
        }
      }
      localStorage.setItem('db_queue', '[]')
    } finally {
      isProcessing = false
    }
  },
} as DatabaseProvider & { [key: string]: any }
