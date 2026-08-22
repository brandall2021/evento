export function buildDuplicatedSessionPayload(session: { titulo: string; descripcion?: string | null; tipo?: string | null; cupos?: number | null; sala_id?: number | null; ponente_id?: number | null }, orden: number): {
  titulo: string
  descripcion?: string
  tipo?: string
  cupos?: number
  sala_id?: number
  ponente_id?: number
  orden: number
}
