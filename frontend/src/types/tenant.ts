export interface Tenant {
  id: string
  name: string
  slug: string
  domain: string | null
  logoUrl: string | null
  bannerUrl: string | null
  settings: Record<string, unknown> | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateTenantPayload {
  name: string
  slug: string
  domain?: string
  logoUrl?: string
  bannerUrl?: string
  settings?: Record<string, unknown>
  isActive?: boolean
}
