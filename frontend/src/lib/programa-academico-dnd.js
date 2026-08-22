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
  const target = flattenProgramAgendaNodes(program).find((node) => String(node.id) === String(activeId))

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
  getProgramDragTargets,
  describeProgramDragMove,
}
