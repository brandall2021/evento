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

export interface Permission {
  id: string
  code: string
  module: string
  action: string
  description: string | null
}

export interface CreateRolePayload {
  name: string
  description?: string
  permissionIds?: string[]
}
