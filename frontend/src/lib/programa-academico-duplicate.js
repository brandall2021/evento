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

module.exports = { buildDuplicatedSessionPayload }
