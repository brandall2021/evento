"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import type { Role, CreateRolePayload } from "@/types/role"

export function useRoles() {
  return useQuery<Role[]>({
    queryKey: ["roles"],
    queryFn: async () => {
      const { data } = await api.get("/roles")
      return data
    },
  })
}

export function useRole(id: string) {
  return useQuery<Role>({
    queryKey: ["roles", id],
    queryFn: async () => {
      const { data } = await api.get(`/roles/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateRole() {
  const queryClient = useQueryClient()

  return useMutation<Role, Error, CreateRolePayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post("/roles", payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] })
    },
  })
}

export function useAssignPermissions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      roleId,
      permissionIds,
    }: {
      roleId: string
      permissionIds: string[]
    }) => {
      const { data } = await api.post(`/roles/${roleId}/permissions`, {
        permissionIds,
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] })
    },
  })
}

export function useDeleteRole() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/roles/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] })
    },
  })
}
