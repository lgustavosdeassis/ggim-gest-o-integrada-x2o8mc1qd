import pb from '@/lib/pocketbase/client'
import type { DatabaseProvider } from '../types'

export const skipProvider: DatabaseProvider = {
  name: 'Skip Cloud',
  async connect() {
    try {
      await pb.health.check()
      return true
    } catch {
      return false
    }
  },
  async getList(collection, page = 1, perPage = 50, options) {
    const res = await pb.collection(collection).getList(page, perPage, options)
    return {
      page: res.page,
      perPage: res.perPage,
      totalItems: res.totalItems,
      totalPages: res.totalPages,
      items: res.items,
    }
  },
  async getFullList(collection, options) {
    return pb.collection(collection).getFullList(options)
  },
  async getOne(collection, id, options) {
    return pb.collection(collection).getOne(id, options)
  },
  async create(collection, data) {
    return pb.collection(collection).create(data)
  },
  async update(collection, id, data) {
    return pb.collection(collection).update(id, data)
  },
  async delete(collection, id) {
    await pb.collection(collection).delete(id)
  },
  async subscribe(collection, callback) {
    const unsub = await pb.collection(collection).subscribe('*', callback)
    return unsub
  },
  getFileUrl(record, filename) {
    return pb.files.getURL(record, filename)
  },
}
