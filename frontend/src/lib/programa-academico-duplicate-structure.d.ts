export function buildDuplicatedSessionPayload(session: { titulo: string; descripcion?: string | null; tipo?: string | null; cupos?: number | null; sala_id?: number | null; ponente_id?: number | null }, orden: number): {
  titulo: string
  descripcion?: string
  tipo?: string
  cupos?: number
  sala_id?: number
  ponente_id?: number
  orden: number
}

export function buildDuplicatedBlockPayload(block: { titulo: string; hora_inicio: string; hora_fin: string; sesiones?: Array<{ titulo: string; descripcion?: string | null; tipo?: string | null; cupos?: number | null; sala_id?: number | null; ponente_id?: number | null }> }, orden: number): {
  titulo: string
  hora_inicio: string
  hora_fin: string
  orden: number
  sesiones: Array<{
    titulo: string
    descripcion?: string
    tipo?: string
    cupos?: number
    sala_id?: number
    ponente_id?: number
    orden: number
  }>
}

export function buildDuplicatedDayPayload(day: { titulo: string; fecha: string; bloques?: Array<{ titulo: string; hora_inicio: string; hora_fin: string; sesiones?: Array<{ titulo: string; descripcion?: string | null; tipo?: string | null; cupos?: number | null; sala_id?: number | null; ponente_id?: number | null }> }> }, orden: number): {
  titulo: string
  fecha: string
  orden: number
  bloques: Array<{
    titulo: string
    hora_inicio: string
    hora_fin: string
    orden: number
    sesiones: Array<{
      titulo: string
      descripcion?: string
      tipo?: string
      cupos?: number
      sala_id?: number
      ponente_id?: number
      orden: number
    }>
  }>
}
