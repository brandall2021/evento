"use client"

import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import type { Permission } from "@/types/permission"

export function usePermissions(module?: string) {
  return useQuery<Permission[]>({
    queryKey: ["permissions", module ?? "all"],
    queryFn: async () => {
      const { data } = await api.get("/permissions", { params: module ? { module } : undefined })
      return data
    },
  })
}

export function usePermission(id: string) {
  return useQuery<Permission>({
    queryKey: ["permissions", id],
    queryFn: async () => {
      const { data } = await api.get(`/permissions/${id}`)
      return data
    },
    enabled: !!id,
  })
}
