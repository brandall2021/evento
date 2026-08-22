const test = require('node:test')
const assert = require('node:assert/strict')

const { buildProgramAgendaMoveInvalidationKeys, buildProgramAgendaMoveRollbackOperations } = require('./programa-academico-move')

test('buildProgramAgendaMoveInvalidationKeys targets only the agenda query', () => {
  assert.deepEqual(buildProgramAgendaMoveInvalidationKeys(7), [["programa-academico", 7]])
})

test('buildProgramAgendaMoveRollbackOperations restores the original parent and order', () => {
  const rollbackOperations = buildProgramAgendaMoveRollbackOperations([
    {
      id: 1,
      orden: 1,
      bloques: [
        { id: 11, orden: 1, sesiones: [] },
      ],
    },
    {
      id: 2,
      orden: 2,
      bloques: [
        { id: 21, orden: 1, sesiones: [] },
        { id: 22, orden: 2, sesiones: [] },
      ],
    },
  ], [
    { kind: 'block', id: 21 },
    { kind: 'block', id: 22 },
  ])

  assert.deepEqual(rollbackOperations, [
    {
      kind: 'block',
      id: 22,
      payload: { dia_id: 2, orden: 2 },
    },
    {
      kind: 'block',
      id: 21,
      payload: { dia_id: 2, orden: 1 },
    },
  ])
})
