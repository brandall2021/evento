"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import type { Credential, CredentialValidation } from "@/types/credential"

export function useMyCredentials() {
  return useQuery<Credential[]>({
    queryKey: ["credentials", "mine"],
    queryFn: async () => {
      const { data } = await api.get("/credenciales/mis")
      return data
    },
  })
}

export function useIssueCredential() {
  const queryClient = useQueryClient()
  return useMutation<Credential, Error, number>({
    mutationFn: async (inscripcionId) => {
      const { data } = await api.post("/credenciales/emitir", { inscripcion_id: inscripcionId })
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["credentials"] }),
  })
}

export function useValidateCredential(codigo?: string) {
  return useQuery<CredentialValidation>({
    queryKey: ["credentials", "validate", codigo],
    queryFn: async () => {
      const { data } = await api.get(`/credenciales/validar/${codigo}`)
      return data
    },
    enabled: !!codigo,
  })
}
