"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import type { FormTemplate, FormSubmission } from "@/types/form"

export function usePublicForm(slug?: string) {
  return useQuery<FormTemplate>({
    queryKey: ["public-forms", slug],
    queryFn: async () => {
      const { data } = await api.get(`/public/forms/${slug}`)
      return data
    },
    enabled: !!slug,
  })
}

export function useSubmitPublicForm() {
  const queryClient = useQueryClient()
  return useMutation<FormSubmission, Error, { slug: string; payload: Record<string, unknown> }>({
    mutationFn: async ({ slug, payload }) => {
      const { data } = await api.post(`/public/forms/${slug}/submissions`, payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["public-forms"] }),
  })
}
