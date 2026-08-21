"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import type { CreatePaymentPayload, Payment } from "@/types/payment"

export function usePayments(params?: { page?: number; pageSize?: number }) {
  return useQuery<Payment[] | { data: Payment[]; total: number; page: number; pageSize: number }>({
    queryKey: ["payments", params],
    queryFn: async () => {
      const { data } = await api.get("/pagos", { params })
      return data
    },
  })
}

export function useCreatePayment() {
  const queryClient = useQueryClient()
  return useMutation<Payment, Error, CreatePaymentPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post("/pagos", payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["payments"] }),
  })
}

export function useConfirmPayment() {
  const queryClient = useQueryClient()
  return useMutation<Payment, Error, number>({
    mutationFn: async (id) => {
      const { data } = await api.put(`/pagos/${id}/confirmar`)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["payments"] }),
  })
}
