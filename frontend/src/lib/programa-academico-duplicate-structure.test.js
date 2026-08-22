const test = require('node:test')
const assert = require('node:assert/strict')

const { buildDuplicatedDayPayload } = require('./programa-academico-duplicate-structure')

test('buildDuplicatedDayPayload copies blocks and sessions recursively', () => {
  const payload = buildDuplicatedDayPayload({
    titulo: 'Día 1',
    fecha: '2026-08-20',
    bloques: [
      {
        titulo: 'Bloque 1',
        hora_inicio: '09:00',
        hora_fin: '10:00',
        sesiones: [
          { titulo: 'Sesión 1', descripcion: 'Contenido', tipo: 'taller', cupos: 20, sala_id: 9, ponente_id: 3 },
        ],
      },
    ],
  }, 7)

  assert.equal(payload.titulo, 'Día 1 (copia)')
  assert.equal(payload.orden, 7)
  assert.equal(payload.bloques[0].titulo, 'Bloque 1 (copia)')
  assert.equal(payload.bloques[0].orden, 1)
  assert.equal(payload.bloques[0].sesiones[0].titulo, 'Sesión 1 (copia)')
  assert.equal(payload.bloques[0].sesiones[0].orden, 1)
})
