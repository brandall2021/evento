"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"

export function useProgramAgenda(courseId?: number) {
  return useQuery<any[]>({
    queryKey: ["programa-academico", courseId],
    queryFn: async () => {
      const { data } = await api.get(`/cursos/${courseId}/agenda`)
      return data
    },
    enabled: !!courseId,
  })
}

export function useCreateProgramDay(courseId?: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { fecha: string; titulo: string; orden?: number }) => {
      const { data } = await api.post(`/cursos/${courseId}/dias`, payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["programa-academico", courseId] }),
  })
}

export function useCreateProgramBlock(courseId?: number, diaId?: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { titulo: string; hora_inicio: string; hora_fin: string }) => {
      const { data } = await api.post(`/cursos/${courseId}/dias/${diaId}/bloques`, payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["programa-academico", courseId] }),
  })
}

export function useCreateProgramRoom(courseId?: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { nombre: string; capacidad?: number; ubicacion?: string }) => {
      const { data } = await api.post(`/cursos/${courseId}/salas`, payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["programa-academico", courseId] }),
  })
}

export function useCreateProgramSession(courseId?: number, bloqueId?: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { titulo: string; descripcion?: string; sala_id?: number; ponente_id?: number; tipo?: string; cupos?: number }) => {
      const { data } = await api.post(`/cursos/${courseId}/bloques/${bloqueId}/sesiones`, payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["programa-academico", courseId] }),
  })
}
