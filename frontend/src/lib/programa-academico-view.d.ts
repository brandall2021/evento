export function buildProgramAgendaView(program: unknown): {
  dayOptions: Array<{ value: string; label: string }>
  blockOptions: Array<{ value: string; label: string; dayId: string }>
  selectedDayId: string
  selectedBlockId: string
}
