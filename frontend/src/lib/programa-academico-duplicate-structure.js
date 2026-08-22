function buildDuplicatedSessionPayload(session, orden) {
  return {
    titulo: `${session.titulo} (copia)`,
    descripcion: session.descripcion || undefined,
    tipo: session.tipo || undefined,
    cupos: session.cupos ?? undefined,
    sala_id: session.sala_id ?? undefined,
    ponente_id: session.ponente_id ?? undefined,
    orden,
  }
}

function buildDuplicatedBlockPayload(block, orden) {
  return {
    titulo: `${block.titulo} (copia)`,
    hora_inicio: block.hora_inicio,
    hora_fin: block.hora_fin,
    orden,
    sesiones: Array.isArray(block.sesiones)
      ? block.sesiones.map((session, index) => buildDuplicatedSessionPayload(session, index + 1))
      : [],
  }
}

function buildDuplicatedDayPayload(day, orden) {
  return {
    titulo: `${day.titulo} (copia)`,
    fecha: day.fecha,
    orden,
    bloques: Array.isArray(day.bloques)
      ? day.bloques.map((block, index) => buildDuplicatedBlockPayload(block, index + 1))
      : [],
  }
}

module.exports = { buildDuplicatedSessionPayload, buildDuplicatedBlockPayload, buildDuplicatedDayPayload }
