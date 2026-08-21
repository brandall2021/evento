"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import type { CheckinRecord, CheckinStats } from "@/types/checkin"

export function useSessionCheckins(sesionId?: string) {
  return useQuery<CheckinRecord[]>({
    queryKey: ["checkins", "session", sesionId],
    queryFn: async () => {
      const { data } = await api.get(`/checkin/sesion/${sesionId}`)
      return data
    },
    enabled: !!sesionId,
  })
}

export function useCheckinStats(cursoId?: string) {
  return useQuery<CheckinStats>({
    queryKey: ["checkins", "stats", cursoId],
    queryFn: async () => {
      const { data } = await api.get(`/checkin/estadisticas/${cursoId}`)
      return data
    },
    enabled: !!cursoId,
  })
}

export function useGenerateCheckinQr() {
  const queryClient = useQueryClient()
  return useMutation<Record<string, unknown>, Error, number>({
    mutationFn: async (inscripcionId) => {
      const { data } = await api.get(`/checkin/qr/${inscripcionId}`)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["checkins"] }),
  })
}

export function useScanCheckin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { token: string; sesion_id?: number; sala_id?: number; device_info?: string }) => {
      const { data } = await api.post("/checkin/scan", payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["checkins"] }),
  })
}

export function useManualCheckin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { inscripcion_id: number; sesion_id?: number; sala_id?: number }) => {
      const { data } = await api.post("/checkin/manual", payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["checkins"] }),
  })
}
