export function normalizeProgramAgenda(days: unknown): Array<{
  id?: number
  titulo?: string
  bloques: Array<{
    id?: number
    titulo?: string
    hora_inicio?: string
    hora_fin?: string
    sesiones: Array<{
      id?: number
      titulo?: string
    }>
  }>
}>
