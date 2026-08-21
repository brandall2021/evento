"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import type { Registration } from "@/types/registration"

export function useRegistrations(params?: { curso_id?: string; estado?: string; page?: number; pageSize?: number }) {
  return useQuery<Registration[] | { data: Registration[]; total: number; page: number; pageSize: number }>({
    queryKey: ["registrations", params],
    queryFn: async () => {
      const { data } = await api.get("/inscripciones", { params })
      return data
    },
  })
}

export function useMyRegistrations() {
  return useQuery<Registration[]>({
    queryKey: ["registrations", "my"],
    queryFn: async () => {
      const { data } = await api.get("/inscripciones/mis")
      return data
    },
  })
}

export function useApproveRegistration() {
  const queryClient = useQueryClient()
  return useMutation<Registration, Error, number>({
    mutationFn: async (id) => {
      const { data } = await api.put(`/inscripciones/${id}/aprobar`)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["registrations"] }),
  })
}

export function useRejectRegistration() {
  const queryClient = useQueryClient()
  return useMutation<Registration, Error, { id: number; motivo?: string }>({
    mutationFn: async ({ id, motivo }) => {
      const { data } = await api.put(`/inscripciones/${id}/rechazar`, { motivo })
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["registrations"] }),
  })
}

export function useRegisterForCourse() {
  const queryClient = useQueryClient()
  return useMutation<Registration, Error, number>({
    mutationFn: async (cursoId) => {
      const { data } = await api.post("/inscripciones", { curso_id: cursoId })
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["registrations"] }),
  })
}
