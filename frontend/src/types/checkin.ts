export type CheckinMethod = "qr" | "manual" | "geolocation"

export interface CheckinRecord {
  id: number
  inscripcion_id: number
  sesion_id: number | null
  sala_id: number | null
  timestamp: string
  metodo: CheckinMethod
  device_info: string | null
  inscripcion?: {
    id: number
    estado: string
    estudiante?: {
      id: number
      first_name: string
      last_name: string
    }
  }
  sala?: {
    id: number
    nombre: string
  }
}

export interface CheckinStats {
  total_inscritos: number
  total_checkins: number
  por_sesion: Array<{
    sesion_id: number
    asistentes_unicos: number
    total_checkins: number
  }>
}
