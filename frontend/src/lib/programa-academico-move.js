function buildProgramAgendaMoveInvalidationKeys(courseId) {
  return [["programa-academico", courseId]]
}

function getProgramDays(program) {
  return Array.isArray(program) ? program : []
}

function sortByOrden(items) {
  return [...items].sort((left, right) => (left.orden ?? 0) - (right.orden ?? 0))
}

function findRollbackDay(program, dayId) {
  return getProgramDays(program).find((day) => day.id === dayId) || null
}

function findRollbackBlock(program, blockId) {
  for (const day of getProgramDays(program)) {
    const block = Array.isArray(day.bloques) ? day.bloques.find((candidate) => candidate.id === blockId) : null

    if (block) {
      return { day, block }
    }
  }

  return null
}

function findRollbackSession(program, sessionId) {
  for (const day of getProgramDays(program)) {
    for (const block of Array.isArray(day.bloques) ? day.bloques : []) {
      const session = Array.isArray(block.sesiones) ? block.sesiones.find((candidate) => candidate.id === sessionId) : null

      if (session) {
        return { day, block, session }
      }
    }
  }

  return null
}

function buildProgramAgendaMoveRollbackOperations(previousAgenda, appliedOperations) {
  const program = getProgramDays(previousAgenda)

  return [...appliedOperations].reverse().flatMap((operation) => {
    if (operation.kind === "day") {
      const day = findRollbackDay(program, operation.id)

      if (!day) {
        return []
      }

      return [{ kind: "day", id: operation.id, payload: { orden: day.orden ?? sortByOrden(program).findIndex((candidate) => candidate.id === day.id) + 1 } }]
    }

    if (operation.kind === "block") {
      const target = findRollbackBlock(program, operation.id)

      if (!target) {
        return []
      }

      const orderedBlocks = sortByOrden(target.day.bloques || [])

      return [{ kind: "block", id: operation.id, payload: { dia_id: target.day.id, orden: target.block.orden ?? orderedBlocks.findIndex((candidate) => candidate.id === target.block.id) + 1 } }]
    }

    if (operation.kind === "session") {
      const target = findRollbackSession(program, operation.id)

      if (!target) {
        return []
      }

      const orderedSessions = sortByOrden(target.block.sesiones || [])

      return [{ kind: "session", id: operation.id, payload: { bloque_id: target.block.id, orden: target.session.orden ?? orderedSessions.findIndex((candidate) => candidate.id === target.session.id) + 1 } }]
    }

    return []
  })
}

module.exports = {
  buildProgramAgendaMoveInvalidationKeys,
  buildProgramAgendaMoveRollbackOperations,
}
