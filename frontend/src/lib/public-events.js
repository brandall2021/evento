const dateFormatter = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'medium',
})

function normalizePublicEventCollection(payload) {
  if (Array.isArray(payload)) {
    return { items: payload, meta: undefined }
  }

  if (!payload) {
    return { items: [], meta: undefined }
  }

  const items = Array.isArray(payload.items) ? payload.items : []
  const limit = payload.pageSize || payload.limit || items.length || 1
  const total = payload.total ?? items.length
  const page = payload.page ?? 1

  return {
    items,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  }
}

function normalizePublicEventAgenda(payload) {
  if (!Array.isArray(payload)) return []

  return payload.map((day) => ({
    ...day,
    bloques: Array.isArray(day.bloques)
      ? day.bloques.map((block) => ({
          ...block,
          sesiones: Array.isArray(block.sesiones) ? block.sesiones : [],
        }))
      : [],
  }))
}

function getEventTypeLabel(mode) {
  if (mode === 'presencial') return 'Presencial'
  if (mode === 'virtual') return 'Virtual'
  if (mode === 'hibrido') return 'Híbrido'
  return 'Evento'
}

function getAvailabilityLabel(event) {
  if (typeof event?.available_spots === 'number') {
    return event.available_spots > 0 ? 'Cupos disponibles' : 'Sin cupos'
  }
  if (typeof event?.cupos === 'number') {
    return event.cupos > 0 ? 'Cupos disponibles' : 'Sin cupos'
  }
  return 'Cupos disponibles'
}

function getEnrollmentActionLabel(event) {
  if (typeof event?.available_spots === 'number') {
    return event.available_spots > 0 ? 'Inscribirme' : 'Sumarme a lista de espera'
  }
  if (typeof event?.cupos === 'number') {
    return event.cupos > 0 ? 'Inscribirme' : 'Sumarme a lista de espera'
  }
  return 'Inscribirme'
}

function formatPublicEventDateRange(start, end) {
  if (!start && !end) return 'Fecha a confirmar'
  if (start && end) {
    return `${dateFormatter.format(new Date(start))} - ${dateFormatter.format(new Date(end))}`
  }
  return dateFormatter.format(new Date(start || end))
}

module.exports = {
  normalizePublicEventCollection,
  normalizePublicEventAgenda,
  getEventTypeLabel,
  getAvailabilityLabel,
  getEnrollmentActionLabel,
  formatPublicEventDateRange,
}
