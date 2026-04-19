export interface QueryOptions {
  sort?: string
  filter?: string
  expand?: string
  fields?: string
}

export interface ListResult<T = any> {
  page: number
  perPage: number
  totalItems: number
  totalPages: number
  items: T[]
}

export interface DatabaseProvider {
  name: string
  connect(): Promise<boolean>
  getList(
    collection: string,
    page?: number,
    perPage?: number,
    options?: QueryOptions,
  ): Promise<ListResult>
  getFullList(collection: string, options?: QueryOptions): Promise<any[]>
  getOne(collection: string, id: string, options?: QueryOptions): Promise<any>
  create(collection: string, data: any): Promise<any>
  update(collection: string, id: string, data: any): Promise<any>
  delete(collection: string, id: string): Promise<void>
  subscribe(collection: string, callback: (e: any) => void): Promise<() => void>
  getFileUrl(record: any, filename: string): string
}
