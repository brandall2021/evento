"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import { setTokens, clearTokens, getAccessToken } from "@/lib/auth"
import type { AuthResponse, MeResponse, LoginPayload, RegisterPayload } from "@/types/user"

export function useAuth() {
  const queryClient = useQueryClient()

  const me = useQuery<MeResponse>({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const { data } = await api.get("/auth/me")
      return data
    },
    enabled: !!getAccessToken(),
    retry: false,
  })

  const login = useMutation<AuthResponse, Error, LoginPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post("/auth/login", payload)
      return data
    },
    onSuccess: (data) => {
      setTokens(data.access_token, data.refresh_token)
      queryClient.setQueryData(["auth", "me"], data.user)
    },
  })

  const register = useMutation<AuthResponse, Error, RegisterPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post("/auth/register", payload)
      return data
    },
    onSuccess: (data) => {
      setTokens(data.access_token, data.refresh_token)
      queryClient.setQueryData(["auth", "me"], data.user)
    },
  })

  const logout = useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/auth/logout", {
        refresh_token: localStorage.getItem("evento_refresh_token"),
      })
      return data
    },
    onSettled: () => {
      clearTokens()
      queryClient.clear()
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
    },
  })

  return {
    user: me.data,
    isAuthenticated: !!me.data && !!getAccessToken(),
    isLoading: me.isLoading,
    login,
    register,
    logout,
  }
}
