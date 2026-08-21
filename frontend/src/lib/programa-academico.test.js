/* eslint-disable @typescript-eslint/no-require-imports */

const test = require('node:test')
const assert = require('node:assert/strict')

const { normalizeProgramAgenda } = require('./programa-academico')

test('normalizeProgramAgenda keeps days, blocks and sessions grouped', () => {
  const result = normalizeProgramAgenda([
    {
      id: 1,
      titulo: 'Día 1',
      bloques: [
        {
          id: 11,
          titulo: 'Bloque 1',
          sesiones: [{ id: 21, titulo: 'Sesión 1' }],
        },
      ],
    },
  ])

  assert.equal(result[0].bloques[0].sesiones[0].titulo, 'Sesión 1')
})
