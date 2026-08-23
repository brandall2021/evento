export type ProgramDragKind = 'day' | 'block' | 'session'

export interface ProgramDragTarget {
  kind: ProgramDragKind
  dayId: number
  parentId?: number
  blockId?: number
}

export interface ProgramDragNode extends ProgramDragTarget {
  id: number
}

export function flattenProgramAgendaNodes(program: unknown): ProgramDragNode[]
export function getProgramDragTargets(program: unknown, activeId: number | string): ProgramDragTarget | null
export function resolveProgramDayDragTarget(target: ProgramDragTarget | null | undefined): { kind: 'day'; dayId: number } | null
export function getProgramDragId(kind: ProgramDragKind, id: number | string): string
export function buildCrossParentMovePayload(input: {
  kind: 'block' | 'session' | 'day'
  itemId: number
  parentId?: number
  targetParentId: number
  orden: number
}): { dia_id?: number; bloque_id?: number; orden: number }
export function describeProgramDragMove(
  activeTarget: ProgramDragTarget | null | undefined,
  overTarget: ProgramDragTarget | null | undefined,
): { relationship: 'same-parent' | 'cross-parent'; sameParent: boolean } | null
export function moveSessionBetweenBlocks(
  blocks: Array<{ id: number; sesiones: Array<{ id: number; orden?: number }> }>,
  sessionId: number,
  targetBlockId: number,
): { blocks: Array<{ id: number; sesiones: Array<{ id: number; orden?: number }> }> }
