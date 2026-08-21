"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import type { FormTemplate } from "@/types/form"

export function useForms() {
  return useQuery<FormTemplate[]>({
    queryKey: ["forms"],
    queryFn: async () => {
      const { data } = await api.get("/forms")
      return data
    },
  })
}

export function useFormTemplate(id?: number) {
  return useQuery<FormTemplate>({
    queryKey: ["forms", id],
    queryFn: async () => {
      const { data } = await api.get(`/forms/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateForm() {
  const queryClient = useQueryClient()
  return useMutation<FormTemplate, Error, { slug: string; name: string; context?: string | null; draft_schema_json?: Record<string, unknown> }>({
    mutationFn: async (payload) => {
      const { data } = await api.post("/forms", payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["forms"] }),
  })
}

export function useUpdateForm() {
  const queryClient = useQueryClient()
  return useMutation<FormTemplate, Error, { id: number; payload: { slug?: string; name?: string; context?: string | null; draft_schema_json?: Record<string, unknown> } }>({
    mutationFn: async ({ id, payload }) => {
      const { data } = await api.put(`/forms/${id}`, payload)
      return data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["forms"] })
      queryClient.invalidateQueries({ queryKey: ["forms", variables.id] })
    },
  })
}

export function usePublishForm() {
  const queryClient = useQueryClient()
  return useMutation<FormTemplate, Error, number>({
    mutationFn: async (id) => {
      const { data } = await api.post(`/forms/${id}/publish`)
      return data
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["forms"] })
      queryClient.invalidateQueries({ queryKey: ["forms", id] })
      queryClient.invalidateQueries({ queryKey: ["public-forms"] })
    },
  })
}
