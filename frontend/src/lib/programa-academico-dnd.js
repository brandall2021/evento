function getProgramDays(program) {
  if (Array.isArray(program)) {
    return program
  }

  if (program && Array.isArray(program.days)) {
    return program.days
  }

  return []
}

function flattenProgramAgendaNodes(program) {
  const nodes = []

  for (const day of getProgramDays(program)) {
    if (!day || day.id == null) continue

    nodes.push({
      kind: 'day',
      id: day.id,
      dayId: day.id,
      parentId: undefined,
      blockId: undefined,
    })

    for (const block of Array.isArray(day.bloques) ? day.bloques : []) {
      if (!block || block.id == null) continue

      nodes.push({
        kind: 'block',
        id: block.id,
        dayId: day.id,
        parentId: day.id,
        blockId: block.id,
      })

      for (const session of Array.isArray(block.sesiones) ? block.sesiones : []) {
        if (!session || session.id == null) continue

        nodes.push({
          kind: 'session',
          id: session.id,
          dayId: day.id,
          parentId: block.id,
          blockId: block.id,
        })
      }
    }
  }

  return nodes
}

function getProgramDragTargets(program, activeId) {
  const parsed = parseProgramDragId(activeId)
  const target = flattenProgramAgendaNodes(program).find((node) => {
    if (parsed.kind) {
      return node.kind === parsed.kind && String(node.id) === String(parsed.id)
    }

    return String(node.id) === String(parsed.id)
  })

  if (!target) {
    return null
  }

  return {
    kind: target.kind,
    dayId: target.dayId,
    parentId: target.parentId,
    blockId: target.blockId,
  }
}

function resolveProgramDayDragTarget(target) {
  if (!target) {
    return null
  }

  if (target.kind === 'day') {
    return target
  }

  return {
    kind: 'day',
    dayId: target.dayId,
  }
}

function parseProgramDragId(value) {
  if (typeof value === 'string') {
    const match = value.match(/^(day|block|session):(\d+)$/)

    if (match) {
      return {
        kind: match[1],
        id: Number(match[2]),
      }
    }
  }

  return {
    kind: null,
    id: Number(value),
  }
}

function getProgramDragId(kind, id) {
  return `${kind}:${id}`
}

function buildCrossParentMovePayload(input) {
  if (input.kind === 'block') {
    return { dia_id: input.targetParentId, orden: input.orden }
  }

  if (input.kind === 'session') {
    return { bloque_id: input.targetParentId, orden: input.orden }
  }

  return { orden: input.orden }
}

function sortByOrden(items) {
  return [...items].sort((left, right) => (left.orden ?? 0) - (right.orden ?? 0))
}

function renumberOrderedItems(items) {
  return items.map((item, index) => ({
    ...item,
    orden: index + 1,
  }))
}

function moveSessionBetweenBlocks(blocks, sessionId, targetBlockId) {
  const orderedBlocks = blocks.map((block) => ({
    ...block,
    sesiones: renumberOrderedItems(sortByOrden(block.sesiones || [])),
  }))

  const sourceIndex = orderedBlocks.findIndex((block) => block.sesiones.some((session) => session.id === sessionId))
  const targetIndex = orderedBlocks.findIndex((block) => block.id === targetBlockId)

  if (sourceIndex < 0 || targetIndex < 0) {
    return { blocks: orderedBlocks }
  }

  const sourceBlock = orderedBlocks[sourceIndex]
  const targetBlock = orderedBlocks[targetIndex]
  const sessionIndex = sourceBlock.sesiones.findIndex((session) => session.id === sessionId)

  if (sessionIndex < 0) {
    return { blocks: orderedBlocks }
  }

  const [movedSession] = sourceBlock.sesiones.splice(sessionIndex, 1)
  targetBlock.sesiones = [...targetBlock.sesiones, movedSession]

  sourceBlock.sesiones = renumberOrderedItems(sourceBlock.sesiones)
  targetBlock.sesiones = renumberOrderedItems(targetBlock.sesiones)

  return {
    blocks: orderedBlocks,
  }
}

function describeProgramDragMove(activeTarget, overTarget) {
  if (!activeTarget || !overTarget) {
    return null
  }

  const activeParent = activeTarget.parentId ?? activeTarget.dayId
  const overParent = overTarget.parentId ?? overTarget.dayId

  return {
    relationship: activeParent === overParent ? 'same-parent' : 'cross-parent',
    sameParent: activeParent === overParent,
  }
}

module.exports = {
  flattenProgramAgendaNodes,
  buildCrossParentMovePayload,
  getProgramDragTargets,
  resolveProgramDayDragTarget,
  getProgramDragId,
  describeProgramDragMove,
  moveSessionBetweenBlocks,
}
