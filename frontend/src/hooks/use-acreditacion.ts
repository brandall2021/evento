"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import type { AcreditacionRecord, AcreditacionStats } from "@/types/acreditacion"

export function useSessionAcreditaciones(sesionId?: string) {
  return useQuery<AcreditacionRecord[]>({
    queryKey: ["checkins", "session", sesionId],
    queryFn: async () => {
      const { data } = await api.get(`/acreditacion/sesion/${sesionId}`)
      return data
    },
    enabled: !!sesionId,
  })
}

export function useAcreditacionStats(cursoId?: string) {
  return useQuery<AcreditacionStats>({
    queryKey: ["checkins", "stats", cursoId],
    queryFn: async () => {
      const { data } = await api.get(`/acreditacion/estadisticas/${cursoId}`)
      return data
    },
    enabled: !!cursoId,
  })
}

export function useGenerateAcreditacionQr() {
  const queryClient = useQueryClient()
  return useMutation<Record<string, unknown>, Error, number>({
    mutationFn: async (inscripcionId) => {
      const { data } = await api.get(`/acreditacion/qr/${inscripcionId}`)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["checkins"] }),
  })
}

export function useScanAcreditacion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { token: string; sesion_id?: number; sala_id?: number; device_info?: string }) => {
      const { data } = await api.post("/acreditacion/scan", payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["checkins"] }),
  })
}

export function useManualAcreditacion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { inscripcion_id: number; sesion_id?: number; sala_id?: number }) => {
      const { data } = await api.post("/acreditacion/manual", payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["checkins"] }),
  })
}
