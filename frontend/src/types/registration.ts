export type RegistrationStatus = "pendiente" | "aceptado" | "en_espera" | "rechazado" | "en_curso" | "finalizado"

export interface Registration {
  id: number
  estudiante_id: number
  curso_id: number
  estado: RegistrationStatus
  fecha_solicitud: string
  fecha_aceptacion: string | null
  fecha_rechazo: string | null
  motivo_rechazo: string | null
  estudiante?: {
    id: number
    first_name: string
    last_name: string
    email: string
  }
  curso?: {
    id: number
    nombre: string
    estado: string
  }
}
