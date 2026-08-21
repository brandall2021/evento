"use client"

import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import type { PublicEvent, PublicEventCollection } from "@/lib/public-events"

export function usePublicEvents(params?: { page?: number; limit?: number }) {
  return useQuery<PublicEventCollection>({
    queryKey: ["public-events", params],
    queryFn: async () => {
      const { data } = await api.get("/public/cursos", { params })
      return data
    },
  })
}

export function usePublicEvent(id?: number) {
  return useQuery<PublicEvent>({
    queryKey: ["public-events", id],
    queryFn: async () => {
      const { data } = await api.get(`/public/cursos/${id}`)
      return data
    },
    enabled: !!id,
  })
}
