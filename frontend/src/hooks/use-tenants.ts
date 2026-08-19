"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import type { Tenant, CreateTenantPayload } from "@/types/tenant"

export function useTenants() {
  return useQuery<Tenant[]>({
    queryKey: ["tenants"],
    queryFn: async () => {
      const { data } = await api.get("/tenants")
      return data
    },
  })
}

export function useTenant(id: string) {
  return useQuery<Tenant>({
    queryKey: ["tenants", id],
    queryFn: async () => {
      const { data } = await api.get(`/tenants/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateTenant() {
  const queryClient = useQueryClient()

  return useMutation<Tenant, Error, CreateTenantPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post("/tenants", payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] })
    },
  })
}

export function useUpdateTenant() {
  const queryClient = useQueryClient()

  return useMutation<Tenant, Error, { id: string } & Partial<CreateTenantPayload>>({
    mutationFn: async ({ id, ...payload }) => {
      const { data } = await api.patch(`/tenants/${id}`, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] })
    },
  })
}

export function useDeleteTenant() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/tenants/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] })
    },
  })
}
