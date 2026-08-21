export function normalizeProgramAgenda(days: unknown): Array<{
  id?: number
  titulo?: string
  fecha?: string
  orden?: number
  bloques: Array<{
    id?: number
    titulo?: string
    orden?: number
    hora_inicio?: string
    hora_fin?: string
    sesiones: Array<{
      id?: number
      titulo?: string
      descripcion?: string
      tipo?: string
      cupos?: number
    }>
  }>
}>
