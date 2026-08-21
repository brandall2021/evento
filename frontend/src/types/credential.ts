export interface Credential {
  id: number
  user_id: number
  curso_id: number
  inscripcion_id: number
  codigo: string
  qr_data: string | null
  pdf_url: string | null
  emitida: boolean
  fecha_emision: string | null
  createdAt: string
  curso?: {
    id: number
    nombre: string
  }
}

export interface CredentialValidation {
  valido: boolean
  codigo: string
  asistente: string
  curso: string
  fecha_emision: string | null
}
