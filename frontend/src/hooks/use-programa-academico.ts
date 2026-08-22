"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import { buildProgramAgendaMoveInvalidationKeys } from "@/lib/programa-academico-move"

type ProgramAgendaMoveKind = "day" | "block" | "session"

type ProgramAgendaMoveOperation = {
  kind: ProgramAgendaMoveKind
  id: number
  payload: Record<string, unknown>
}

type ProgramAgendaMoveVariables = {
  optimisticAgenda: any[]
  operations: ProgramAgendaMoveOperation[]
}

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

export function useProgramRooms(courseId?: number) {
  return useQuery<any[]>({
    queryKey: ["programa-academico", courseId, "salas"],
    queryFn: async () => {
      const { data } = await api.get(`/cursos/${courseId}/salas`)
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

export function useUpdateProgramDay(courseId?: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: { fecha?: string; titulo?: string; orden?: number } }) => {
      const { data } = await api.put(`/dias/${id}`, payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["programa-academico", courseId] }),
  })
}

export function useDeleteProgramDay(courseId?: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/dias/${id}`)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["programa-academico", courseId] }),
  })
}

export function useCreateProgramBlock(courseId?: number, diaId?: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ dayId, payload }: { dayId?: number; payload: { titulo: string; hora_inicio: string; hora_fin: string; orden?: number } }) => {
      const targetDayId = dayId ?? diaId
      const { data } = await api.post(`/cursos/${courseId}/dias/${targetDayId}/bloques`, payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["programa-academico", courseId] }),
  })
}

export function useUpdateProgramBlock(courseId?: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: { titulo?: string; orden?: number; hora_inicio?: string; hora_fin?: string; dia_id?: number } }) => {
      const { data } = await api.put(`/bloques/${id}`, payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["programa-academico", courseId] }),
  })
}

export function useDeleteProgramBlock(courseId?: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/bloques/${id}`)
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programa-academico", courseId] })
      queryClient.invalidateQueries({ queryKey: ["programa-academico", courseId, "salas"] })
    },
  })
}

export function useUpdateProgramRoom(courseId?: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: { nombre?: string; capacidad?: number; ubicacion?: string } }) => {
      const { data } = await api.put(`/salas/${id}`, payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["programa-academico", courseId, "salas"] }),
  })
}

export function useDeleteProgramRoom(courseId?: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/salas/${id}`)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["programa-academico", courseId, "salas"] }),
  })
}

export function useCreateProgramSession(courseId?: number, bloqueId?: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ blockId, payload }: { blockId?: number; payload: { titulo: string; descripcion?: string; sala_id?: number; ponente_id?: number; tipo?: string; cupos?: number; orden?: number } }) => {
      const targetBlockId = blockId ?? bloqueId
      const { data } = await api.post(`/cursos/${courseId}/bloques/${targetBlockId}/sesiones`, payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["programa-academico", courseId] }),
  })
}

export function useUpdateProgramSession(courseId?: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: { titulo?: string; orden?: number; descripcion?: string; sala_id?: number; ponente_id?: number; tipo?: string; cupos?: number; bloque_id?: number } }) => {
      const { data } = await api.put(`/sesiones/${id}`, payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["programa-academico", courseId] }),
  })
}

export function useDeleteProgramSession(courseId?: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/sesiones/${id}`)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["programa-academico", courseId] }),
  })
}

function getProgramAgendaMoveEndpoint(kind: ProgramAgendaMoveKind, id: number) {
  if (kind === "day") {
    return `/dias/${id}`
  }

  if (kind === "block") {
    return `/bloques/${id}`
  }

  return `/sesiones/${id}`
}

export function usePersistProgramAgendaMove(courseId?: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: ProgramAgendaMoveVariables) => {
      for (const operation of variables.operations) {
        await api.put(getProgramAgendaMoveEndpoint(operation.kind, operation.id), operation.payload)
      }
    },
    onMutate: async (variables) => {
      const queryKey = ["programa-academico", courseId]

      await queryClient.cancelQueries({ queryKey })
      const previousAgenda = queryClient.getQueryData(queryKey)
      queryClient.setQueryData(queryKey, variables.optimisticAgenda)

      return { queryKey, previousAgenda }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousAgenda) {
        queryClient.setQueryData(context.queryKey, context.previousAgenda)
      }
    },
    onSuccess: () => {
      for (const queryKey of buildProgramAgendaMoveInvalidationKeys(courseId)) {
        queryClient.invalidateQueries({ queryKey })
      }
    },
  })
}
