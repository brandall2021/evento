export interface CollectionMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CollectionResult<T> {
  items: T[]
  meta?: CollectionMeta
}

export function normalizeCollectionResponse<T>(payload: T[] | { data: T[]; total?: number; page?: number; pageSize?: number; limit?: number; meta?: Partial<CollectionMeta> } | undefined): CollectionResult<T>
export function formatCurrency(value: string | number): string
export function formatDateTime(value: string | null | undefined): string
