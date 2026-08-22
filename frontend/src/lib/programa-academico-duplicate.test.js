const test = require('node:test')
const assert = require('node:assert/strict')

const { buildDuplicatedSessionPayload } = require('./programa-academico-duplicate')

test('buildDuplicatedSessionPayload copies session data and appends copy suffix', () => {
  const payload = buildDuplicatedSessionPayload({
    titulo: 'Sesión original',
    descripcion: 'Contenido',
    tipo: 'taller',
    cupos: 20,
    sala_id: 9,
    ponente_id: 3,
  }, 4)

  assert.deepEqual(payload, {
    titulo: 'Sesión original (copia)',
    descripcion: 'Contenido',
    tipo: 'taller',
    cupos: 20,
    sala_id: 9,
    ponente_id: 3,
    orden: 4,
  })
})
