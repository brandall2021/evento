"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import type { Course, CreateCoursePayload, UpdateCoursePayload } from "@/types/course"

export function useCourses(params?: { page?: number; pageSize?: number }) {
  return useQuery<Course[] | { data: Course[]; total: number; page: number; pageSize: number }>({
    queryKey: ["courses", params],
    queryFn: async () => {
      const { data } = await api.get("/cursos", { params })
      return data
    },
  })
}

export function useCourse(id: number) {
  return useQuery<Course>({
    queryKey: ["courses", id],
    queryFn: async () => {
      const { data } = await api.get(`/cursos/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateCourse() {
  const queryClient = useQueryClient()
  return useMutation<Course, Error, CreateCoursePayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post("/cursos", payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses"] }),
  })
}

export function useUpdateCourse() {
  const queryClient = useQueryClient()
  return useMutation<Course, Error, { id: number; payload: UpdateCoursePayload }>({
    mutationFn: async ({ id, payload }) => {
      const { data } = await api.put(`/cursos/${id}`, payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses"] }),
  })
}

export function useDeleteCourse() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      await api.delete(`/cursos/${id}`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses"] }),
  })
}

export function useChangeCourseStatus() {
  const queryClient = useQueryClient()
  return useMutation<Course, Error, { id: number; estado: Course["estado"] }>({
    mutationFn: async ({ id, estado }) => {
      const { data } = await api.put(`/cursos/${id}/estado`, { estado })
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses"] }),
  })
}
