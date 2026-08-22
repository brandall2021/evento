export function buildProgramAgendaMoveInvalidationKeys(courseId: number | undefined): Array<["programa-academico", number | undefined]>
export function buildProgramAgendaMoveRollbackOperations(
  previousAgenda: Array<{
    id?: number
    orden?: number
    bloques?: Array<{
      id?: number
      orden?: number
      sesiones?: Array<{
        id?: number
        orden?: number
      }>
    }>
  }>,
  appliedOperations: Array<{
    kind: 'day' | 'block' | 'session'
    id: number
  }>,
): Array<{
  kind: 'day' | 'block' | 'session'
  id: number
  payload: { orden: number; dia_id?: number; bloque_id?: number }
}>
