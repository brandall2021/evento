const test = require('node:test')
const assert = require('node:assert/strict')

const { buildProgramAgendaView } = require('./programa-academico-view')

test('buildProgramAgendaView derives the first day and block selections', () => {
  const view = buildProgramAgendaView([
    {
      id: 1,
      titulo: 'Día 1',
      bloques: [
        { id: 11, titulo: 'Bloque 1', hora_inicio: '09:00', hora_fin: '10:00', sesiones: [] },
      ],
    },
  ])

  assert.equal(view.dayOptions[0].label, 'Día 1')
  assert.equal(view.blockOptions[0].label, 'Día 1 · Bloque 1')
  assert.equal(view.selectedDayId, '1')
  assert.equal(view.selectedBlockId, '11')
})
