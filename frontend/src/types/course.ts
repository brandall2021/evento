export type CourseStatus = "borrador" | "publicado" | "finalizado"
export type CourseMode = "presencial" | "virtual" | "hibrido"

export interface Course {
  id: number
  nombre: string
  descripcion: string | null
  imagen: string | null
  categoria: string | null
  docente_id: number
  fecha_inicio: string
  fecha_fin: string
  duracion_horas: number
  modalidad: CourseMode
  cupos: number
  precio: string | number
  requisitos: string | null
  aceptacion_auto: boolean
  estado: CourseStatus
  docente?: {
    id: number
    first_name: string
    last_name: string
    email: string
  }
}

export interface CreateCoursePayload {
  nombre: string
  descripcion?: string
  categoria?: string
  fecha_inicio: string
  fecha_fin: string
  duracion_horas: number
  modalidad: CourseMode
  cupos: number
  precio?: number
  requisitos?: string
  aceptacion_auto?: boolean
}

export interface UpdateCoursePayload extends Partial<CreateCoursePayload> {
  estado?: CourseStatus
}
