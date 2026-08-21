import type { Permission } from "./permission"

export interface Role {
  id: string
  tenantId: string
  name: string
  description: string | null
  isSystem: boolean
  permissions: Permission[]
  createdAt: string
  updatedAt: string
}

export interface CreateRolePayload {
  name: string
  description?: string
  permissionIds?: string[]
}

export interface UpdateRolePayload {
  name?: string
  description?: string | null
  permissionIds?: string[]
}
