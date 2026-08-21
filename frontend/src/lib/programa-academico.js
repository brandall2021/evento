function normalizeProgramAgenda(days) {
  if (!Array.isArray(days)) return []

  return days.map((day) => ({
    ...day,
    bloques: Array.isArray(day.bloques)
      ? day.bloques.map((block) => ({
          ...block,
          sesiones: Array.isArray(block.sesiones) ? block.sesiones : [],
        }))
      : [],
  }))
}

module.exports = { normalizeProgramAgenda }
