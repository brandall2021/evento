function buildProgramAgendaView(program) {
  const days = Array.isArray(program) ? program : []

  const dayOptions = days
    .filter((day) => day?.id != null)
    .map((day) => ({ value: String(day.id), label: day.titulo || `Día ${day.id}` }))

  const blockOptions = days.flatMap((day) =>
    Array.isArray(day.bloques)
      ? day.bloques
          .filter((block) => block?.id != null)
          .map((block) => ({
            value: String(block.id),
            label: `${day.titulo || `Día ${day.id}`} · ${block.titulo || `Bloque ${block.id}`}`,
            dayId: String(day.id),
          }))
      : []
  )

  return {
    dayOptions,
    blockOptions,
    selectedDayId: dayOptions[0]?.value || "",
    selectedBlockId: blockOptions[0]?.value || "",
  }
}

module.exports = { buildProgramAgendaView }
