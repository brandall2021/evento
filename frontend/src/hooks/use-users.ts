"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import type { User, CreateUserPayload } from "@/types/user"
import type { PaginatedResponse, PaginationParams } from "@/types/api"

export function useUsers(params?: PaginationParams & { tenantId?: string; isActive?: string }) {
  return useQuery<PaginatedResponse<User>>({
    queryKey: ["users", params],
    queryFn: async () => {
      const { data } = await api.get("/users", { params })
      return data
    },
  })
}

export function useUser(id: string) {
  return useQuery<User>({
    queryKey: ["users", id],
    queryFn: async () => {
      const { data } = await api.get(`/users/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation<User, Error, CreateUserPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post("/users", payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/users/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

export function useAssignRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      userId,
      roleId,
      tenantId,
    }: {
      userId: string
      roleId: string
      tenantId: string
    }) => {
      const { data } = await api.post(`/users/${userId}/roles`, {
        roleId,
        tenantId,
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

export function useRemoveRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      userId,
      roleId,
      tenantId,
    }: {
      userId: string
      roleId: string
      tenantId: string
    }) => {
      await api.delete(`/users/${userId}/roles/${roleId}`, {
        params: { tenantId },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}
