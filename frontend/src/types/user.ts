export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  avatarUrl: string | null
  isActive: boolean
  createdAt: string
}

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  avatarUrl: string | null
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  user: AuthUser
}

export interface MeResponse {
  id: string
  email: string
  firstName: string
  lastName: string
  avatarUrl: string | null
  tenants: Array<{
    tenantId: string
    tenantName: string
    roles: string[]
  }>
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface CreateUserPayload {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  avatarUrl?: string
}
